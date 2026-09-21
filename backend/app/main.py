import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api import api_router
from app.ws.socket_manager import socket_app

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("lexvault.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting LexVault AI Backend...")
    await init_db()
    # Auto-seed if database is fresh
    try:
        from app.seed import auto_seed_if_empty
        await auto_seed_if_empty()
    except Exception as e:
        logger.warning(f"Auto-seed check note: {e}")
    yield
    logger.info("Shutting down LexVault AI Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Institutional Legal-Knowledge Platform with 8-Stage Guardrailed AI Pipeline",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_PREFIX)

# Mount Socket.IO app at root (handles /ws/socket.io)
app.mount("/ws", socket_app)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "lexvault-backend"}
