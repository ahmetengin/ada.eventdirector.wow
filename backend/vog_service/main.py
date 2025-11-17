"""
VOG Service - Cloud TTS + Audio Effects Pipeline
Generates high-quality Voice of God audio with cinematic effects
"""
import os
import uuid
import hashlib
import subprocess
import asyncio
from pathlib import Path
from typing import Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Header, BackgroundTasks, WebSocket
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
import logging

# Configuration
SECRET = os.environ.get("VOG_JWT_SECRET", "change_this_secret_in_production")
CACHE_DIR = Path("./cache")
CACHE_DIR.mkdir(exist_ok=True)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VOG Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class VOGRequest(BaseModel):
    cue_id: Optional[str] = None
    text: str
    preset: Optional[str] = "GOD-THUNDER"
    voice: Optional[str] = "default"
    priority: Optional[str] = "standard"  # immediate | standard | background
    target: Optional[str] = None
    webhook_url: Optional[str] = None

class VOGResponse(BaseModel):
    status: str  # queued | rendering | ready | error
    cue_id: str
    url: Optional[str] = None
    message: Optional[str] = None
    estimated_duration: Optional[float] = None

# Preset configurations
PRESETS = {
    "GOD-THUNDER": {
        "pitch": -2,
        "speed": 0.92,
        "filters": [
            "bass=g=6",
            "treble=g=-3:f=2500",
            "acompressor=threshold=-18dB:ratio=4:attack=5:release=120:makeup=4dB",
            "aecho=0.12:0.11:0.6:0.15",
            "stereowiden=0.2",
            "loudnorm=I=-14:LRA=7:TP=-1.5"
        ]
    },
    "HALL-ANNOUNCE": {
        "pitch": 0,
        "speed": 1.0,
        "filters": [
            "bass=g=4",
            "treble=g=2:f=4000",
            "acompressor=threshold=-16dB:ratio=3:attack=3:release=100:makeup=3dB",
            "aecho=0.08:0.09:0.5:0.12",
            "loudnorm=I=-16:LRA=7:TP=-1.5"
        ]
    },
    "WHISPER-COMMAND": {
        "pitch": -4,
        "speed": 0.88,
        "filters": [
            "lowpass=f=10000",
            "aecho=0.15:0.14:0.8:0.25",
            "stereowiden=0.35",
            "loudnorm=I=-18:LRA=9:TP=-2"
        ]
    }
}

# JWT utilities
def create_token(subject: str, roles: list[str], expires_delta: timedelta = timedelta(minutes=30)) -> str:
    """Create JWT token"""
    payload = {
        "iss": "vog-service",
        "sub": subject,
        "roles": roles,
        "exp": datetime.utcnow() + expires_delta
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def verify_jwt(token: str) -> dict:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload
    except JWTError as e:
        logger.error(f"JWT verification failed: {e}")
        return None

# TTS Synthesis
def synthesize_tts(text: str, voice: str, out_path: Path) -> bool:
    """
    Synthesize TTS audio.
    PLACEHOLDER: Replace with your TTS provider (ElevenLabs, OpenAI, Google, Coqui, etc.)

    For demo, we use espeak (install: apt-get install espeak)
    For production, replace with:
    - ElevenLabs API
    - OpenAI TTS API
    - Google Cloud TTS
    - Coqui TTS
    - Piper TTS (fast, local)
    """
    try:
        # Demo: espeak (replace this in production!)
        cmd = ["espeak", "-w", str(out_path), "-s", "150", "-p", "40", text]
        subprocess.run(cmd, check=True, capture_output=True)
        return True
    except FileNotFoundError:
        logger.warning("espeak not found, creating silent placeholder")
        # Fallback: create a silent file for demo
        cmd = [
            "ffmpeg", "-f", "lavfi", "-i",
            "anullsrc=channel_layout=stereo:sample_rate=22050",
            "-t", "2", "-q:a", "9", "-y", str(out_path)
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        return True
    except Exception as e:
        logger.error(f"TTS synthesis failed: {e}")
        return False

# Audio Effects
def apply_effects(in_wav: Path, out_wav: Path, preset: str) -> bool:
    """Apply audio effects using ffmpeg"""
    try:
        config = PRESETS.get(preset, PRESETS["GOD-THUNDER"])

        # Build ffmpeg filter chain
        filters = ",".join(config["filters"])

        # Apply pitch shift if needed
        if config["pitch"] != 0:
            pitch_filter = f"asetrate=22050*2^({config['pitch']}/12),aresample=22050"
            filters = f"{pitch_filter},{filters}"

        # Apply speed change if needed
        if config["speed"] != 1.0:
            speed_filter = f"atempo={config['speed']}"
            filters = f"{filters},{speed_filter}"

        cmd = [
            "ffmpeg", "-y", "-i", str(in_wav),
            "-af", filters,
            "-ar", "22050",
            "-ac", "2",
            str(out_wav)
        ]

        logger.info(f"Applying effects: {' '.join(cmd)}")
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        logger.info(f"Effects applied successfully")
        return True

    except subprocess.CalledProcessError as e:
        logger.error(f"ffmpeg error: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Effects processing failed: {e}")
        return False

# Background processing
async def process_vog_audio(cue_id: str, text: str, voice: str, preset: str):
    """Background task to generate and process VOG audio"""
    try:
        cache_key = hashlib.sha256(f"{cue_id}{text}{preset}".encode()).hexdigest()
        raw_wav = CACHE_DIR / f"{cache_key}.raw.wav"
        final_wav = CACHE_DIR / f"{cache_key}.final.wav"

        # Synthesize TTS
        logger.info(f"Synthesizing TTS for cue {cue_id}")
        if not synthesize_tts(text, voice, raw_wav):
            raise Exception("TTS synthesis failed")

        # Apply effects
        logger.info(f"Applying effects preset '{preset}' for cue {cue_id}")
        if not apply_effects(raw_wav, final_wav, preset):
            raise Exception("Effects processing failed")

        # Cleanup raw file
        raw_wav.unlink(missing_ok=True)

        logger.info(f"VOG audio ready: {final_wav}")

    except Exception as e:
        logger.error(f"Failed to process VOG audio: {e}")

# API Endpoints
@app.post("/v1/vog", response_model=VOGResponse)
async def create_vog(
    req: VOGRequest,
    background_tasks: BackgroundTasks,
    authorization: str = Header(None)
):
    """Create VOG audio with TTS + effects"""

    # Verify JWT
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid Authorization header")

    token = authorization.split("Bearer ")[1]
    payload = verify_jwt(token)

    if not payload or "roles" not in payload:
        raise HTTPException(403, "Invalid token")

    # Check permissions
    allowed_roles = {"director", "operator", "admin"}
    user_roles = set(payload.get("roles", []))
    if not user_roles.intersection(allowed_roles):
        raise HTTPException(403, "Insufficient permissions")

    # Generate cue ID
    cue_id = req.cue_id or str(uuid.uuid4())

    # Check cache
    cache_key = hashlib.sha256(f"{cue_id}{req.text}{req.preset}".encode()).hexdigest()
    final_wav = CACHE_DIR / f"{cache_key}.final.wav"

    if final_wav.exists():
        logger.info(f"Cache hit for cue {cue_id}")
        return VOGResponse(
            status="ready",
            cue_id=cue_id,
            url=f"/cache/{final_wav.name}"
        )

    # Queue background processing
    background_tasks.add_task(process_vog_audio, cue_id, req.text, req.voice, req.preset)

    return VOGResponse(
        status="queued",
        cue_id=cue_id,
        message="VOG audio is being generated"
    )

@app.get("/cache/{file_name}")
async def serve_cache(file_name: str):
    """Serve cached audio files"""
    path = CACHE_DIR / file_name
    if not path.exists() or not path.is_file():
        raise HTTPException(404, "File not found")

    return FileResponse(
        path,
        media_type="audio/wav",
        filename=file_name
    )

@app.get("/v1/vog/status/{cue_id}")
async def get_vog_status(cue_id: str):
    """Check VOG generation status"""
    # Find matching cache files
    for f in CACHE_DIR.glob("*.final.wav"):
        cache_key = f.stem.replace(".final", "")
        test_key = hashlib.sha256(f"{cue_id}".encode()).hexdigest()
        if cache_key.startswith(test_key[:16]):
            return VOGResponse(
                status="ready",
                cue_id=cue_id,
                url=f"/cache/{f.name}"
            )

    return VOGResponse(
        status="rendering",
        cue_id=cue_id
    )

@app.post("/v1/auth/token")
async def get_token(subject: str = "demo", roles: list[str] = ["director"]):
    """Generate JWT token (for testing only - remove in production!)"""
    token = create_token(subject, roles)
    return {"access_token": token, "token_type": "bearer"}

@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok", "service": "vog", "cache_files": len(list(CACHE_DIR.glob("*.final.wav")))}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
