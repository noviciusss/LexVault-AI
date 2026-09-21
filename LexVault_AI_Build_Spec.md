# LexVault AI — Full-Stack Build Specification
**For: Antigravity (agentic build)**
**Type: Real, working capstone prototype — not a mockup**

---

## 0. What this document is

This is a complete build brief for **LexVault AI**, a secure institutional legal-knowledge platform. It is written so an agentic coding tool (Antigravity) can build the entire thing end-to-end: real backend, real pipeline, real databases, real UI — demoable for a capstone submission.

Everything marked **[REQUIRED]** must work for the demo to be credible. Everything marked **[STRETCH]** is a nice-to-have if time allows.

Read this whole file before writing code. Build backend-first per the milestone order in §14 — a working pipeline with a plain UI beats a beautiful UI wired to nothing.

---

## 1. Product Concept (source: capstone deck)

**Problem:** Law firms lose decades of undocumented senior-lawyer expertise. Lawyers won't document it because billing pressure eats their time, and public LLMs (ChatGPT, etc.) can't be used because of attorney-client privilege. Firms keep re-solving problems they've already solved.

**Solution — four coordinated capabilities:**
1. **Personal Knowledge Vault** — on-device capture of a lawyer's own working knowledge (notes, voice, OCR).
2. **Secure Knowledge Publishing** — sanitized insights reviewed by a human, then published firm-wide.
3. **Firm Intelligence Hub** — a searchable, structured store of accumulated institutional expertise (vector + graph).
4. **Safe AI Assistant Integration** — firm knowledge exposed to an AI assistant under guardrails (RAG, no raw client data).

**The 8-stage pipeline (this is the spine of the whole app):**

```
1. Lawyer Notes / Voice / OCR  →  raw capture
2. Local AI Processing          →  transcribe / clean / structure
3. PII Removal                  →  strip client-identifying data
4. Strategy Abstraction         →  generalize the insight (facts → reusable pattern)
5. Lawyer Approval               →  human-in-the-loop gate before publishing
6. Vector DB + Knowledge Graph   →  embed + store, link entities/concepts
7. RAG Retrieval                 →  semantic + graph retrieval at query time
8. Safe Response                 →  guardrailed answer, cites internal sources only
```

Every screen in the app should visibly correspond to one or more of these 8 stages — this traceability is the whole point of the product and of the demo.

---

## 2. What "real and working" means for a capstone (scope decisions)

You do not need actual enterprise infra. You need **real, running instances of the right category of tool**, wired together correctly, with genuine data flowing through all 8 stages. Use these concrete, free/local substitutions for the deck's tech:

| Deck says | Build with (real, runnable, free) |
|---|---|
| Gemini Nano (on-device LLM) | **Ollama** running a small local model (`llama3.2:3b` or `phi3:mini`) — genuinely local, genuinely private |
| Gemini Pro (cloud LLM for abstraction/RAG synthesis) | **Google Gemini API** (`gemini-2.0-flash` or similar) via API key — free tier is enough for a demo. If no key is available, fall back to the same local Ollama model so the app still fully works offline |
| Microsoft Presidio | **Presidio** (`presidio-analyzer` + `presidio-anonymizer`), actual pip packages — real PII detection, not a regex hack |
| Qdrant / Pinecone | **Qdrant**, self-hosted via Docker (free, no account needed) |
| Neo4j | **Neo4j Community Edition**, via Docker |
| BGE / E5 embeddings | **`sentence-transformers`** with `BAAI/bge-small-en-v1.5` (small, fast, runs on CPU) |
| OCR | **Tesseract** via `pytesseract`, or `easyocr` |
| Voice | Browser `MediaRecorder` → send audio blob → **`faster-whisper`** (local Whisper) for transcription |

This gives you a **fully real pipeline** — nothing is faked — while staying runnable on a laptop with `docker compose up`.

---

## 3. Tech Stack

**Frontend**
- Next.js 14+ (App Router), TypeScript
- Tailwind CSS
- shadcn/ui (Radix-based components — buttons, dialogs, tabs, cards, forms, toasts)
- **Framer Motion** — page transitions, staggered card reveals, the pipeline-stage animation, approval-queue swipe/slide interactions
- **Lucide-react** — icon set (matches shadcn aesthetic)
- **Recharts** — capability/usage charts, knowledge-graph growth over time
- **React Flow (`reactflow`)** — for rendering the 8-stage pipeline as an actual interactive animated diagram, and for visualizing the knowledge graph
- **Zustand** — lightweight client state (current pipeline job status, live stage progress)
- **`@tanstack/react-query`** — server state, polling job status
- Socket.IO client (or native WebSocket) — live pipeline progress updates, not polling-only

**Backend**
- **FastAPI** (Python 3.11+), fully async
- **SQLModel** or SQLAlchemy + **PostgreSQL** — users, firms, knowledge items, approval queue, audit log
- **Qdrant** client — vector storage/search
- **Neo4j** driver (`neo4j` python package) — entity/concept graph
- **Presidio** — PII detection + anonymization
- **sentence-transformers** — embeddings
- **Ollama** (via `ollama` python client or HTTP) — local LLM
- **Google Generative AI SDK** — cloud LLM (optional, graceful fallback)
- **Celery + Redis**, OR simple **FastAPI BackgroundTasks** with a job-status table (pick Celery only if you have time — BackgroundTasks + polling table is enough for a capstone and much less setup)
- **python-socketio** (ASGI) for live pipeline progress push
- JWT auth (`python-jose` + `passlib`)

**Infra**
- Docker Compose: `postgres`, `qdrant`, `neo4j`, `redis` (if using Celery), `ollama`
- `.env` for secrets (`GEMINI_API_KEY`, `JWT_SECRET`, `DATABASE_URL`, etc.)

---

## 4. Design System — make it look like a real security/legal product, not a generic SaaS template

**Visual direction:** "Institutional trust + quiet confidence." Think Linear × a modern law-firm brand. Not playful, not corporate-boring either. Dark-mode-first with a deep navy/graphite base and a single confident accent.

- **Palette:**
  - Background: `#0B0F14` (near-black navy) for dark mode / `#FFFFFF` for light mode — support both, default dark
  - Surface/cards: `#131922` (dark) / `#F7F8FA` (light)
  - Accent: a deep emerald or amber-gold (`#C9A24B` gold reads "legal/institutional"; `#2FBF8F` emerald reads "secure/verified" — pick one and use it as the *only* accent color throughout, never both)
  - Text: near-white `#E7EAEE` on dark, near-black `#12151A` on light
  - Status colors: success `#2FBF8F`, warning `#E0A93E`, danger `#E0554F` — used only for PII-flag badges, approval states, pipeline stage status
- **Typography:** A geometric sans for headings (e.g. `Inter` or `Geist`), and a slightly warmer serif or humanist sans for body/quotes to nod at "legal document" without being literal (e.g. `Source Serif 4` for pull quotes only). Tight tracking on large headings, generous line-height on body.
- **No AI-slide clichés:** no accent underlines beneath titles, no vertical sidebar stripes, no gradient blob backgrounds, no cream/beige defaults. Use whitespace, subtle 1px borders (`border-white/10`), and soft shadows for hierarchy instead.
- **Motion language (Framer Motion):**
  - Page/section entry: fade + 12px upward slide, staggered by 60ms per child
  - Pipeline diagram: stages light up sequentially with a traveling glow/pulse along the connecting lines as a job moves through them — this is the single most important animation in the app, it *is* the product demo
  - Approval queue cards: slide-and-fade out on approve/reject, spring physics
  - Numbers (stats): count-up animation on scroll into view
  - Respect `prefers-reduced-motion`

---

## 5. Repo Structure

```
lexvault-ai/
├── docker-compose.yml
├── .env.example
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── (marketing)/page.tsx        # landing page (the "pitch" — mirrors the deck)
│   │   ├── (app)/dashboard/            # main authenticated app
│   │   ├── (app)/capture/              # notes/voice/OCR capture UI
│   │   ├── (app)/pipeline/[jobId]/     # live 8-stage pipeline visualization
│   │   ├── (app)/approvals/            # lawyer approval queue
│   │   ├── (app)/knowledge-hub/        # search + browse firm knowledge
│   │   ├── (app)/graph/                # knowledge graph explorer
│   │   ├── (app)/assistant/            # RAG chat ("Safe AI Assistant")
│   │   └── (app)/admin/                # firm/user/audit log admin
│   ├── components/
│   ├── lib/
│   └── store/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/                # routers: auth, capture, pipeline, approvals, search, chat, graph, admin
│   │   ├── pipeline/           # one module per stage — stage1_capture.py ... stage8_response.py
│   │   ├── models/             # SQLModel tables
│   │   ├── services/           # ollama_client.py, gemini_client.py, presidio_service.py, qdrant_service.py, neo4j_service.py, embedding_service.py
│   │   ├── ws/                 # socket.io job-progress broadcaster
│   │   └── core/               # config, security, deps
│   └── requirements.txt
└── README.md
```

---

## 6. Data Model (Postgres)

- `User` — id, name, email, hashed_password, role (`lawyer` / `reviewer` / `admin`), firm_id
- `Firm` — id, name
- `KnowledgeItem` — id, author_id, firm_id, status (`draft`/`processing`/`pending_approval`/`approved`/`rejected`/`published`), raw_input_type (`text`/`voice`/`ocr`), raw_text, sanitized_text, abstracted_insight, pii_entities_found (JSON), current_stage (1-8), created_at, approved_by, approved_at, vector_id, graph_node_id
- `PipelineJob` — id, knowledge_item_id, stage, status (`pending`/`running`/`done`/`failed`), started_at, finished_at, error_message
- `AuditLogEntry` — id, actor_id, action, target_type, target_id, timestamp, metadata (JSON) — **every PII removal, approval, rejection, and AI-assistant query must be logged here.** This log is a first-class feature, not an afterthought — surface it in the Admin page.
- `ChatQuery` — id, user_id, question, retrieved_item_ids (JSON), answer, created_at

**Neo4j graph schema:**
- Nodes: `(:KnowledgeItem)`, `(:Concept)`, `(:PracticeArea)`, `(:Lawyer)`
- Relationships: `(:KnowledgeItem)-[:MENTIONS]->(:Concept)`, `(:KnowledgeItem)-[:BELONGS_TO]->(:PracticeArea)`, `(:Lawyer)-[:AUTHORED]->(:KnowledgeItem)`, `(:Concept)-[:RELATED_TO]->(:Concept)`

---

## 7. Pipeline — implementation detail per stage

**[REQUIRED] Stage 1 — Capture**
- Text input (rich textarea), voice recording (`MediaRecorder` in browser → webm/wav blob upload), and file/image upload for OCR (PDF or image).
- Backend: voice → `faster-whisper` transcription; image/PDF → `pytesseract`/`easyocr`.
- Creates a `KnowledgeItem` with `status=processing`, `current_stage=1`. Emits a WS event immediately so the frontend can jump to the live pipeline view.

**[REQUIRED] Stage 2 — Local AI Processing**
- Send raw transcript/OCR text to **Ollama** (local model) to clean it up: fix transcription errors, structure into paragraphs, extract a working title. This step must actually call a running local model — this is the "on-device AI" claim, so it has to be genuinely local.

**[REQUIRED] Stage 3 — PII Removal**
- Run **Presidio Analyzer** to detect entities (PERSON, ORG, LOCATION, EMAIL, PHONE, custom recognizer for case numbers / client names if you add one).
- Run **Presidio Anonymizer** to redact/replace them (`<CLIENT_NAME>`, `<ORG>`, etc.).
- Store both `pii_entities_found` (for the UI to show "we removed 3 names, 1 org, 1 phone number" — this transparency is a key selling point) and `sanitized_text`.

**[REQUIRED] Stage 4 — Strategy Abstraction**
- Send `sanitized_text` to an LLM (Gemini API if key present, else the local Ollama model) with a prompt instructing it to extract the *reusable legal strategy/pattern* from the sanitized facts — i.e., turn "what happened in this specific (anonymized) case" into "the general principle/approach a lawyer could reuse." Store as `abstracted_insight`.

**[REQUIRED] Stage 5 — Lawyer Approval**
- Item enters `pending_approval`. Appears in the `/approvals` queue for a `reviewer`/`admin` role user.
- Reviewer sees: original sanitized text, the abstracted insight, and the PII-removal diff, side by side. Approve / Reject / Edit-then-approve.
- This is a **real gate** — nothing reaches the vector DB or graph without an explicit approval action recorded with `approved_by` + timestamp in the audit log.

**[REQUIRED] Stage 6 — Vector DB + Knowledge Graph**
- On approval: embed `abstracted_insight` with `sentence-transformers` (bge-small), upsert into **Qdrant** with metadata (practice area, firm, date, item id).
- Extract entities/concepts (simple approach: ask the LLM to return a JSON list of `{concept, practice_area}`; more advanced: spaCy NER) and write nodes/edges into **Neo4j**.
- `status` → `published`.

**[REQUIRED] Stage 7 — RAG Retrieval**
- `/assistant` chat: embed the user's question, query Qdrant for top-k similar published items (filtered by firm), optionally expand context by walking related `Concept` nodes in Neo4j one hop out.

**[REQUIRED] Stage 8 — Safe Response**
- Feed retrieved chunks + question to the LLM with a strict system prompt: *answer only from the provided context, cite the source KnowledgeItem ids, refuse if the answer isn't supported by retrieved context, never invent client specifics.*
- Response UI must show which internal knowledge items were cited (clickable, links to the item) — this is the "guardrails" story, make it visible, not just true.

---

## 8. Pages & Key Screens

1. **Landing / pitch page** — mirrors the 10-slide deck (hero, problem, solution, animated 8-stage pipeline diagram, features grid with checkmarks, tech stack table, GTM, roadmap, CTA). This is what you screen-record first for the submission.
2. **Auth** — login/register, pick role for demo purposes (lawyer vs reviewer) so you can show both sides of stage 5.
3. **Dashboard** — recent knowledge items with status badges, quick-capture button, stats (items captured, published, avg time-to-publish) with count-up animation.
4. **Capture** — the three input modes (text/voice/OCR), submits and redirects to the live pipeline view.
5. **Pipeline view (`/pipeline/[jobId]`)** — **the centerpiece.** A `reactflow` diagram of all 8 stages, animated in real time via WebSocket as the job progresses: each stage node pulses "running" → turns green "done", with the actual intermediate output (e.g. redacted entities found, abstracted insight text) revealed in a side panel as each stage completes.
6. **Approvals** — queue for reviewers, approve/reject/edit UI described in Stage 5.
7. **Knowledge Hub** — search/browse published items (filters: practice area, date, author), semantic search box.
8. **Graph Explorer** — interactive Neo4j graph rendered with `reactflow` or `react-force-graph`, click a concept to see related knowledge items.
9. **AI Assistant** — chat interface, cites sources, shows a small "guardrail" indicator when it refuses to answer from outside context.
10. **Admin** — audit log table (filterable, exportable), user/firm management.

---

## 9. Auth & Roles

Simple JWT auth is enough. Two roles suffice for the demo: `lawyer` (captures + can review own items only) and `admin` (sees everything, approves everyone's items, sees audit log). Seed the DB with 2-3 demo users on first run so you're not creating accounts live during the presentation.

---

## 10. Setup

`docker-compose.yml` should bring up Postgres, Qdrant, Neo4j, and Ollama with one command. Provide a `Makefile` or npm scripts:

```
make up        # docker compose up -d, then run backend migrations, then pull the ollama model
make seed      # seed demo users + a few pre-populated published KnowledgeItems so the Hub/Graph/Assistant aren't empty on first load
make dev       # run backend (uvicorn --reload) + frontend (next dev) concurrently
```

`.env.example` should list every required variable including `GEMINI_API_KEY=` (optional — document that leaving it blank falls back to local-only mode).

**Important for the demo:** seed at least 8-10 realistic (but fictional) published knowledge items across 2-3 practice areas before presenting, so the Knowledge Hub, Graph Explorer, and Assistant have real content to show instead of an empty state. Also seed 2-3 items sitting in `pending_approval` so the Approvals queue isn't empty either.

---

## 11. Build Order (milestones)

1. Docker compose up; Postgres schema + auth working (login/register, seeded users)
2. Stage 1-3 working backend-only (curl/Postman): capture → Ollama cleanup → Presidio redaction, visible in DB
3. Stage 4-6 working backend-only: abstraction → approval endpoint → Qdrant + Neo4j writes on approval
4. Stage 7-8 working backend-only: RAG chat endpoint returns cited answers
5. Frontend shell: auth pages, dashboard, capture form wired to real backend (no animation yet, just working)
6. Pipeline live-view page with WebSocket wiring — get the data flowing before polishing the animation
7. Approvals, Knowledge Hub, Graph Explorer, Assistant chat UI wired to real endpoints
8. Landing/pitch page (do this after the app works — you'll know what's true to advertise)
9. Framer Motion polish pass across all pages, design-system pass (colors/type/spacing consistency)
10. Seed realistic demo data, write the audit log admin view, do a full run-through as if presenting

---

## 12. Demo Script (write this once the app works — for your own presentation)

Suggested flow: Landing page pitch (30s) → log in as lawyer → capture a note with a fake client name in it → watch the live pipeline animate through all 8 stages, pausing to show the PII that got caught and redacted → log in as admin/reviewer → approve it in the queue → go to Knowledge Hub, see it published → go to Assistant, ask a question that this new item answers, show the cited source → open Graph Explorer, show the new concept node connected in → open Admin audit log, show every action just taken is logged with who/when.

---

## 13. Open questions for you to confirm before build starts

- Do you have (or want to get) a **Gemini API key** for Stage 4/8, or should everything run on local Ollama only (fully offline, simpler, slightly lower quality abstraction/answers)?
- Any preference on the accent color (gold vs emerald, per §4)?
- Do you want Celery+Redis for background jobs, or is FastAPI BackgroundTasks + a status-polling table acceptable (recommended — much less infra to debug before your deadline)?
- Rough deadline, so the milestone order in §11 can be paced against it?

---

## 14. Stretch Goals [STRETCH — only if core is done early]

- Cross-firm benchmarking view (per the deck's roadmap slide) using anonymized aggregate stats
- Compliance-monitoring dashboard (flags knowledge items whose source practice area has regulatory keywords)
- Multi-firm tenancy isolation testing (prove firm A can never retrieve firm B's vectors/graph)
- Export a "case study" PDF of a published knowledge item
