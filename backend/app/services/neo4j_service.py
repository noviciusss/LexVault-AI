import logging
from typing import List, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("lexvault.neo4j")

class Neo4jService:
    def __init__(self):
        self.driver = None
        self._fallback_nodes: List[Dict[str, Any]] = []
        self._fallback_edges: List[Dict[str, Any]] = []
        self._init_driver()

    def _init_driver(self):
        try:
            from neo4j import GraphDatabase
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
                connection_timeout=3.0,
            )
            # Verify connectivity
            self.driver.verify_connectivity()
            logger.info("Connected to Neo4j graph database.")
        except Exception as e:
            logger.warning(f"Neo4j not connected at {settings.NEO4J_URI} ({e}). Using resilient in-memory graph service.")
            self.driver = None

    def ingest_knowledge_item(
        self,
        item_id: int,
        title: str,
        practice_area: str,
        author_name: str,
        concepts: List[str],
    ) -> str:
        node_id = f"ki-{item_id}"

        if self.driver:
            try:
                with self.driver.session() as session:
                    # Create KnowledgeItem, PracticeArea, Lawyer nodes and relationships
                    cypher = """
                    MERGE (k:KnowledgeItem {id: $item_id})
                    SET k.title = $title
                    
                    MERGE (p:PracticeArea {name: $practice_area})
                    MERGE (k)-[:BELONGS_TO]->(p)

                    MERGE (l:Lawyer {name: $author_name})
                    MERGE (l)-[:AUTHORED]->(k)

                    WITH k
                    UNWIND $concepts AS c_name
                    MERGE (c:Concept {name: c_name})
                    MERGE (k)-[:MENTIONS]->(c)
                    """
                    session.run(
                        cypher,
                        item_id=item_id,
                        title=title,
                        practice_area=practice_area,
                        author_name=author_name,
                        concepts=concepts,
                    )
                return node_id
            except Exception as e:
                logger.warning(f"Neo4j query execution failed ({e}), recording in fallback graph.")

        # In-memory graph nodes & edges fallback
        k_node = {"id": node_id, "label": title, "type": "KnowledgeItem", "data": {"itemId": item_id}}
        p_node = {"id": f"pa-{practice_area}", "label": practice_area, "type": "PracticeArea"}
        l_node = {"id": f"lawyer-{author_name}", "label": author_name, "type": "Lawyer"}
        
        self._add_node_if_missing(k_node)
        self._add_node_if_missing(p_node)
        self._add_node_if_missing(l_node)

        self._fallback_edges.append({"id": f"e-k-pa-{item_id}", "source": node_id, "target": p_node["id"], "label": "BELONGS_TO"})
        self._fallback_edges.append({"id": f"e-l-k-{item_id}", "source": l_node["id"], "target": node_id, "label": "AUTHORED"})

        for c in concepts:
            c_node = {"id": f"c-{c}", "label": c, "type": "Concept"}
            self._add_node_if_missing(c_node)
            self._fallback_edges.append({"id": f"e-k-c-{item_id}-{c}", "source": node_id, "target": c_node["id"], "label": "MENTIONS"})

        return node_id

    def _add_node_if_missing(self, node: Dict[str, Any]):
        if not any(n["id"] == node["id"] for n in self._fallback_nodes):
            self._fallback_nodes.append(node)

    def get_graph_data(self) -> Dict[str, Any]:
        if self.driver:
            try:
                with self.driver.session() as session:
                    result = session.run("""
                    MATCH (n)
                    OPTIONAL MATCH (n)-[r]->(m)
                    RETURN n, r, m LIMIT 150
                    """)
                    nodes = {}
                    edges = []
                    for record in result:
                        n = record["n"]
                        if n and n.element_id not in nodes:
                            labels = list(n.labels)
                            label_type = labels[0] if labels else "Entity"
                            title = n.get("title") or n.get("name") or str(n.get("id"))
                            nodes[n.element_id] = {
                                "id": str(n.get("id") or n.element_id),
                                "label": title,
                                "type": label_type,
                            }
                        m = record["m"]
                        r = record["r"]
                        if m and r:
                            if m.element_id not in nodes:
                                m_labels = list(m.labels)
                                m_type = m_labels[0] if m_labels else "Entity"
                                m_title = m.get("title") or m.get("name") or str(m.get("id"))
                                nodes[m.element_id] = {
                                    "id": str(m.get("id") or m.element_id),
                                    "label": m_title,
                                    "type": m_type,
                                }
                            edges.append({
                                "id": f"e-{r.element_id}",
                                "source": str(n.get("id") or n.element_id),
                                "target": str(m.get("id") or m.element_id),
                                "label": r.type,
                            })
                    return {"nodes": list(nodes.values()), "edges": edges}
            except Exception as e:
                logger.warning(f"Neo4j get_graph_data error ({e}), returning in-memory graph.")

        return {
            "nodes": self._fallback_nodes,
            "edges": self._fallback_edges,
        }

neo4j_service = Neo4jService()
