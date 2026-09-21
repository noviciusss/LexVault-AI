# LexVault-AI

> **Secure Institutional Legal Knowledge Platform & Practice Intelligence Suite for Indian Law Firms**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://www.python.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-DC2626)](https://qdrant.tech/)
[![Neo4j](https://img.shields.io/badge/Neo4j-Graph%20DB-008CC1?logo=neo4j)](https://neo4j.com/)
[![License](https://img.shields.io/badge/License-Proprietary-gold)]()

---

## 🏛️ Executive Summary

**LexVault AI** resolves the fundamental dilemma of modern legal practice: **how to unlock decades of undocumented senior attorney wisdom without compromising attorney-client privilege or Bar Council ethical mandates.**

Attorneys routinely resolve complex regulatory, commercial, and criminal matters, but billing pressures prevent formal knowledge documentation. Senior partners retire or leave firms, taking unwritten strategies with them. Meanwhile, pasting confidential client documents into commercial public AI tools risks ethical sanctions and privilege forfeiture.

LexVault AI solves this through an **8-Stage Guardrailed Local AI Pipeline** combined with **strict multi-tenant database isolation**, **modern Indian criminal law cross-referencing (BNS/BNSS/BSA)**, a **bilingual Indian Constitution Explorer**, and an integrated **Litigation Suite**.

---

## 🚀 Key Architectural Innovations

### 1. 8-Stage On-Device & Guardrailed Ingestion Pipeline
```
[1. Raw Capture] ➡️ [2. Local OCR/Whisper] ➡️ [3. Presidio PII Removal] ➡️ [4. Strategy Abstraction]
                                                                                     ⬇️
[8. Safe AI Response] ⬅️ [7. Isolated RAG] ⬅️ [6. Qdrant & Neo4j DB] ⬅️ [5. Partner Review Gate]
```
1. **Raw Capture**: Intake through typed notes, faster-whisper voice dictation, or document OCR.
2. **Local AI Processing**: Text normalization and language identification (English & Devanagari Hindi).
3. **Presidio PII Stripping**: On-device sanitization of Indian Aadhaar, PAN cards, phone numbers, and entity names.
4. **Strategy Abstraction**: Strips matter specifics and distills core transferable legal principles.
5. **Human-In-The-Loop Gate**: Senior Partners review and approve/reject before publication.
6. **Isolated Storage**: Ingested into firm-partitioned collections in Qdrant Vector DB and Neo4j Knowledge Graph.
7. **Multi-Tenant RAG**: Strict filtering ensuring Firm A cannot access or retrieve Firm B precedents.
8. **Audited Safe Response**: Every query, redaction, and approval is logged in an immutable audit ledger.

---

### 2. Complete India Legal System Architecture

- **BNS / BNSS / BSA Modern Criminal Code Layer**:
  - Live cross-reference engine resolving legacy IPC ↔ BNS, CrPC ↔ BNSS, and IEA ↔ BSA (enacted 1 July 2024).
  - Instant citation resolver (e.g. `IPC 302` ➡️ `BNS 103`, `IPC 376` ➡️ `BNS 64`, `CrPC 41A` ➡️ `BNSS 35(3)`).
- **🇮🇳 Bilingual Indian Constitution Explorer**:
  - Full-text explorer across landmark Constitutional Articles (Articles 14, 19, 21, 32, 226, 300A, etc.).
  - Side-by-side English statutory text and authoritative Hindi Devanagari (हिन्दी पाठ) with landmark Supreme Court precedents (*Kesavananda Bharati*, *Maneka Gandhi*, *Puttaswamy*).
- **Codified Statute Library**:
  - Indian Contract Act (1872), Civil Procedure Code (CPC 1908), Specific Relief Act (1963), Transfer of Property Act (1882), Insolvency and Bankruptcy Code (IBC 2016), and Limitation Act (1963).
- **15 Pre-Loaded Real-World Practice Case Scenarios**:
  - Ready-to-demonstrate templates in `/capture` covering BNS criminal defense, NCLT Section 9 CIRP (*Mobilox*), Section 27 non-compete covenants, Order 39 interim injunctions, and Section 138 NI Act cheque dishonour.

---

### 3. Litigation Suite & Practice Tools (`/tools`)

- **Limitation Calculator**: Computes exact limitation periods under the Limitation Act, 1963 with statutory articles and landmark precedents (*Dahiben v. Arvindbhai*).
- **Conflict of Interest Checker**: Scans internal firm records to detect adversarial conflicts before signing a Vakalatnama.
- **AI Judgment Summarizer**: Parses multi-page Indian court judgments into Ratio Decidendi, Issues, and Operative Orders.
- **Associate Quiz Mode**: Interactive training module testing associates against real institutional precedents.
- **Hearing Tracker**: Court diary tracking upcoming listings in High Courts, Sessions, and NCLT with persistent storage.

---

## 🔒 Strict Multi-Tenancy Isolation

LexVault enforces multi-tenancy at the database, vector, and graph layers:
- **Firm 1**: *Chandra & Rao Associates (Mumbai)* — Corporate Insolvency, Securities, Property, and BNS Defence.
- **Firm 2**: *NyayaVault India Platform (New Delhi)* — Constitutional Law, Writs, Family Law, and Civil Procedure.
- **Automated Verification**: `python test_isolation.py` proves 0 overlapping items between firms.

```bash
# Verify isolation
cd backend
python test_isolation.py
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Vanilla Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend** | FastAPI, Python 3.11, SQLModel / SQLAlchemy Async, Pydantic v2 |
| **Vector DB** | Qdrant (cosine similarity, firm_id payload isolation) |
| **Graph DB** | Neo4j (Cypher query language, precedent entity relationships) |
| **Relational DB** | PostgreSQL 16 (with SQLite local fallback) |
| **PII & Privacy** | Microsoft Presidio, Spacy `en_core_web_sm`, Indian RegEx Patterns (PAN, Aadhaar) |
| **Local AI / OCR** | Faster-Whisper, EasyOCR, Tesseract, Ollama / Groq fallback |

---

## 📦 Getting Started

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+ & npm

### 2. Start Supporting Infrastructure (Docker)
```bash
docker compose up -d
```
This starts PostgreSQL (port 5432), Qdrant (port 6333), Neo4j (ports 7474 / 7687), and Ollama (port 11434).

### 3. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m app.seed
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 👥 Demo User Credentials

| Firm | Attorney | Email | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Chandra & Rao Associates** | Adv. Rohit Kulkarni | `rohit@chandrarao.law` | `password123` | Lawyer |
| **Chandra & Rao Associates** | Adv. Meera Rao | `meera.rao@chandrarao.law` | `password123` | Senior Partner / Admin |
| **NyayaVault India** | Adv. Arjun Sharma | `arjun@nyayavault.in` | `password123` | Lawyer |
| **NyayaVault India** | Adv. Priya Narayanan | `priya@nyayavault.in` | `password123` | Managing Partner / Admin |

---

## 📜 Repository Structure

```
d:/capstone/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, capture, pipeline, knowledge, statutes, tools)
│   │   ├── core/            # Configuration, database engine, security
│   │   ├── data/            # BNS/IPC mapping, codified statutes, Constitution
│   │   ├── models/          # SQLModel relational schema
│   │   ├── pipeline/        # 8-stage pipeline orchestrator & storage
│   │   ├── services/        # Presidio, Qdrant, Neo4j, OCR, Whisper, Groq
│   │   ├── main.py          # FastAPI application entrypoint
│   │   └── seed.py          # Database seeding for Indian firms & precedents
│   └── test_isolation.py    # Multi-tenancy isolation automated test
├── frontend/
│   ├── app/                 # Next.js 14 App Router pages
│   │   ├── capture/         # Intake form with 15 Indian case presets
│   │   ├── knowledge-hub/   # Precedents, Constitution Explorer, Statute Library
│   │   ├── tools/           # Limitation Calculator, Conflict Checker, Quiz, Hearings
│   │   ├── approvals/       # Stage 5 Partner review queue
│   │   ├── assistant/       # Guardrailed AI chat assistant
│   │   ├── pipeline/        # Live 8-stage visualizer
│   │   └── dashboard/       # Firm workspace & analytics
│   ├── components/          # Reusable UI components & custom LexVault Logo
│   ├── lib/                 # Type-safe API client
│   └── store/               # Zustand global state (user profile, multi-tenant switcher)
├── docker-compose.yml       # Supporting microservices
├── .gitignore               # Strict exclusion rules
└── README.md                # Project documentation
```

---

## ⚖️ Ethical & Compliance Disclaimer

LexVault AI is engineered in strict accordance with the **Bar Council of India Rules on Professional Standards and Etiquette** and the **Advocates Act, 1961**. All client facts undergo irreversible on-device sanitization prior to knowledge abstraction. Cross-tenant indexing is mathematically prevented at the database schema and vector partition levels.
