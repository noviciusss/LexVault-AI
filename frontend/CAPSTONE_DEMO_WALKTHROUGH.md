# 🏛️ LexVault AI — Capstone Project & Viva Demonstration Guide

> **Project Name:** LexVault AI — Guardrailed Institutional Legal Knowledge Platform & Autonomous Copilot  
> **Target Jurisdiction:** India (Constitution of India, Bharatiya Nyaya Sanhita 2023 / IPC, NCLT / IBC, Commercial Law)  
> **Key Innovations:** Deterministic Grounded RAG, Dual BNS ↔ IPC Cross-Code Engine, Multi-Turn Matter Threads, Word-by-Word Streaming, Court Pleading Drafting Engine.

---

## 📌 PART 1: COMPLETE TECHNICAL INVENTORY (WHAT WE HAVE BUILT)

### 1. Hybrid Retrieval-Augmented Generation (RAG) Architecture
* **Vector Embeddings & Semantic Indexing:** Qdrant vector database indexing institutional legal precedents with dense vector representations (`sentence-transformers/all-MiniLM-L6-v2`) and threshold-based semantic matching.
* **Knowledge Graph (Neo4j):** Interlinks statutory sections, constitutional articles, and precedent nodes to provide structural legal graph traversals.
* **Relational Storage & Audit Trail (PostgreSQL 16):** Full audit logs, lawyer sessions, verified knowledge items, and matter metadata.

### 2. Multi-Model LLM Resilience Ladder (Groq)
* **High-Throughput Inference:** Powered by Groq ultra-low latency LPU engine.
* **Auto-Fallback Ladder:**
  1. `openai/gpt-oss-120b` (Primary production reasoning model)
  2. `openai/gpt-oss-20b` (Secondary agile model)
  3. `qwen/qwen3.8-27b` (High-efficiency multi-lingual fallback)
* **Local Ollama Fallback:** On-premise air-gapped fallback ensuring zero data leaks if cloud endpoints are unavailable.

### 3. Real-Time Token Streaming (SSE)
* Server-Sent Events (`POST /api/chat/stream`) yielding asynchronous token chunks.
* Frontend consumes stream via `TextDecoder` and updates the React state progressively, giving lawyers a real-time typewriter experience.

### 4. Bespoke Legal Typography & Courtroom Markdown Parser
* Custom `LegalMarkdownRenderer` designed specifically for courtroom pleadings and legal memos:
  * Eliminates ugly raw markdown (`**`, `###`, `---`).
  * Formats centered, uppercase court caps (e.g., `IN THE NATIONAL COMPANY LAW TRIBUNAL`, `VERSUS`).
  * Converts `[Knowledge Item #12]` into interactive chip buttons that open the Precedent Drawer with 1 click.
  * Formats numbered legal clauses, formal prayer boxes, blockquotes, and statutory citations.

### 5. Specialized Drafting Modes
* **Legal Advisory Mode (⚖️):** Strategic institutional legal briefing grounded in internal firm authorities.
* **Preliminary Objections Mode (🛡️):** Formal Indian Court application (NCLT / Commercial Court) complete with cause title, preliminary grounds, prayer clauses, and verification.
* **Notice Reply Mode (📄):** Formal reply to statutory demand notices (e.g., Section 8 IBC or Section 138 NI Act) denying liability and setting up pre-existing disputes.

### 6. Institutional Matter & Case Management
* **Matter Threads:** Organize inquiries by case (e.g., *NCLT Section 9 Dispute Strategy*, *BNS §85 / 498A Safeguards*).
* **Multi-Turn Memory:** Up to 8 conversation turns passed to maintain seamless multi-turn reasoning across follow-up queries.
* **Local Persistence:** Matter threads automatically saved in `localStorage`.

### 7. Dual BNS ↔ IPC Statutory Cross-Code Resolver
* Live bidirectional mapping between the **Bharatiya Nyaya Sanhita (BNS 2023)** and legacy **Indian Penal Code (IPC 1860)**, plus **BNSS ↔ CrPC** and **BSA ↔ IEA**.
* Instant search in both English and Hindi.

### 8. Slide-Over Precedent Drawer & Court Memo Exporter
* **Precedent Drawer:** Deep-dive into ratio decidendi, case citations, practice area tags, and 1-click follow-up prompt injection.
* **Legal Memo Modal:** Generates a formal, privileged work product memorandum with 1-click clipboard copy, `.txt` download, and clean browser print formatting.

---

## 🎬 PART 2: STEP-BY-STEP CAPSTONE DEMO SCRIPT (FOR EVALUATORS & PROFESSORS)

Follow this exact click-through sequence during your presentation. It takes **6 to 8 minutes** and showcases all core innovations.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LEXVAULT AI DEMO FLOW                           │
│                                                                        │
│  [Act 1: Problem]  ──►  [Act 2: Architecture] ──► [Act 3: Live RAG]   │
│         │                                                │             │
│         ▼                                                ▼             │
│  [Act 4: Pleading] ──►  [Act 5: Drawer & Memo] ──► [Act 6: Guardrail]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### ⏱️ ACT 1: THE REAL-WORLD PROBLEM (1 Minute)
* **What to Say:**
  > *"Respected evaluators, modern Indian law firms face a critical challenge in 2024: the historic replacement of the 164-year-old IPC with the Bharatiya Nyaya Sanhita, coupled with strict client confidentiality. Commercial advocates cannot paste proprietary client briefs into public ChatGPT or Claude due to Bar Council privilege rules and hallucination risks. LexVault AI is our solution: a guardrailed, deterministic institutional intelligence copilot grounded exclusively in verified firm precedents and Indian statutory codes."*

---

### ⏱️ ACT 2: EXPLORING THE VAULT & STATUTORY ENGINES (1.5 Minutes)
1. **Navigate to:** `http://localhost:3000/knowledge-hub`
2. **Showcase:**
   * Point out the **Knowledge Hub** cards containing seeded Supreme Court & High Court precedents (e.g., *Mobilox Innovations*, *Arnesh Kumar*, *Section 27 Contract Act*).
   * Switch to the **Constitution Explorer** tab: Show instant search on *"Article 21"* or *"Right to Equality"*.
   * Switch to the **BNS ↔ IPC Bridge** tab:
     * Type `498A` or `302` in the search bar.
     * Show the instantaneous translation to **BNS §85** (Cruelty by Husband/Relatives) or **BNS §103** (Murder).
3. **What to Say:**
   * *"Every precedent in our vault is tagged by practice area and verified by partner-level oversight before becoming searchable."*

---

### ⏱️ ACT 3: THE LEGAL COPILOT WORKSPACE (2 Minutes)
1. **Navigate to:** `http://localhost:3000/assistant`
2. **Showcase the Workspace Layout:**
   * Point out the **Left Matter Sidebar** (*General Strategy*, *NCLT Section 9 Dispute Strategy*, *BNS §85 Safeguards*).
   * Show the **Top Practice Area & Court Filters** (*Corporate Insolvency & IBC*, *Supreme Court of India*).
   * Highlight the **Quick Statute Lookup Bar** at the top (type `IPC 420` → resolves to `BNS §318 Cheating`).
3. **Demonstrate Real-Time Word-by-Word Streaming:**
   * In the Quick Inquiries row, click:  
     `"What is our firm strategy on resisting NCLT Section 9 IBC petitions when pre-existing disputes exist?"`
   * **Highlight to evaluators:**
     * Watch the real-time word-by-word streaming generation.
     * Point out the **clean legal typography**: no raw `**` or unparsed syntax. Headings, bullet points, and citations are rendered with courtroom-grade styling.
     * Notice the inline citation chip: **`[KI #1]`** embedded directly in the text!
     * Notice the cited precedent card at the bottom with a 95%+ relevance score.

---

### ⏱️ ACT 4: COURTROOM PLEADING DRAFTING ENGINE (2 Minutes)
1. **Toggle the Output Format Pill:**
   * Click **"Draft Preliminary Objections"** (amber pill above the input).
2. **Submit a Drafting Query:**
   * Type into the input box:  
     `"Draft preliminary objections against Section 9 IBC petition by Operational Creditor where notice of dispute was already served."`
   * Click **"Draft Objections"**.
3. **Show the Result to Evaluators:**
   * The output generates a complete, formatted court pleading:
     * **Cause Title:** `IN THE NATIONAL COMPANY LAW TRIBUNAL (Commercial Bench) [City]`
     * **Parties:** `(Operational Creditor – “Petitioner”) Versus (Corporate Debtor – “Respondent”)`
     * **Preliminary Objections:** Citing the pre-existing dispute doctrine and Supreme Court precedent (*Mobilox Innovations*).
     * **Formal Prayer Clauses & Verification Paragraph**.
4. **What to Say:**
   * *"Notice that LexVault AI doesn't just chat — it transforms retrieved institutional ratios into formal courtroom pleadings ready for filing."*

---

### ⏱️ ACT 5: PRECEDENT DRAWER & FORMAL MEMORANDUM EXPORT (1.5 Minutes)
1. **Interactive Precedent Inspection:**
   * Click on the inline chip **`KI #1`** inside the response text, or click **"Inspect →"** on the cited precedent card.
   * The **Precedent Inspector Drawer** smoothly slides out from the right:
     * Shows the ratio decidendi, firm strategy, statutory linkages, and one-click follow-up prompt injection.
   * Close the drawer (`✕`).
2. **Export Court Legal Memorandum:**
   * Below the assistant response, click the gold button: **"Export Legal Memo"**.
   * The **Legal Briefing Memorandum Modal** opens:
     * Displays a formal header with date, firm name (*Chandra & Rao Associates*), counsel attribution, executive summary, ratio analysis, and cited vault references.
     * Demonstrate the **"Copy Memo"**, **"Download .txt"**, and **"Print Memo"** buttons.
   * Close the modal (`✕`).

---

### ⏱️ ACT 6: JURISDICTION & PRIVILEGE GUARDRAILS (1 Minute)
1. **Test the Out-of-Jurisdiction Guardrail:**
   * Click on the 4th quick query chip:  
     `"Can our firm file an asylum petition before the French Immigration Court? (Test Out-of-Jurisdiction Guardrail)"`
2. **Show the Result:**
   * The system immediately detects that French asylum law is outside the firm's vault and jurisdiction.
   * Displays the amber **Privilege & Jurisdiction Guardrail Enforced** warning banner:
     * Refuses to speculate or hallucinate foreign law.
3. **What to Say:**
   * *"This proves our system's deterministic safety: unlike standard LLMs that confidently hallucinate non-existent foreign statutes, LexVault strictly enforces institutional boundaries."*

---

## 🎯 PART 3: TOP 6 VIVA QUESTIONS & WINNING ANSWERS

| # | Question from Evaluator / Professor | Your Winning Technical Answer |
|---|-------------------------------------|--------------------------------|
| **1** | *"Why not just use ChatGPT or Claude with a system prompt?"* | *"Public LLMs send confidential matter facts to external servers, violating advocate-client privilege. Furthermore, general LLMs frequently hallucinate legal citations. LexVault AI uses deterministic vector grounding over an institutional vault, ensuring every proposition cites an internal verified Knowledge Item ID."* |
| **2** | *"How do you handle the 2024 IPC to BNS transition?"* | *"We implemented a Dual BNS ↔ IPC cross-code engine with bidirectional mappings between IPC/CrPC/IEA and BNS/BNSS/BSA. When an advocate inputs legacy citations like IPC 498A, our pipeline automatically maps it to BNS §85 and verifies contemporary case law."* |
| **3** | *"What happens if Groq API hits a rate limit or service outage?"* | *"We engineered a multi-model fallback ladder: if `openai/gpt-oss-120b` experiences any latency, the system cascades to `openai/gpt-oss-20b`, then `qwen/qwen3.8-27b`, and ultimately falls back to our local on-premise Ollama instance."* |
| **4** | *"How does the word-by-word streaming work technically?"* | *"Our FastAPI backend yields Server-Sent Events (`POST /api/chat/stream`) using Python's `AsyncGenerator`. The frontend React client reads raw bytes via `ReadableStreamDefaultReader`, decodes SSE data frames, and renders them dynamically through our custom `LegalMarkdownRenderer`."* |
| **5** | *"How is conversation memory preserved across questions?"* | *"Our matter threads pass up to the last 8 conversation turns in the request payload. The backend Stage 8 synthesis includes these turns as user/assistant context in the chat completion prompt, allowing natural follow-ups."* |
| **6** | *"What database technologies are running in your stack?"* | *"We use a polyglot persistence architecture: PostgreSQL 16 for relational matters and audit logs, Qdrant for 384-dimensional vector similarity search, and Neo4j for statutory graph relationship mapping."* |

---

## 🚀 Quick Commands to Run the Demo

```bash
# 1. Start Docker Containers (Postgres, Qdrant, Neo4j, Ollama)
docker compose up -d

# 2. Start Backend Server (FastAPI on Port 8000)
cd d:\capstone\backend
.\venv\Scripts\python.exe -m uvicorn --app-dir d:/capstone/backend app.main:app --host 0.0.0.0 --port 8000

# 3. Start Frontend Client (Next.js on Port 3000)
cd d:\capstone\frontend
npm run dev
```

*Open your browser at: **`http://localhost:3000/assistant`***
