from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from app.data.bns_ipc_map import (
    ALL_CRIMINAL_MAPPINGS,
    BNS_IPC_MAPPINGS,
    BNSS_CRPC_MAPPINGS,
    BSA_EVIDENCE_MAPPINGS,
    resolve_citation
)
from app.data.statute_library import STATUTE_ACTS, STATUTE_LIBRARY_SECTIONS

router = APIRouter(prefix="/statutes", tags=["statutes"])

@router.get("/acts")
async def list_statute_acts():
    """List all supported codified Indian statutes."""
    return STATUTE_ACTS

@router.get("/bns-map")
async def get_criminal_mappings(
    ipc: Optional[str] = Query(None, description="Filter by old IPC section, e.g. 302, 376, 420"),
    bns: Optional[str] = Query(None, description="Filter by new BNS section, e.g. 103, 64, 318"),
    act: Optional[str] = Query(None, description="Filter by act: BNS, BNSS, BSA"),
    q: Optional[str] = Query(None, description="Keyword search in English/Hindi titles and descriptions")
):
    """
    Retrieve criminal code cross-references between new statutes (BNS/BNSS/BSA)
    and old codes (IPC/CrPC/IEA).
    """
    results = ALL_CRIMINAL_MAPPINGS
    
    if act:
        target_act = act.upper().strip()
        results = [r for r in results if r.get("act", "").upper() == target_act]
        
    if ipc:
        target_ipc = ipc.strip().upper().replace("IPC", "").strip()
        results = [r for r in results if r.get("ipc_section", "").upper().replace("IPC", "").strip() == target_ipc]
        
    if bns:
        target_bns = bns.strip().upper().replace("BNS", "").strip()
        results = [r for r in results if r.get("bns_section", "").upper().replace("BNS", "").strip() == target_bns]

    if q:
        query_str = q.lower().strip()
        results = [
            r for r in results
            if query_str in r.get("title_en", "").lower()
            or query_str in r.get("title_hi", "")
            or query_str in r.get("description_en", "").lower()
            or query_str in r.get("description_hi", "")
            or query_str in r.get("bns_section", "").lower()
            or query_str in r.get("ipc_section", "").lower()
            or any(query_str in kw for kw in r.get("keywords", []))
        ]

    return results

@router.get("/resolve")
async def resolve_legal_citation(
    cite: str = Query(..., description="Citation string like 'IPC 302', '376', 'CrPC 41A', '65B', 'BNS 103'")
):
    """
    Resolve any legacy IPC/CrPC/Evidence or new BNS/BNSS/BSA citation string to its counterpart.
    """
    res = resolve_citation(cite)
    return res

@router.get("/library")
async def list_statute_sections(
    act: Optional[str] = Query(None, description="Filter by act code, e.g. BNS, BNSS, BSA, CONTRACT, CPC, SRA, TPA, IBC, LIMITATION"),
    q: Optional[str] = Query(None, description="Search keyword in titles or text"),
    tag: Optional[str] = Query(None, description="Filter by tag")
):
    """
    Search and retrieve codified sections across major Indian statutes in English & Hindi.
    """
    results = STATUTE_LIBRARY_SECTIONS
    
    if act and act.upper() != "ALL":
        act_upper = act.upper().strip()
        results = [s for s in results if s["act_code"].upper() == act_upper]
        
    if tag:
        tag_lower = tag.lower().strip()
        results = [s for s in results if any(tag_lower in t.lower() for t in s.get("tags", []))]
        
    if q:
        query_str = q.lower().strip()
        results = [
            s for s in results
            if query_str in s["title_en"].lower()
            or query_str in s["title_hi"]
            or query_str in s["text_en"].lower()
            or query_str in s["text_hi"]
            or query_str in s["section"].lower()
            or any(query_str in t.lower() for t in s.get("tags", []))
        ]
        
    return results

@router.get("/library/{act_code}/{section}")
async def get_statute_section_detail(act_code: str, section: str):
    """Retrieve full detail of a specific statute section."""
    for s in STATUTE_LIBRARY_SECTIONS:
        if s["act_code"].lower() == act_code.lower() and s["section"].lower() == section.lower():
            return s
            
    raise HTTPException(status_code=404, detail=f"Statute section {act_code} {section} not found.")
