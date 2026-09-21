import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from sqlmodel import delete
from app.core.database import async_session_maker, init_db
from app.models.firm import Firm
from app.models.user import User
from app.models.knowledge import KnowledgeItem
from app.models.audit import AuditLogEntry
from app.models.pipeline import PipelineJob
from app.models.chat import ChatQuery
from app.seed import auto_seed_if_empty

async def main():
    print("Initializing database...")
    await init_db()
    async with async_session_maker() as session:
        print("Clearing old demo records...")
        await session.execute(delete(ChatQuery))
        await session.execute(delete(PipelineJob))
        await session.execute(delete(AuditLogEntry))
        await session.execute(delete(KnowledgeItem))
        await session.execute(delete(User))
        await session.execute(delete(Firm))
        await session.commit()
        print("Old records cleared.")

    print("Seeding fresh multi-firm Indian and US legal records...")
    await auto_seed_if_empty(force=True)
    print("Multi-firm seed completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
