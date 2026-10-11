import logging
from typing import List
import numpy as np
import hashlib

logger = logging.getLogger("lexvault.embedding")

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.dim = 384
        self._load_model()

    def _load_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("BAAI/bge-small-en-v1.5")
            self.dim = 384
            logger.info("Loaded sentence-transformers BAAI/bge-small-en-v1.5 model.")
        except Exception as e:
            logger.warning(f"SentenceTransformer not loaded ({e}), using deterministic embedding fallback.")

    def embed_text(self, text: str) -> List[float]:
        return self.embed_texts([text])[0]

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        if self.model:
            try:
                embeddings = self.model.encode(texts, normalize_embeddings=True)
                return embeddings.tolist()
            except Exception as e:
                logger.error(f"Error computing embeddings: {e}")

        # Deterministic 384-dimensional fallback vector based on hash
        results = []
        for text in texts:
            vec = np.zeros(self.dim, dtype=np.float32)
            for i, word in enumerate(text.split()):
                idx = int.from_bytes(hashlib.sha256(word.lower().encode("utf-8")).digest()[:8], "big") % self.dim
                vec[idx] += 1.0 / (i + 1)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            results.append(vec.tolist())
        return results

embedding_service = EmbeddingService()
