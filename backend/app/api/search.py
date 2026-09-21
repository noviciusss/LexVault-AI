from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, desc

from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.models.knowledge import KnowledgeItem
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

class SemanticSearchRequest(BaseModel):
    query: str
    practice_area: Optional[str] = None
    limit: Optional[int] = 6

@router.get("")
async def list_knowledge(
    practice_area: Optional[str] = None,
    q: Optional[str] = None,
    status: Optional[str] = "published",
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(KnowledgeItem)
        .where(KnowledgeItem.firm_id == current_user.firm_id)
        .order_by(desc(KnowledgeItem.created_at))
    )
    if status:
        query = query.where(KnowledgeItem.status == status)
    if practice_area and practice_area.lower() != "all":
        query = query.where(KnowledgeItem.practice_area == practice_area)

    res = await session.execute(query)
    items = res.scalars().all()

    # Filter keyword locally if provided
    if q:
        q_lower = q.lower()
        items = [
            i for i in items
            if (i.title and q_lower in i.title.lower()) or (i.abstracted_insight and q_lower in i.abstracted_insight.lower())
        ]

    return [
        {
            "id": i.id,
            "title": i.title,
            "firm_id": i.firm_id,
            "practice_area": i.practice_area,
            "status": i.status,
            "abstracted_insight": i.abstracted_insight,
            "raw_input_type": i.raw_input_type,
            "author_id": i.author_id,
            "created_at": i.created_at,
            "approved_at": i.approved_at,
            "vector_id": i.vector_id,
        }
        for i in items
    ]

@router.post("/search")
async def semantic_search(
    req: SemanticSearchRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query_vector = embedding_service.embed_text(req.query)
    hits = qdrant_service.search(query_vector=query_vector, firm_id=current_user.firm_id, top_k=req.limit or 6)

    results = []
    for hit in hits:
        payload = hit.get("payload", {})
        results.append({
            "item_id": payload.get("item_id"),
            "title": payload.get("title"),
            "practice_area": payload.get("practice_area"),
            "abstracted_insight": payload.get("abstracted_insight"),
            "score": hit.get("score"),
        })

    return {"query": req.query, "results": results}
