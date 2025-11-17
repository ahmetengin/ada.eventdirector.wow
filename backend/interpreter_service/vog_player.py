"""
VOG Player - Interpreter Service for Pi5
Plays VOG audio with synchronized LED visualization
Supports real-time audio analysis and organic LED effects
"""
import os
import sys
import time
import asyncio
import threading
from pathlib import Path
from typing import Optional, List, Dict
import logging

import soundfile as sf
import sounddevice as sd
import numpy as np
import requests
from scipy.signal import lfilter

try:
    import aubio
    AUBIO_AVAILABLE = True
except ImportError:
    AUBIO_AVAILABLE = False
    logging.warning("aubio not available - onset detection disabled")

# Configuration
VOG_SERVICE_URL = os.environ.get("VOG_SERVICE_URL", "http://localhost:8000")
WLED_CONTROLLERS = os.environ.get("WLED_CONTROLLERS", "").split(",")
if not WLED_CONTROLLERS or WLED_CONTROLLERS == ['']:
    WLED_CONTROLLERS = [
        "http://192.168.1.101",  # Left strip
        "http://192.168.1.102",  # Center strip
        "http://192.168.1.103",  # Right strip
    ]

# Audio settings
SR = int(os.environ.get("SAMPLE_RATE", "22050"))
FRAME_MS = int(os.environ.get("FRAME_MS", "30"))
FRAME_LEN = int(SR * FRAME_MS / 1000)

# Visual settings
MODE = os.environ.get("VISUAL_MODE", "bloom")  # "wave" or "bloom"
MAX_BRI = 255
AMBIENT_GLOW = 0.08

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# State
class VisualState:
    """Manages visual effects state"""
    def __init__(self):
        # Wave mode
        self.head_pos = 0.0
        self.head_speed = 0.0
        self.head_width = 0.08

        # Bloom mode
        self.blooms = []

        # UX
        self.anticipation_val = AMBIENT_GLOW
        self.word_bloom_scale = 1.0
        self.climax_threshold = 0.8

        # Smoothing
        self.smooth_lvl = 0.0
        self.peak_val = 0.0
        self.peak_ts = 0.0

        # Live parameters (can be updated via API)
        self.params = {
            "bloom_scale": 1.0,
            "climax_threshold": 0.8,
            "ambient_glow": 0.08,
            "color_shift": 0.5,
            "wave_speed": 1.0,
        }

state = VisualState()

# Audio Analysis
def rms(samples: np.ndarray) -> float:
    """Calculate RMS (root mean square) of audio samples"""
    return float(np.sqrt(np.mean(np.square(samples.astype(np.float32)))))

def spectral_centroid(samples: np.ndarray, sr: int) -> float:
    """Calculate spectral centroid for color mapping"""
    S = np.abs(np.fft.rfft(samples))
    freqs = np.fft.rfftfreq(len(samples), 1/sr)
    total = S.sum()
    if total == 0:
        return 0.0
    return float((freqs * S).sum() / total)

def hue_from_centroid(centroid: float, sr: int, shift: float = 0.5) -> tuple:
    """Map spectral centroid to RGB color"""
    maxc = sr / 2
    t = np.clip(centroid / maxc, 0, 1)
    t = (t + shift) % 1.0  # Apply color shift

    # Warm (amber) -> cool (blue/white)
    warm = np.array([255, 140, 40])
    cool = np.array([180, 220, 255])
    color = (1 - t) * warm + t * cool
    return tuple(color.astype(int))

def smoother(prev: float, new: float, attack: float = 0.18, release: float = 0.06) -> float:
    """Smooth value changes with attack/release"""
    alpha = attack if new > prev else release
    return prev * (1 - alpha) + new * alpha

# LED Control
def send_wled(base_url: str, brightness: int, color: tuple, timeout: float = 0.2):
    """Send brightness and color to WLED controller"""
    try:
        brightness = int(np.clip(brightness, 0, MAX_BRI))
        payload = {
            "seg": [{
                "id": 0,
                "bri": brightness,
                "col": [[color[0], color[1], color[2]]],
                "fx": 0
            }],
            "transition": 20
        }
        requests.post(f"{base_url}/json/state", json=payload, timeout=timeout)
    except Exception as e:
        logger.debug(f"WLED send error: {e}")

# Visual Effects
def add_bloom(center: float, color: tuple, scale: float = 1.0):
    """Add a bloom effect at specified position"""
    state.blooms.append({
        "center": center,
        "radius": 0.02 * scale,
        "life": 1.0,
        "color": color
    })

def update_blooms(dt: float):
    """Update bloom animations"""
    for bloom in state.blooms:
        bloom["radius"] += dt * 0.6
        bloom["life"] -= dt * 0.9

    # Remove dead blooms
    while state.blooms and state.blooms[0]["life"] <= 0:
        state.blooms.pop(0)

def wave_step(dt: float, energy: float, onset_strength: float, pitch_hz: float):
    """Update wave sweep animation"""
    pitch_factor = np.clip((pitch_hz / 300.0), 0.5, 2.0) if pitch_hz > 0 else 1.0
    state.head_speed = state.head_speed * 0.7 + onset_strength * 1.5 * pitch_factor * state.params["wave_speed"]
    state.head_pos += state.head_speed * dt
    state.head_pos %= 1.0
    state.head_width = 0.04 + 0.2 * np.clip(energy * 3.0, 0, 1)

def compute_strip_brightness_wave(strip_index: int) -> float:
    """Calculate brightness for wave mode"""
    seg_center = (strip_index + 0.5) / 3.0
    d = abs(((state.head_pos - seg_center + 0.5) % 1.0) - 0.5)
    sigma = state.head_width
    val = np.exp(-(d**2) / (2 * sigma * sigma))
    return float(val)

def compute_strip_brightness_bloom(strip_index: int) -> float:
    """Calculate brightness for bloom mode"""
    seg_center = (strip_index + 0.5) / 3.0
    val = 0.0
    for bloom in state.blooms:
        d = abs(seg_center - bloom["center"])
        val += np.clip(np.exp(-(d * 6.0)**2) * bloom["life"], 0, 1)
    return float(np.clip(val, 0, 1))

# Main Playback Engine
def play_and_visualize(file_path: str, mode: str = MODE):
    """Play audio and drive LED visualization"""
    try:
        # Load audio
        data, sr = sf.read(file_path, dtype='float32')
        if data.ndim > 1:
            data = np.mean(data, axis=1)  # Convert to mono

        logger.info(f"Playing {file_path} ({len(data)/sr:.2f}s, {sr}Hz)")

        # Start playback in background thread
        play_thread = threading.Thread(
            target=lambda: sd.play(data, sr, blocking=True),
            daemon=True
        )
        play_thread.start()

        # Setup aubio if available
        onset_detector = None
        pitch_detector = None
        if AUBIO_AVAILABLE:
            onset_detector = aubio.onset("default", win_s=FRAME_LEN*2, hop_s=FRAME_LEN)
            pitch_detector = aubio.pitch("yinfft", FRAME_LEN*2, FRAME_LEN, sr)
            pitch_detector.set_unit("Hz")
            pitch_detector.set_silence(-40)

        # Analysis loop
        idx = 0
        N = len(data)

        while idx + FRAME_LEN < N:
            frame = data[idx:idx + FRAME_LEN]
            idx += FRAME_LEN

            # Analyze frame
            energy = np.clip(rms(frame) * 10.0, 0, 1)
            centroid = spectral_centroid(frame, sr)
            color = hue_from_centroid(centroid, sr, state.params["color_shift"])

            # Onset detection
            onset_strength = 0.0
            if onset_detector:
                is_onset = onset_detector(frame.astype(np.float32))
                if is_onset:
                    onset_strength = 1.0
                    # Create bloom at position based on spectral centroid
                    center_pos = np.clip(centroid / (sr/2), 0, 1)
                    add_bloom(center_pos, color, state.params["bloom_scale"])

            # Pitch detection
            pitch = 0.0
            if pitch_detector:
                pitch = float(pitch_detector(frame.astype(np.float32))[0])
                if pitch < 0:
                    pitch = 0.0

            # Update animations
            dt = FRAME_MS / 1000.0
            if mode == "wave":
                wave_step(dt, energy, onset_strength, pitch)
            else:
                update_blooms(dt)

            # Compute per-strip brightness
            strip_values = []
            for i in range(3):
                if mode == "wave":
                    val = compute_strip_brightness_wave(i)
                else:
                    val = compute_strip_brightness_bloom(i)

                # Add ambient glow
                val = np.clip(val + state.params["ambient_glow"], 0, 1)

                # Climax flash on strong onset
                if onset_strength > state.params["climax_threshold"]:
                    val = min(1.0, val + 0.2)

                strip_values.append(int(val * MAX_BRI))

            # Send to WLED controllers
            for i, controller in enumerate(WLED_CONTROLLERS[:3]):
                send_wled(controller, strip_values[i], color)

            time.sleep(dt)

        # Fade out
        logger.info("Fading out...")
        for t in np.linspace(1.0, 0.0, 12):
            for i, controller in enumerate(WLED_CONTROLLERS[:3]):
                send_wled(controller, int(strip_values[i] * t), (50, 50, 80))
            time.sleep(0.03)

        logger.info("Playback complete")

    except Exception as e:
        logger.error(f"Playback error: {e}")
        raise

# VOG Client
def download_vog(cue_id: str, token: str) -> Optional[Path]:
    """Download VOG audio from service"""
    try:
        # Check status
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{VOG_SERVICE_URL}/v1/vog/status/{cue_id}", headers=headers)
        resp.raise_for_status()
        data = resp.json()

        if data["status"] != "ready":
            logger.warning(f"VOG not ready: {data['status']}")
            return None

        # Download file
        url = f"{VOG_SERVICE_URL}{data['url']}"
        logger.info(f"Downloading VOG: {url}")

        file_resp = requests.get(url, stream=True)
        file_resp.raise_for_status()

        # Save to temp file
        cache_dir = Path("./vog_cache")
        cache_dir.mkdir(exist_ok=True)
        file_path = cache_dir / f"{cue_id}.wav"

        with open(file_path, 'wb') as f:
            for chunk in file_resp.iter_content(chunk_size=65536):
                f.write(chunk)

        logger.info(f"Downloaded: {file_path}")
        return file_path

    except Exception as e:
        logger.error(f"Download failed: {e}")
        return None

def trigger_vog(text: str, preset: str = "GOD-THUNDER", token: str = None) -> bool:
    """Trigger VOG generation and playback"""
    try:
        if not token:
            logger.error("No auth token provided")
            return False

        # Request VOG generation
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "text": text,
            "preset": preset,
            "priority": "standard"
        }

        logger.info(f"Requesting VOG: '{text}' ({preset})")
        resp = requests.post(f"{VOG_SERVICE_URL}/v1/vog", json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

        cue_id = data["cue_id"]
        logger.info(f"VOG queued: {cue_id}")

        # Poll until ready (with timeout)
        max_wait = 30  # seconds
        start = time.time()
        while time.time() - start < max_wait:
            status_resp = requests.get(f"{VOG_SERVICE_URL}/v1/vog/status/{cue_id}", headers=headers)
            status_resp.raise_for_status()
            status = status_resp.json()

            if status["status"] == "ready":
                # Download and play
                file_path = download_vog(cue_id, token)
                if file_path:
                    play_and_visualize(str(file_path))
                    return True
                return False

            time.sleep(0.5)

        logger.error("VOG generation timeout")
        return False

    except Exception as e:
        logger.error(f"VOG trigger failed: {e}")
        return False

# CLI
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="VOG Player - Interpreter Service")
    parser.add_argument("--file", help="Play audio file directly")
    parser.add_argument("--text", help="Generate and play VOG text")
    parser.add_argument("--preset", default="GOD-THUNDER", help="VOG preset")
    parser.add_argument("--token", help="Auth token")
    parser.add_argument("--mode", default="bloom", choices=["wave", "bloom"], help="Visual mode")
    parser.add_argument("--wled", nargs="+", help="WLED controller URLs")

    args = parser.parse_args()

    # Override WLED controllers if provided
    if args.wled:
        WLED_CONTROLLERS[:] = args.wled

    logger.info(f"VOG Player starting (mode={args.mode})")
    logger.info(f"WLED controllers: {WLED_CONTROLLERS}")

    if args.file:
        # Play file directly
        play_and_visualize(args.file, mode=args.mode)

    elif args.text:
        # Generate and play VOG
        if not args.token:
            logger.error("--token required for VOG generation")
            sys.exit(1)
        trigger_vog(args.text, args.preset, args.token)

    else:
        parser.print_help()
