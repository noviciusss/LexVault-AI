import logging
from typing import List, Dict, Any, Tuple
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service
from app.services.neo4j_service import neo4j_service
import asyncio
from app.core import database
from app.models.knowledge import KnowledgeItem
from sqlmodel import select

logger = logging.getLogger("lexvault.stage7")

async def execute_stage7_retrieval(
    question: str,
    firm_id: int = 1,
    top_k: int = 4,
    practice_area: str = None,
) -> Tuple[List[Dict[str, Any]], str]:
    """
    Stage 7: RAG Retrieval
    Performs hybrid retrieval:
    1. Semantic vector similarity search via Qdrant for closest institutional precedents.
    2. Neo4j graph context expansion for related legal concepts.
    Returns the retrieved items and a structured context string for synthesis.
    """
    logger.info(f"Executing Stage 7 (Retrieval) for question: '{question[:60]}...'")

    # 1. Embed user query
    query_vector = await asyncio.to_thread(embedding_service.embed_text, question)

    # 2. Vector search in Qdrant
    hits = await asyncio.to_thread(qdrant_service.search, query_vector=query_vector, firm_id=firm_id, top_k=top_k)
    async with database.async_session_maker() as session:
        records = (await session.execute(select(KnowledgeItem).where(KnowledgeItem.firm_id == firm_id, KnowledgeItem.status == "published"))).scalars().all()
        allowed_ids = {item.id for item in records if not practice_area or item.practice_area == practice_area}

    retrieved_items = []
    context_blocks = []

    for hit in hits:
        payload = hit.get("payload", {})
        item_id = payload.get("item_id")
        if item_id not in allowed_ids or hit.get("score", 0) <= 0:
            continue
        title = payload.get("title", f"Knowledge Item #{item_id}")
        insight = payload.get("abstracted_insight", "")
        practice_area = payload.get("practice_area", "General")
        score = hit.get("score", 0.0)

        retrieved_items.append({
            "item_id": item_id,
            "title": title,
            "score": score,
            "practice_area": practice_area,
            "insight": insight,
            "abstracted_insight": insight,
        })

        context_blocks.append(
            f"Knowledge Item #{item_id}: {title}\nPractice Area: {practice_area}\n"
            f"{insight}\n"
        )

    context_str = "\n".join(context_blocks).strip()
    return retrieved_items, context_str
