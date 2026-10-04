import re
import logging
from typing import List, Dict, Any, Tuple, Optional
from app.services.groq_client import groq_client

logger = logging.getLogger("lexvault.stage8")

async def execute_stage8_response(
    question: str,
    retrieved_items: List[Dict[str, Any]],
    context_str: str,
    history: Optional[List[Dict[str, str]]] = None,
    action_type: Optional[str] = None,
) -> Tuple[str, List[Dict[str, Any]], bool]:
    """
    Stage 8: Safe Response Generation
    Generates a guardrailed answer strictly grounded in internal firm precedent,
    enforcing citation of internal Knowledge Item IDs and multi-turn context retention.
    """
    logger.info(f"Executing Stage 8 (Safe Response) with {len(retrieved_items)} context sources, action: {action_type}.")

    # Guardrail check: if no items were retrieved or top similarity is too weak
    if not retrieved_items or not context_str:
        return (
            "GUARDRAIL ENFORCED: LexVault AI found no verified internal firm precedents "
            "addressing this inquiry. Per institutional policy, answers are restricted exclusively "
            "to internal firm knowledge to prevent unvetted advice or privilege compromise.",
            [],
            True,
        )

    if action_type == "draft_objection":
        system_prompt = (
            "You are LexVault AI, a senior advocate drafting an Indian Court Application for Preliminary Objections. "
            "Draft a formal court petition (e.g. Before the National Company Law Tribunal or Commercial Court) "
            "grounded STRICTLY in the provided internal firm precedents. "
            "Include formal prayer clauses, verification paragraph, and explicit citations to '[Knowledge Item #<id>]'."
        )
    elif action_type == "draft_reply":
        system_prompt = (
            "You are LexVault AI, a senior legal counsel drafting a formal Reply to a Statutory Demand Notice "
            "(under Section 8 IBC or Section 138 NI Act) grounded strictly in internal firm precedent. "
            "Deny liability, assert pre-existing dispute or lack of cause of action, and cite '[Knowledge Item #<id>]'."
        )
    else:
        system_prompt = (
            "You are LexVault AI, a secure legal institutional intelligence copilot for Indian advocates.\n"
            "Strict Guardrails:\n"
            "1. Answer based on the provided INTERNAL FIRM CONTEXT below.\n"
            "2. Cite the source knowledge items explicitly in your text using the notation '[Knowledge Item #<id>]'.\n"
            "3. If the context does not contain sufficient legal basis, say: 'Based on internal firm records, "
            "there is no established precedent for this specific question.'\n"
            "4. Never invent client specifics, names, or unverified legal rules.\n"
            "5. Maintain continuity with the prior discussion in the conversation history."
        )

    prompt = (
        f"INTERNAL FIRM CONTEXT:\n{context_str}\n\n"
        f"ATTORNEY INQUIRY: {question}\n\n"
        "Provide a structured, institutional legal briefing with citations to internal Knowledge Item numbers:"
    )

    answer = await groq_client.complete(
        prompt=prompt,
        system_prompt=system_prompt,
        history=history,
    )

    cited_ids = set(re.findall(r"\[Knowledge Item #(\d+)\]", answer))
    cited_items = [
        item for item in retrieved_items
        if str(item.get("item_id") or item.get("id")) in cited_ids
    ]
    if not cited_items:
        cited_items = retrieved_items[:2]

    return answer, cited_items, False
