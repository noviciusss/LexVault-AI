import json
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.knowledge import KnowledgeItem
from app.models.pipeline import PipelineJob
from app.models.audit import AuditLogEntry
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service
from app.services.neo4j_service import neo4j_service
from app.services.groq_client import groq_client
from app.ws.socket_manager import broadcast_stage_update

logger = logging.getLogger("lexvault.stage6")

async def execute_stage6_storage(
    session: AsyncSession,
    knowledge_item: KnowledgeItem,
    job: PipelineJob,
    author_name: str = "Senior Partner",
) -> KnowledgeItem:
    """
    Stage 6: Vector DB & Knowledge Graph Dual Ingestion
    Embeds the approved abstracted strategy with BGE embeddings, indexes into Qdrant,
    extracts legal concepts, and links nodes in Neo4j.
    """
    logger.info(f"Executing Stage 6 (Vector & Graph Storage) for Item #{knowledge_item.id}")

    job.stage = 6
    job.stage_name = "Vector DB & Knowledge Graph Ingestion"
    job.status = "running"
    session.add(job)
    await session.commit()
    await broadcast_stage_update(job.id, 6, "Vector DB & Knowledge Graph Ingestion", "running")

    text_to_embed = knowledge_item.abstracted_insight or knowledge_item.title or ""
    
    # 1. Embed vector
    vector = embedding_service.embed_text(text_to_embed)

    # 2. Upsert into Qdrant
    payload = {
        "item_id": knowledge_item.id,
        "title": knowledge_item.title,
        "firm_id": knowledge_item.firm_id,
        "practice_area": knowledge_item.practice_area or "General Corporate",
        "created_at": knowledge_item.created_at.isoformat(),
        "abstracted_insight": knowledge_item.abstracted_insight,
    }
    vector_id = qdrant_service.upsert(
        item_id=knowledge_item.id,
        vector=vector,
        payload=payload,
    )
    knowledge_item.vector_id = vector_id

    # 3. Extract concepts via LLM
    concept_prompt = (
        "Extract 2 to 4 key legal concepts or doctrine names from this insight. "
        "Return only a clean JSON object with key 'concepts' containing a list of strings.\n\n"
        f"TEXT: {text_to_embed[:600]}"
    )
    concept_res = await groq_client.complete(prompt=concept_prompt, json_mode=True)
    concepts = ["Contractual Enforceability", "Risk Allocation", "Remedies"]
    try:
        data = json.loads(concept_res)
        if isinstance(data, dict) and "concepts" in data and isinstance(data["concepts"], list):
            concepts = [str(c).strip() for c in data["concepts"] if str(c).strip()]
    except Exception as e:
        logger.warning(f"Concept JSON parsing fallback ({e})")

    # 4. Ingest into Neo4j Graph
    graph_node_id = neo4j_service.ingest_knowledge_item(
        item_id=knowledge_item.id,
        title=knowledge_item.title or f"Item #{knowledge_item.id}",
        practice_area=knowledge_item.practice_area or "General Corporate",
        author_name=author_name,
        concepts=concepts,
    )
    knowledge_item.graph_node_id = graph_node_id
    knowledge_item.status = "published"
    knowledge_item.current_stage = 6

    # 5. Audit log
    audit = AuditLogEntry(
        firm_id=knowledge_item.firm_id,
        actor_id=knowledge_item.author_id,
        action="KNOWLEDGE_PUBLISHED",
        target_type="KnowledgeItem",
        target_id=knowledge_item.id,
        details=f"Indexed in Qdrant (ID: {vector_id[:8]}) and linked {len(concepts)} concepts in Neo4j graph.",
        metadata_json=json.dumps({"vector_id": vector_id, "graph_node_id": graph_node_id, "concepts": concepts}),
    )
    session.add(audit)
    session.add(knowledge_item)

    job.status = "done"
    job.output_preview = (
        f"✓ Vectorized & stored in Qdrant (Collection: lexvault_knowledge, Dim: 384)\n"
        f"✓ Knowledge Graph: Linked concepts [{', '.join(concepts)}] in Neo4j\n"
        f"✓ Status: Firm-Wide Published"
    )
    job.finished_at = datetime.utcnow()
    session.add(job)
    await session.commit()

    await broadcast_stage_update(job.id, 6, "Vector DB & Knowledge Graph Ingestion", "done", output=job.output_preview)
    return knowledge_item
