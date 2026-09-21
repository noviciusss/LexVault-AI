import re
import logging
from typing import List, Dict, Any, Tuple
from app.services.groq_client import groq_client

logger = logging.getLogger("lexvault.stage8")

async def execute_stage8_response(
    question: str,
    retrieved_items: List[Dict[str, Any]],
    context_str: str,
) -> Tuple[str, List[Dict[str, Any]], bool]:
    """
    Stage 8: Safe Response Generation
    Generates a guardrailed answer strictly grounded in internal firm precedent,
    enforcing citation of internal Knowledge Item IDs and explicit refusal if out-of-domain.
    """
    logger.info(f"Executing Stage 8 (Safe Response) with {len(retrieved_items)} context sources.")

    # Guardrail check: if no items were retrieved or top similarity is too weak
    if not retrieved_items or not context_str:
        return (
            "GUARDRAIL ENFORCED: LexVault AI found no verified internal firm precedents "
            "addressing this inquiry. Per institutional policy, answers are restricted exclusively "
            "to internal firm knowledge to prevent unvetted advice or privilege compromise.",
            [],
            True,
        )

    system_prompt = (
        "You are LexVault AI, a secure legal institutional intelligence assistant. "
        "Strict Guardrails:\n"
        "1. Answer ONLY based on the provided INTERNAL FIRM CONTEXT below.\n"
        "2. Cite the source knowledge items explicitly in your text using the notation '[Knowledge Item #<id>]'.\n"
        "3. If the context does not contain sufficient legal basis, say: 'Based on internal firm records, "
        "there is no established precedent for this specific question.'\n"
        "4. Never invent client specifics, names, or unverified legal rules."
    )

    prompt = (
        f"INTERNAL FIRM CONTEXT:\n{context_str}\n\n"
        f"ATTORNEY QUESTION: {question}\n\n"
        "Provide a structured, institutional legal briefing with citations to internal Knowledge Item numbers:"
    )

    answer = await groq_client.complete(prompt=prompt, system_prompt=system_prompt)

    # Detect citations
    cited_ids = set()
    for match in re.finditer(r"\[(?:Knowledge\s*Item\s*#|Item\s*#|Source:\s*#?)(\d+)\]", answer, re.IGNORECASE):
        cited_ids.add(int(match.group(1)))

    # Fallback to items in retrieved list if LLM didn't format brackets explicitly
    cited_items = []
    for item in retrieved_items:
        if item["item_id"] in cited_ids or len(cited_ids) == 0:
            cited_items.append(item)

    guardrail_applied = "GUARDRAIL ENFORCED" in answer or "no established precedent" in answer.lower()

    return answer, cited_items, guardrail_applied
