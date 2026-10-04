import logging
import uuid
from typing import List, Dict, Any, Optional
import numpy as np
from app.core.config import settings

logger = logging.getLogger("lexvault.qdrant")

class QdrantService:
    def __init__(self):
        self.client = None
        self.collection_name = settings.QDRANT_COLLECTION
        self.dim = 384
        self._fallback_store: Dict[str, Dict[str, Any]] = {}
        self._init_client()

    def _init_client(self):
        try:
            from qdrant_client import QdrantClient
            from qdrant_client.models import Distance, VectorParams
            self.client = QdrantClient(url=settings.QDRANT_URL, timeout=3.0)
            
            # Check if collection exists
            collections = self.client.get_collections().collections
            exists = any(c.name == self.collection_name for c in collections)
            if not exists:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=self.dim, distance=Distance.COSINE),
                )
            logger.info(f"Qdrant client initialized and collection '{self.collection_name}' confirmed.")
        except Exception as e:
            logger.warning(f"Qdrant server not connected at {settings.QDRANT_URL} ({e}). Using local in-memory vector store.")
            self.client = None

    def upsert(self, item_id: int, vector: List[float], payload: Dict[str, Any]) -> str:
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"item-{item_id}"))
        
        if self.client:
            try:
                from qdrant_client.models import PointStruct
                self.client.upsert(
                    collection_name=self.collection_name,
                    points=[
                        PointStruct(id=point_id, vector=vector, payload=payload)
                    ],
                )
                return point_id
            except Exception as e:
                logger.warning(f"Qdrant upsert failed ({e}), saving to in-memory store.")

        # Fallback local store
        self._fallback_store[point_id] = {
            "id": point_id,
            "vector": vector,
            "payload": payload,
        }
        return point_id

    def search(self, query_vector: List[float], firm_id: int = 1, top_k: int = 5) -> List[Dict[str, Any]]:
        if self.client:
            try:
                from qdrant_client.models import Filter, FieldCondition, MatchValue
                query_filter = Filter(
                    must=[
                        FieldCondition(key="firm_id", match=MatchValue(value=firm_id))
                    ]
                )
                if hasattr(self.client, "query_points"):
                    res = self.client.query_points(
                        collection_name=self.collection_name,
                        query=query_vector,
                        query_filter=query_filter,
                        limit=top_k,
                    )
                    results = res.points
                else:
                    results = self.client.search(
                        collection_name=self.collection_name,
                        query_vector=query_vector,
                        query_filter=query_filter,
                        limit=top_k,
                    )
                return [
                    {
                        "id": hit.id,
                        "score": round(float(hit.score), 4),
                        "payload": hit.payload,
                    }
                    for hit in results
                ]
            except Exception as e:
                logger.warning(f"Qdrant search error ({e}), searching in-memory fallback store.")

        # Local cosine similarity search
        scored = []
        q_vec = np.array(query_vector, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec) or 1.0

        for pid, record in self._fallback_store.items():
            if record["payload"].get("firm_id") != firm_id:
                continue
            v = np.array(record["vector"], dtype=np.float32)
            v_norm = np.linalg.norm(v) or 1.0
            cos_sim = float(np.dot(q_vec, v) / (q_norm * v_norm))
            scored.append({
                "id": pid,
                "score": round(cos_sim, 4),
                "payload": record["payload"],
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

qdrant_service = QdrantService()
