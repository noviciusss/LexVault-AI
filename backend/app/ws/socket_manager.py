import socketio
import logging
from typing import Dict, Any

logger = logging.getLogger("lexvault.ws")

# Create Async Server with CORS enabled for frontend ports
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

# ASGI application that wraps socketio
socket_app = socketio.ASGIApp(sio, socketio_path="/ws/socket.io")

@sio.event
async def connect(sid, environ):
    logger.info(f"Socket client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Socket client disconnected: {sid}")

@sio.event
async def join_job(sid, data):
    job_id = data.get("job_id") if isinstance(data, dict) else str(data)
    room = f"job_{job_id}"
    await sio.enter_room(sid, room)
    logger.info(f"Client {sid} joined room {room}")

async def broadcast_stage_update(job_id: int, stage: int, stage_name: str, status: str, output: Any = None, error: str = None):
    """
    Broadcasts real-time stage progress to any client listening on room 'job_{job_id}'
    """
    room = f"job_{job_id}"
    payload = {
        "type": "stage_update",
        "job_id": job_id,
        "stage": stage,
        "stage_name": stage_name,
        "status": status,
        "output": output,
        "error": error,
    }
    try:
        await sio.emit("stage_update", payload, room=room)
        # Also emit to global namespace for general dashboard listeners
        await sio.emit("global_pipeline_event", payload)
    except Exception as e:
        logger.warning(f"Failed to broadcast websocket event: {e}")
