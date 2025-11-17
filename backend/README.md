# VOG (Voice of God) System - Pi5 Audio Pipeline

Complete implementation of a cinematic Voice of God system with real-time TTS, audio effects, and synchronized LED visualization.

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│ Event Director  │─────>│  VOG Service     │─────>│  Interpreter    │
│   (Pi5-A)       │      │  (Cloud/Server)  │      │    (Pi5-B)      │
│                 │      │                  │      │                 │
│ - Trigger VOG   │      │ - TTS Generation │      │ - Audio Playback│
│ - Manage Cues   │      │ - Audio Effects  │      │ - LED Control   │
│ - Control Panel │      │ - Cache/Queue    │      │ - Visualization │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                                            │
                                                            v
                                                    ┌──────────────┐
                                                    │ WLED/LEDs    │
                                                    │ 3 × Strips   │
                                                    └──────────────┘
```

## Services

### 1. VOG Service (Cloud/Server)

**Purpose**: Generate high-quality TTS with cinematic audio effects

**Location**: `backend/vog_service/`

**Features**:
- Multiple TTS backends (ElevenLabs, OpenAI, Google, Coqui, Piper)
- Audio effect presets (GOD-THUNDER, HALL-ANNOUNCE, WHISPER-COMMAND)
- JWT authentication
- Caching for instant playback
- Priority queuing

**Tech Stack**:
- FastAPI
- ffmpeg (audio processing)
- python-jose (JWT)

### 2. Interpreter Service (Pi5)

**Purpose**: Play audio with synchronized LED visualization

**Location**: `backend/interpreter_service/`

**Features**:
- Real-time audio analysis (RMS, spectral centroid, onset detection)
- Two visualization modes: Wave Sweep and Vocal Bloom
- Live parameter control via WebSocket
- WLED integration (3 LED strips)
- Organic, cinematic LED effects

**Tech Stack**:
- soundfile, sounddevice (audio I/O)
- numpy, scipy (DSP)
- aubio (onset/pitch detection)
- FastAPI + WebSocket (control API)

## Installation

### VOG Service (Cloud/Server)

```bash
cd backend/vog_service

# Install system dependencies
sudo apt-get update
sudo apt-get install -y ffmpeg espeak

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export VOG_JWT_SECRET="your-secret-key-here"

# Run service
python main.py
# Or with uvicorn:
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Interpreter Service (Pi5)

```bash
cd backend/interpreter_service

# Install system dependencies (Pi5/Debian)
sudo apt-get update
sudo apt-get install -y \
    python3-numpy \
    python3-scipy \
    libportaudio2 \
    libsndfile1 \
    ffmpeg

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export VOG_SERVICE_URL="http://your-vog-service:8000"
export WLED_CONTROLLERS="http://192.168.1.101,http://192.168.1.102,http://192.168.1.103"
export VISUAL_MODE="bloom"  # or "wave"

# Run service
python api.py
# Or with uvicorn:
uvicorn api:app --host 0.0.0.0 --port 8001
```

## Docker Deployment

### VOG Service

```bash
cd backend/vog_service
docker build -t vog-service .
docker run -d \
  -p 8000:8000 \
  -e VOG_JWT_SECRET="your-secret-key" \
  --name vog-service \
  vog-service
```

### Docker Compose (Full Stack)

```yaml
version: '3.8'

services:
  vog-service:
    build: ./backend/vog_service
    ports:
      - "8000:8000"
    environment:
      - VOG_JWT_SECRET=change-this-secret
    volumes:
      - vog-cache:/app/cache

  interpreter:
    build: ./backend/interpreter_service
    ports:
      - "8001:8001"
    environment:
      - VOG_SERVICE_URL=http://vog-service:8000
      - WLED_CONTROLLERS=http://192.168.1.101,http://192.168.1.102,http://192.168.1.103
      - VISUAL_MODE=bloom
    devices:
      - /dev/snd:/dev/snd  # Audio device
    privileged: true

volumes:
  vog-cache:
```

## Configuration

### VOG Presets

#### GOD-THUNDER
- **Use case**: Dramatic, powerful announcements
- **Effect**: Deep voice, heavy reverb, bass boost, wide stereo
- **Pitch**: -2 semitones
- **Speed**: 0.92x

#### HALL-ANNOUNCE
- **Use case**: Clear broadcast announcements
- **Effect**: Natural voice, moderate reverb, clarity boost
- **Pitch**: 0 semitones
- **Speed**: 1.0x

#### WHISPER-COMMAND
- **Use case**: Mystical, atmospheric moments
- **Effect**: Low whisper, long reverb tail, filtered highs
- **Pitch**: -4 semitones
- **Speed**: 0.88x

### LED Visual Modes

#### Wave Sweep
- Continuous wave motion across 3 LED strips
- Speed reacts to pitch and onsets
- Creates flowing, directional effect

#### Vocal Bloom (Recommended)
- Bloom explosions on word starts
- Organic expansion and fade
- Color shifts with frequency content
- More cinematic and dramatic

### Visual Parameters (Live Adjustable)

| Parameter | Range | Description |
|-----------|-------|-------------|
| `bloom_scale` | 0.1 - 2.0 | Size of bloom explosions |
| `climax_threshold` | 0.3 - 1.0 | Onset strength for flash effects |
| `ambient_glow` | 0.0 - 0.3 | Base brightness when silent |
| `color_shift` | 0.0 - 1.0 | Hue rotation (warm ↔ cool) |
| `wave_speed` | 0.1 - 3.0 | Wave sweep velocity (wave mode) |

## API Reference

### VOG Service API

#### POST `/v1/vog`
Generate VOG audio

**Headers**:
- `Authorization: Bearer <JWT>`

**Body**:
```json
{
  "text": "Welcome to the event",
  "preset": "GOD-THUNDER",
  "priority": "standard"
}
```

**Response**:
```json
{
  "status": "ready",
  "cue_id": "abc123",
  "url": "/cache/abc123.final.wav"
}
```

#### GET `/v1/vog/status/{cue_id}`
Check generation status

#### POST `/v1/auth/token`
Get JWT token (development only!)

### Interpreter API

#### POST `/play/vog`
Trigger VOG playback

**Body**:
```json
{
  "text": "Welcome to the event",
  "preset": "GOD-THUNDER",
  "token": "JWT-token-here"
}
```

#### POST `/params`
Update visual parameters

**Body**:
```json
{
  "bloom_scale": 1.5,
  "color_shift": 0.7
}
```

#### GET `/params`
Get current parameters

#### WebSocket `/ws`
Real-time parameter updates

**Message format**:
```json
{
  "type": "update_params",
  "params": {
    "bloom_scale": 1.2
  }
}
```

## Hardware Setup

### Pi5 Configuration

**Audio Output**:
- HDMI audio (if using HDMI display)
- 3.5mm jack
- USB audio interface (recommended for quality)
- Dante/AES67 (professional AV)

**Network**:
- Gigabit Ethernet (recommended)
- Cat6 cable to LED controllers
- Low-latency network switch

### WLED LED Controllers

**Hardware**:
- 3 × ESP32 (or ESP8266)
- 3 × WS2812B/SK6812 LED strips
- 5V power supply (calculate per strip)

**WLED Setup**:
1. Flash WLED firmware: https://install.wled.me
2. Configure WiFi/Ethernet
3. Set static IP addresses (or use mDNS)
4. Note controller URLs for configuration

**Wiring**:
```
ESP32 → LED Strip
GND   → GND
5V    → 5V (via PSU)
GPIO2 → DIN
```

**Power calculation**:
- Each WS2812B LED: ~60mA @ full white
- 60 LEDs × 60mA = 3.6A per strip
- Add 20% headroom: ~4.3A per strip
- Total for 3 strips: ~13A @ 5V = 65W PSU minimum

### Network Setup

**Recommended topology**:
```
Internet
   │
   └── Router
        ├── Pi5-A (Event Director) - 192.168.1.10
        ├── Pi5-B (Interpreter)    - 192.168.1.11
        ├── VOG Service (Cloud)    - vog.example.com
        ├── WLED #1                - 192.168.1.101
        ├── WLED #2                - 192.168.1.102
        └── WLED #3                - 192.168.1.103
```

## Frontend Integration

The React frontend (`components/VOGControlPanel.tsx`) provides:
- VOG text input
- Preset selection
- Real-time parameter sliders
- WebSocket-based live control
- Status monitoring

**Environment variables** (`.env`):
```
VITE_VOG_SERVICE_URL=http://your-server:8000
VITE_INTERPRETER_URL=http://pi5-interpreter:8001
```

## Usage Examples

### CLI (Direct)

**Play WAV file**:
```bash
python vog_player.py --file test.wav --mode bloom
```

**Generate and play VOG**:
```bash
# Get token
TOKEN=$(curl -X POST http://localhost:8000/v1/auth/token | jq -r .access_token)

# Trigger VOG
python vog_player.py \
  --text "Welcome to the KITES gala" \
  --preset GOD-THUNDER \
  --token "$TOKEN" \
  --mode bloom
```

### API (Python)

```python
from services.vogService import vogService

# Generate VOG
await vogService.playVOG(
    text="Welcome to the event",
    preset="GOD-THUNDER"
)

# Update parameters
await vogService.updateParams({
    "bloom_scale": 1.5,
    "color_shift": 0.7
})
```

### React Component

```tsx
import { VOGControlPanel } from './components/VOGControlPanel';

<VOGControlPanel
  interpreterUrl="http://pi5:8001"
  vogServiceUrl="http://server:8000"
/>
```

## Troubleshooting

### Audio Issues

**No sound**:
```bash
# Check ALSA devices
aplay -l

# Set default device
export AUDIODEV=hw:0,0

# Test playback
aplay test.wav
```

**Crackling/glitches**:
- Increase buffer size in sounddevice
- Reduce network latency
- Use USB audio interface

### LED Issues

**LEDs not responding**:
1. Check WLED web interface: `http://192.168.1.101`
2. Verify network connectivity: `ping 192.168.1.101`
3. Check WLED segment configuration
4. Verify power supply

**Delayed LED response**:
- Reduce HTTP timeout in `send_wled()`
- Use UDP instead of HTTP (modify code)
- Check network switch quality

### Performance

**Pi5 CPU usage high**:
- Use lighter TTS model
- Reduce analysis frame rate
- Disable aubio if not needed

**Network congestion**:
- Use dedicated VLAN for AV traffic
- Enable QoS on router
- Use wired Ethernet

## Advanced: TTS Provider Setup

### ElevenLabs

```python
# In vog_service/main.py synthesize_tts()
import requests

def synthesize_tts(text: str, voice: str, out_path: Path) -> bool:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}"
    headers = {
        "xi-api-key": os.environ["ELEVENLABS_API_KEY"]
    }
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1"
    }
    resp = requests.post(url, json=data, headers=headers)
    with open(out_path, 'wb') as f:
        f.write(resp.content)
    return True
```

### OpenAI TTS

```python
from openai import OpenAI
client = OpenAI()

def synthesize_tts(text: str, voice: str, out_path: Path) -> bool:
    response = client.audio.speech.create(
        model="tts-1-hd",
        voice="onyx",
        input=text
    )
    response.stream_to_file(out_path)
    return True
```

### Piper (Local, Fast)

```bash
# Install Piper
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz
tar xzf piper_amd64.tar.gz

# Download model
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
```

```python
def synthesize_tts(text: str, voice: str, out_path: Path) -> bool:
    cmd = [
        "./piper/piper",
        "--model", "en_US-lessac-medium.onnx",
        "--output_file", str(out_path)
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    proc.communicate(input=text.encode())
    return proc.returncode == 0
```

## Production Checklist

- [ ] Change `VOG_JWT_SECRET` to strong random value
- [ ] Remove `/v1/auth/token` endpoint (or protect it)
- [ ] Configure CORS properly (restrict origins)
- [ ] Set up HTTPS/TLS for VOG Service
- [ ] Configure firewall rules
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Implement rate limiting
- [ ] Set up log rotation
- [ ] Configure backup for cache directory
- [ ] Test failover scenarios
- [ ] Document your TTS provider setup
- [ ] LED power supply safety check
- [ ] Network isolation for AV traffic

## License

Part of Event Director AI project.

## Support

For issues and questions, see main project README.
