import logging
from typing import AsyncGenerator
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from sqlalchemy import inspect, text

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
            await migrate_audit_tenancy(conn)
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
            await migrate_audit_tenancy(conn)
        logger.info("Database initialized successfully with SQLite fallback.")

async def migrate_audit_tenancy(conn):
    """Upgrade pre-existing prototype databases without deleting user records."""
    columns = await conn.run_sync(lambda connection: inspect(connection).get_columns("audit_log_entries"))
    if not any(column["name"] == "firm_id" for column in columns):
        await conn.execute(text("ALTER TABLE audit_log_entries ADD COLUMN firm_id INTEGER NOT NULL DEFAULT 1"))
        await conn.execute(text("UPDATE audit_log_entries SET firm_id = COALESCE((SELECT firm_id FROM users WHERE users.id = audit_log_entries.actor_id), (SELECT firm_id FROM knowledge_items WHERE knowledge_items.id = audit_log_entries.target_id AND audit_log_entries.target_type = 'KnowledgeItem'), 1)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_audit_log_entries_firm_id ON audit_log_entries (firm_id)"))

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
