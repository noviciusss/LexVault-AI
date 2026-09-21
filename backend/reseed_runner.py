import asyncio
import logging
from sqlmodel import SQLModel
from app.core.database import engine, async_session_maker, init_db
from app.services.qdrant_service import qdrant_service
from app.seed import auto_seed_if_empty

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lexvault.reset")

async def main():
    logger.info("Connecting to database and dropping existing tables for fresh India-only state...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.drop_all)
            await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("Tables dropped and recreated successfully.")
    except Exception as e:
        logger.error(f"Drop/create tables failed: {e}")

    # Recreate Qdrant collection
    try:
        qdrant_service.create_collection_if_not_exists()
        logger.info("Qdrant collection checked/recreated.")
    except Exception as qe:
        logger.warning(f"Qdrant collection note: {qe}")

    # Run seed
    logger.info("Starting fresh India-only multi-firm seeding...")
    await auto_seed_if_empty(force=True)
    logger.info("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(main())
