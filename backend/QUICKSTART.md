# VOG System - Quick Start Guide

Get the Voice of God system running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- OR Python 3.9+ with pip
- 3 × WLED controllers (optional, for LED effects)

## Option 1: Docker (Recommended)

### 1. Configure Environment

```bash
cd backend
cp ../.env.example .env
# Edit .env and set:
# - VOG_JWT_SECRET (random secure string)
# - WLED_CONTROLLERS (your LED controller IPs)
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Verify

```bash
# Check services are running
docker-compose ps

# Check health
curl http://localhost:8000/health  # VOG Service
curl http://localhost:8001/health  # Interpreter
```

### 4. Get Auth Token

```bash
curl -X POST http://localhost:8000/v1/auth/token | jq
# Save the "access_token"
```

### 5. Test VOG

```bash
TOKEN="your-token-here"

curl -X POST http://localhost:8001/play/vog \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to the event",
    "preset": "GOD-THUNDER",
    "token": "'$TOKEN'"
  }'
```

You should hear the Voice of God and see LED effects (if WLED is configured)!

## Option 2: Local Python (Development)

### 1. Start VOG Service

```bash
cd backend/vog_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install system deps
sudo apt-get install ffmpeg espeak

# Run
export VOG_JWT_SECRET="dev-secret"
python main.py
```

### 2. Start Interpreter (separate terminal)

```bash
cd backend/interpreter_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install system deps
sudo apt-get install portaudio19-dev libsndfile1 ffmpeg

# Run
export VOG_SERVICE_URL="http://localhost:8000"
export WLED_CONTROLLERS="http://192.168.1.101,http://192.168.1.102,http://192.168.1.103"
python api.py
```

### 3. Start Frontend (separate terminal)

```bash
cd ..  # back to project root
npm install
cp .env.example .env
# Edit .env and set API URLs

npm run dev
```

Open http://localhost:5173 and click "VOG Control" tab!

## Frontend Usage

1. Navigate to VOG Control tab
2. Enter text (e.g., "Welcome to the KITES gala")
3. Select preset (God Thunder, Hall Announce, or Whisper Command)
4. Click "Trigger VOG"
5. Adjust visual parameters in real-time:
   - Bloom Scale: size of light blooms
   - Climax Threshold: sensitivity of flash effects
   - Ambient Glow: base LED brightness
   - Color Shift: warm ↔ cool color tone

## WLED Setup (Optional but Recommended)

### Flash WLED to ESP32

1. Go to https://install.wled.me
2. Connect ESP32 via USB
3. Click "Install"
4. Follow prompts

### Configure WLED

1. Connect to WLED WiFi AP
2. Configure your WiFi network
3. Set static IP (or note DHCP IP)
4. Access web UI: http://[WLED-IP]
5. Go to Config → LED Preferences:
   - LED count: your strip length (e.g., 60)
   - GPIO: 2 (or your wiring)
   - LED type: WS2812B

### Wire LED Strip

```
ESP32         LED Strip      Power
------        ---------      ------
GND    ────── GND     ────── GND
GPIO2  ────── DIN
              5V      ────── 5V (separate PSU!)
```

**Important**: Use external 5V PSU for LED power! Do NOT power long strips from ESP32.

### Test WLED

```bash
# Set brightness to 128, color to red
curl -X POST http://192.168.1.101/json/state \
  -H "Content-Type: application/json" \
  -d '{"seg":[{"bri":128,"col":[[255,0,0]]}]}'
```

If LEDs turn red, you're good to go!

## Troubleshooting

### "No module named 'aubio'"

Aubio is optional. If install fails:
```bash
# Disable aubio in vog_player.py (it will skip onset detection)
# Or install system package:
sudo apt-get install python3-aubio
```

### "No sound output"

```bash
# List audio devices
aplay -l

# Test playback
aplay /usr/share/sounds/alsa/Front_Center.wav

# Set default device (if needed)
export AUDIODEV=hw:1,0  # adjust card/device numbers
```

### "WLED not responding"

- Check WLED is powered on and connected to network
- Ping the IP: `ping 192.168.1.101`
- Access web UI in browser: http://192.168.1.101
- Check firewall rules

### "Authentication failed"

- Ensure you're using valid JWT token
- Token expires after 30 minutes by default
- Get new token from `/v1/auth/token` endpoint

## Next Steps

- Read full documentation: `backend/README.md`
- Customize audio presets in `vog_service/main.py`
- Tune visual parameters for your LED setup
- Set up production TTS provider (ElevenLabs, OpenAI, etc.)
- Configure HTTPS/SSL for production deployment

## Demo Script

```bash
# Terminal 1: Start services
cd backend && docker-compose up

# Terminal 2: Get token and trigger sequence
TOKEN=$(curl -s -X POST http://localhost:8000/v1/auth/token | jq -r .access_token)

# Announce event start
curl -X POST http://localhost:8001/play/vog \
  -H "Content-Type: application/json" \
  -d '{"text":"Ladies and gentlemen, welcome to the gala.","preset":"GOD-THUNDER","token":"'$TOKEN'"}'

sleep 10

# Countdown
for i in 3 2 1; do
  curl -X POST http://localhost:8001/play/vog \
    -H "Content-Type: application/json" \
    -d '{"text":"'$i'","preset":"HALL-ANNOUNCE","token":"'$TOKEN'"}'
  sleep 2
done

# Event start
curl -X POST http://localhost:8001/play/vog \
  -H "Content-Type: application/json" \
  -d '{"text":"Let the show begin.","preset":"WHISPER-COMMAND","token":"'$TOKEN'"}'
```

Enjoy your cinematic Voice of God system! 🎭✨
