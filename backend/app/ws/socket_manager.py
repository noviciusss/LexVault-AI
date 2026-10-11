import socketio
import logging
from typing import Dict, Any
from app.core.config import settings
from app.core.security import decode_access_token
from app.core import database
from app.models.user import User
from app.models.pipeline import PipelineJob
from app.models.knowledge import KnowledgeItem

logger = logging.getLogger("lexvault.ws")

# Create Async Server with CORS enabled for frontend ports
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=settings.CORS_ORIGINS,
    logger=False,
    engineio_logger=False,
)

# ASGI application that wraps socketio
socket_app = socketio.ASGIApp(sio, socketio_path="/ws/socket.io")

@sio.event
async def connect(sid, environ, auth=None):
    payload = decode_access_token((auth or {}).get("token", ""))
    if not payload or not payload.get("sub"):
        return False
    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError):
        return False
    async with database.async_session_maker() as session:
        user = await session.get(User, user_id)
        if not user:
            return False
        await sio.save_session(sid, {"firm_id": user.firm_id})
    logger.info(f"Socket client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Socket client disconnected: {sid}")

@sio.event
async def join_job(sid, data):
    job_id = data.get("job_id") if isinstance(data, dict) else str(data)
    try:
        job_id = int(job_id)
    except (ValueError, TypeError):
        return {"error": "Invalid job"}
    identity = await sio.get_session(sid)
    async with database.async_session_maker() as session:
        job = await session.get(PipelineJob, job_id)
        item = await session.get(KnowledgeItem, job.knowledge_item_id) if job else None
        if not item or item.firm_id != identity.get("firm_id"):
            return {"error": "Job not found"}
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
    except Exception as e:
        logger.warning(f"Failed to broadcast websocket event: {e}")
