"""
Interpreter API - Web interface for VOG Player control
Provides REST API and WebSocket for real-time parameter control
"""
import os
import threading
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

from vog_player import (
    play_and_visualize,
    trigger_vog,
    state,
    WLED_CONTROLLERS,
    MODE
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Interpreter Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class PlayFileRequest(BaseModel):
    file_path: str
    mode: Optional[str] = "bloom"

class TriggerVOGRequest(BaseModel):
    text: str
    preset: Optional[str] = "GOD-THUNDER"
    token: str

class UpdateParamsRequest(BaseModel):
    bloom_scale: Optional[float] = None
    climax_threshold: Optional[float] = None
    ambient_glow: Optional[float] = None
    color_shift: Optional[float] = None
    wave_speed: Optional[float] = None

# WebSocket connections
ws_clients = []

# API Endpoints
@app.post("/play/file")
async def play_file(req: PlayFileRequest):
    """Play audio file with visualization"""
    try:
        path = Path(req.file_path)
        if not path.exists():
            raise HTTPException(404, f"File not found: {req.file_path}")

        # Play in background thread
        thread = threading.Thread(
            target=play_and_visualize,
            args=(str(path), req.mode),
            daemon=True
        )
        thread.start()

        return {"status": "playing", "file": req.file_path}

    except Exception as e:
        logger.error(f"Play error: {e}")
        raise HTTPException(500, str(e))

@app.post("/play/vog")
async def play_vog(req: TriggerVOGRequest):
    """Trigger VOG generation and playback"""
    try:
        # Run in background thread
        thread = threading.Thread(
            target=trigger_vog,
            args=(req.text, req.preset, req.token),
            daemon=True
        )
        thread.start()

        return {"status": "triggered", "text": req.text, "preset": req.preset}

    except Exception as e:
        logger.error(f"VOG trigger error: {e}")
        raise HTTPException(500, str(e))

@app.post("/params")
async def update_params(req: UpdateParamsRequest):
    """Update visualization parameters in real-time"""
    try:
        if req.bloom_scale is not None:
            state.params["bloom_scale"] = req.bloom_scale
        if req.climax_threshold is not None:
            state.params["climax_threshold"] = req.climax_threshold
        if req.ambient_glow is not None:
            state.params["ambient_glow"] = req.ambient_glow
        if req.color_shift is not None:
            state.params["color_shift"] = req.color_shift
        if req.wave_speed is not None:
            state.params["wave_speed"] = req.wave_speed

        # Broadcast to WebSocket clients
        await broadcast_params()

        return {"status": "updated", "params": state.params}

    except Exception as e:
        logger.error(f"Param update error: {e}")
        raise HTTPException(500, str(e))

@app.get("/params")
async def get_params():
    """Get current visualization parameters"""
    return {
        "params": state.params,
        "mode": MODE,
        "wled_controllers": WLED_CONTROLLERS
    }

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "ok",
        "service": "interpreter",
        "wled_controllers": len(WLED_CONTROLLERS),
        "mode": MODE
    }

# WebSocket
async def broadcast_params():
    """Broadcast parameter updates to all WebSocket clients"""
    message = {"type": "params", "data": state.params}
    for client in ws_clients[:]:
        try:
            await client.send_json(message)
        except:
            ws_clients.remove(client)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates"""
    await websocket.accept()
    ws_clients.append(websocket)
    logger.info(f"WebSocket client connected ({len(ws_clients)} total)")

    try:
        # Send initial state
        await websocket.send_json({
            "type": "params",
            "data": state.params
        })

        # Listen for messages
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "update_params":
                params = data.get("params", {})
                for key, value in params.items():
                    if key in state.params:
                        state.params[key] = value

                # Broadcast to all clients
                await broadcast_params()

    except WebSocketDisconnect:
        ws_clients.remove(websocket)
        logger.info(f"WebSocket client disconnected ({len(ws_clients)} total)")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
