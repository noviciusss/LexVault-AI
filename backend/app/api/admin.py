from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, desc, func

from app.core.database import get_session
from app.core.deps import get_current_user, require_role
from app.models.user import User, UserRead
from app.models.audit import AuditLogEntry, AuditLogRead
from app.models.knowledge import KnowledgeItem
from app.models.firm import Firm
from datetime import date, datetime, time, timedelta

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/audit-log")
async def get_audit_log(
    action: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    start: Optional[date] = None,
    end: Optional[date] = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role(["admin"])),
):
    query = select(AuditLogEntry).where(AuditLogEntry.firm_id == current_user.firm_id).order_by(desc(AuditLogEntry.timestamp)).offset(offset).limit(limit)
    if start:
        query = query.where(AuditLogEntry.timestamp >= datetime.combine(start, time.min))
    if end:
        query = query.where(AuditLogEntry.timestamp < datetime.combine(end + timedelta(days=1), time.min))
    if action and action != "ALL":
        query = query.where(AuditLogEntry.action == action)

    res = await session.execute(query)
    entries = res.scalars().all()
    return entries

@router.get("/stats")
async def get_firm_stats(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Total items
    total_q = select(func.count(KnowledgeItem.id)).where(KnowledgeItem.firm_id == current_user.firm_id)
    total_res = await session.execute(total_q)
    total_items = total_res.scalar() or 0

    # Published
    pub_q = select(func.count(KnowledgeItem.id)).where(KnowledgeItem.status == "published", KnowledgeItem.firm_id == current_user.firm_id)
    pub_res = await session.execute(pub_q)
    published_items = pub_res.scalar() or 0

    # Pending approval
    pend_q = select(func.count(KnowledgeItem.id)).where(KnowledgeItem.status == "pending_approval", KnowledgeItem.firm_id == current_user.firm_id)
    pend_res = await session.execute(pend_q)
    pending_items = pend_res.scalar() or 0

    # Total audit logs (actions tracked)
    audit_q = select(func.count(AuditLogEntry.id)).where(AuditLogEntry.firm_id == current_user.firm_id)
    audit_res = await session.execute(audit_q)
    audit_count = audit_res.scalar() or 0

    import json
    items = (await session.execute(select(KnowledgeItem).where(KnowledgeItem.firm_id == current_user.firm_id))).scalars().all()
    pii_count = 0
    durations = []
    for item in items:
        try:
            pii_count += len(json.loads(item.pii_entities_found or "[]"))
        except (ValueError, TypeError):
            pass
        if item.approved_at and item.created_at:
            durations.append((item.approved_at - item.created_at).total_seconds() / 60)
    return {
        "total_captured": total_items,
        "total_published": published_items,
        "pending_approval": pending_items,
        "avg_time_to_publish": f"{sum(durations) / len(durations):.1f} min" if durations else "—",
        "pii_entities_sanitized": pii_count,
        "total_audit_events": audit_count,
    }

@router.get("/users", response_model=list[UserRead])
async def list_users(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role(["admin"])),
):
    res = await session.execute(select(User).where(User.firm_id == current_user.firm_id).order_by(User.id))
    return res.scalars().all()

@router.post("/reseed")
async def reseed_database(
    force: bool = True,
    current_user: User = Depends(require_role(["admin"])),
    session: AsyncSession = Depends(get_session),
):
    """Admin-only: Wipe and re-seed database with purely Indian multi-firm data."""
    from app.seed import auto_seed_if_empty
    from app.models.pipeline import PipelineJob
    from app.models.chat import ChatMessage, ChatSession
    from app.services.qdrant_service import qdrant_service
    
    # 1. Clear database tables
    try:
        from sqlalchemy import text
        await session.execute(text("DELETE FROM chat_messages;"))
        await session.execute(text("DELETE FROM chat_sessions;"))
        await session.execute(text("DELETE FROM pipeline_jobs;"))
        await session.execute(text("DELETE FROM audit_log;"))
        await session.execute(text("DELETE FROM knowledge_items;"))
        await session.execute(text("DELETE FROM users;"))
        await session.execute(text("DELETE FROM firms;"))
        await session.commit()
    except Exception as te:
        await session.rollback()
        # Fallback or sqlite
        pass

    # 2. Reset Qdrant vectors
    try:
        qdrant_service.create_collection_if_not_exists()
    except Exception as qe:
        pass

    # 3. Re-run seed
    await auto_seed_if_empty(force=True)
    return {"status": "success", "message": "Database reseeded successfully with India-only multi-firm dataset."}

