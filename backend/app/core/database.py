import logging
from typing import AsyncGenerator
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("lexvault.db")

# Create engine with fallback logic
database_url = settings.DATABASE_URL
try:
    engine = create_async_engine(database_url, echo=False, future=True)
except Exception as e:
    logger.warning(f"Could not connect to {database_url}, falling back to SQLite: {e}")
    database_url = settings.SQLITE_FALLBACK_URL
    engine = create_async_engine(database_url, echo=False, future=True)

async_session_maker = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def init_db():
    global engine, async_session_maker
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("Database initialized successfully with primary engine.")
    except Exception as exc:
        logger.warning(f"Primary DB failed ({exc}), switching to local SQLite fallback.")
        engine = create_async_engine(settings.SQLITE_FALLBACK_URL, echo=False, future=True)
        async_session_maker = sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("Database initialized successfully with SQLite fallback.")

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
