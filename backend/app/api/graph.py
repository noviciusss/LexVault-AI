from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.models.knowledge import KnowledgeItem
from app.services.neo4j_service import neo4j_service

router = APIRouter(prefix="/graph", tags=["graph"])

@router.get("")
async def get_graph(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Returns graph nodes and edges for the Graph Explorer page.
    Combines live Neo4j records with current database items.
    """
    # Ensure all published DB items are represented in the graph
    query = select(KnowledgeItem).where(KnowledgeItem.status == "published", KnowledgeItem.firm_id == current_user.firm_id)
    res = await session.execute(query)
    items = res.scalars().all()

    # The legacy graph service has no tenant metadata. Build the public projection
    # from authorized records rather than exposing unscoped graph nodes.
    existing_node_ids = set()
    nodes = []
    edges = []

    for item in items:
        k_id = f"ki-{item.id}"
        if k_id not in existing_node_ids:
            nodes.append({
                "id": k_id,
                "label": item.title or f"Item #{item.id}",
                "type": "KnowledgeItem",
                "data": {"itemId": item.id, "practiceArea": item.practice_area},
            })
            existing_node_ids.add(k_id)

            pa_id = f"pa-{item.practice_area or 'General'}"
            if pa_id not in existing_node_ids:
                nodes.append({
                    "id": pa_id,
                    "label": item.practice_area or "General",
                    "type": "PracticeArea",
                })
                existing_node_ids.add(pa_id)

            edges.append({
                "id": f"e-{k_id}-{pa_id}",
                "source": k_id,
                "target": pa_id,
                "label": "BELONGS_TO",
            })

    return {"nodes": nodes, "edges": edges}
