# LexVault AI — Pure Indian Legal Knowledge Platform & Architecture Guide

**Version**: 2.0 (Pure Indian Jurisdiction Pivot + BNS/BNSS/BSA Codified Upgrade)  
**Jurisdiction**: Republic of India (Supreme Court of India, High Courts, NCLT, Sessions Courts)  
**Enacted Criminal Codes**: Bharatiya Nyaya Sanhita (BNS, 2023), Bharatiya Nagarik Suraksha Sanhita (BNSS, 2023), Bharatiya Sakshya Adhiniyam (BSA, 2023)  
**Multi-Tenancy**: 100% Mathematically Isolated across Indian Firms

---

## 1. Multi-Tenant Indian Firms & Verified Isolation

All US firms, attorneys, and American case precedents (Blackstone LLP, Delaware Chancery, etc.) have been completely removed. LexVault AI operates as an institutional multi-firm platform for Indian law firms:

### Firm 1: Chandra & Rao Associates (Mumbai)
- **Focus Area**: Commercial Litigation, Corporate Insolvency, SEBI & Securities Law, Property Law
- **Users**:
  - `rohit@chandrarao.law` / `password123` (Litigation Counsel / Senior Associate, role: lawyer)
  - `meera.rao@chandrarao.law` / `password123` (Managing Partner, role: admin)
  - `karan@chandrarao.law` / `password123` (Corporate Associate, role: lawyer)
- **Precedent Corpus**: 5 published strategies + 2 pending partner approval:
  - **Item #101**: NCLT Section 9 IBC: Operational Creditor Invalidation via Pre-Existing Dispute Threshold (*Mobilox Doctrine*)
  - **Item #102**: SEBI PFUTP & PIT Regulations: Defense Architecture Against Algorithmic Insider Trading (*Trading Plan Safe Harbor*)
  - **Item #103**: Transfer of Property Act Section 54: Invalidation of GPA / Agreement to Sell as Title (*Suraj Lamp Doctrine*)
  - **Item #104**: धारा ६४ बीएनएस / धारा ३७६ भा.दं.वि. (BNS 64 / IPC 376): Rape vs Consensual Relationship Trial Defence (*Anurag Soni Precedent*)
  - **Item #105**: Specific Relief Act Section 10: Mandatory Specific Performance Post-2018 Architecture
  - **Item #106 (Pending)**: Commercial Courts Act Section 12A: Mandatory Pre-Institution Mediation Exemption Bar (*Patil Automation*)
  - **Item #107 (Pending)**: Arbitration Act Section 34: Patent Illegality & Re-Appreciation of Evidence (*Ssangyong Precedent*)

### Firm 2: NyayaVault India Platform (New Delhi)
- **Focus Area**: Constitutional Law, Fundamental Rights Writs, Criminal Law (BNS/IPC), Family Law & CPC
- **Users**:
  - `arjun@nyayavault.in` / `password123` (Advocate on Record / Lawyer)
  - `priya@nyayavault.in` / `password123` (Senior Partner / Admin)
  - `vikram@nyayavault.in` / `password123` (Litigation Associate)
- **Precedent Corpus**: 10 published strategies + 3 pending partner approval:
  - **Item #201**: अनुच्छेद २१ एवं निजता का मौलिक अधिकार — डिजिटल साक्ष्य एवं सर्विलांस चुनौती (*K.S. Puttaswamy 9-Judge Bench*)
  - **Item #202**: Article 14 & Arbitrary State Tender Cancellations (*Non-Arbitrariness & Shrilekha Vidyarthi Precedent*)
  - **Item #203**: धारा ४९८-क भा.दं.वि. / धारा ८५ बीएनएस — अरणेश कुमार दिशा-निर्देश एवं अग्रिम जमानत कार्ययोजना (*Arnesh Kumar Guidelines*)
  - **Item #204**: Order 39 Rules 1 & 2 CPC: Interim Injunction Tripartite Test in Trademark Infringement
  - **Item #205**: धारा २७ भारतीय अनुबंध अधिनियम, १८७२ — रोजगार अनुबंधों में गैर-प्रतिस्पर्धा (Non-Compete) शून्यता (*Niranjan Golikari*)
  - **Item #206**: Article 32 & 226 Writs: Habeas Corpus and Quo Warranto Procedural Playbook
  - **Item #207**: Hindu Marriage Act Section 13B: Mutual Consent Divorce Six-Month Cooling Period Waiver (*Amardeep Singh*)
  - **Item #208**: धारा ३१८ बीएनएस / धारा ४२० भा.दं.वि. — दीवानी विवादों का आपराधिक रूप में दुरुपयोग रोकने की रणनीति (*V.Y. Jose*)
  - **Item #209**: Section 56 Indian Contract Act: Doctrine of Frustration and Commercial Impossibility (*Energy Watchdog*)
  - **Item #210**: Section 9 vs Section 17 Arbitration Act: Interim Relief Post-2015 Amendment Architecture
  - **Item #301 (Pending)**: अनुच्छेद ३२ रिट याचिका — विचाराधीन कैदियों की जमानत एवं त्वरित न्याय (*Hussainara Khatoon & BNSS 479*)
  - **Item #302 (Pending)**: CPC Order 7 Rule 11: Rejection of Plaint for Want of Cause of Action in Property Disputes (*Dahiben*)
  - **Item #303 (Pending)**: घरेलू हिंसा अधिनियम, २००५ (DV Act) — साझा घर (Shared Household) निवास अधिकार (*Satish Chander Ahuja*)

---

## 2. Multi-Tenancy Isolation Proof

In accordance with strict ethical rules and client confidentiality:
1. **Database Layer**: Every SQL query on `knowledge_items`, `audit_log`, `chat_queries` explicitly enforces `WHERE firm_id = current_user.firm_id`.
2. **Qdrant Vector Database Layer**: Vector similarity queries execute with a mandatory filter:
   ```python
   Filter(must=[FieldCondition(key="firm_id", match=MatchValue(value=current_user.firm_id))])
   ```
3. **Automated Test Confirmation**: `backend/test_isolation.py` verifies that logging in as `rohit@chandrarao.law` returns only Firm 1 items, and logging in as `arjun@nyayavault.in` returns only Firm 2 items, with **zero overlapping IDs**.

---

## 3. BNS / BNSS / BSA Criminal Code Mapping Layer

Enacted on 1 July 2024, India's three new criminal codes replaced the Indian Penal Code (1860), Code of Criminal Procedure (1973), and Indian Evidence Act (1872). LexVault AI includes an interactive bidirectional cross-reference engine:

### Key Statute Mappings
| Modern Codified Section | Legacy Section | Legal Subject | Bail / Cognizability |
| :--- | :--- | :--- | :--- |
| **BNS §103** | IPC §302 | Punishment for Murder (Includes 103(2) Mob Lynching) | Non-Bailable / Cognizable |
| **BNS §101** | IPC §300 | Murder Defined (Mens Rea threshold) | Non-Bailable / Cognizable |
| **BNS §64** | IPC §376 | Punishment for Rape (Min 10 years to Life) | Non-Bailable / Cognizable |
| **BNS §69** | *New Section* | Sexual Intercourse by Deceitful Means / False Promise to Marry | Non-Bailable / Cognizable |
| **BNS §85** | IPC §498A | Cruelty by Husband or Relatives (Dowry Harassment) | Non-Bailable / Cognizable |
| **BNS §318** | IPC §420 | Cheating and Dishonestly Inducing Delivery of Property | Non-Bailable / Cognizable |
| **BNS §316** | IPC §405/406 | Criminal Breach of Trust | Non-Bailable / Cognizable |
| **BNS §152** | IPC §124A | Endangering Sovereignty and Unity of India (Replaces Sedition) | Non-Bailable / Cognizable |
| **BNSS §35** | CrPC §41A | Notice of Appearance Before Police (Arnesh Kumar arrest safeguards) | Mandatory Procedural Bar |
| **BNSS §173** | CrPC §154 | FIR & e-FIR Registration (Mandatory Electronic FIR) | Procedural Mandate |
| **BNSS §479** | CrPC §436A | Statutory Bail for Undertrials (1/3rd period for first-time offenders) | Statutory Bail |
| **BNSS §528** | CrPC §482 | Inherent Powers of High Court (FIR / Chargesheet Quashing) | Inherent Jurisdiction |
| **BSA §61** | IEA §65B | Electronic Records Admissibility (Certificate of Digital Devices) | Evidentiary Requirement |

### API Endpoints
- `GET /api/statutes/bns-map?ipc=302` — Retrieve BNS equivalent for IPC section
- `GET /api/statutes/resolve?cite=IPC+376` — Instant string citation resolution
- `GET /api/statutes/library?act=BNS` — List codified sections with bilingual text

---

## 4. Statute Library Dataset

Covering 21 foundational provisions across 10 central Indian acts:
1. **BNS (Bharatiya Nyaya Sanhita, 2023)** — Sections 103, 64, 85, 318
2. **BNSS (Bharatiya Nagarik Suraksha Sanhita, 2023)** — Sections 35, 173, 528
3. **BSA (Bharatiya Sakshya Adhiniyam, 2023)** — Section 61
4. **Indian Contract Act, 1872** — Sections 27 (Non-compete void), 56 (Frustration), 73 (Damages)
5. **Code of Civil Procedure, 1908** — Order 39 Rules 1-2 (Interim Injunctions), Order 7 Rule 11 (Rejection of Plaint)
6. **Specific Relief Act, 1963** — Section 10 (Mandatory Specific Performance post-2018 amendment)
7. **Transfer of Property Act, 1882** — Sections 52 (Lis Pendens), 54 (Sale Deed requirement)
8. **Insolvency & Bankruptcy Code, 2016** — Sections 9 (Operational Debt Pre-Existing Dispute), 14 (Moratorium)
9. **Limitation Act, 1963** — Article 54 (Specific Performance 3-year limitation), Section 5 (Condonation of Delay)
10. **Arbitration and Conciliation Act, 1996** — Section 9 (Interim relief by court)

---

## 5. Litigation & Practice Management Suite (`/tools`)

A dedicated litigation workbench designed specifically for Indian advocates:

### 1. Statutory Limitation Calculator
- **Act**: Limitation Act, 1963 & Special Statutes
- **Supported Matter Types**:
  - Specific Performance of Contract (Article 54 — 3 years)
  - Declaratory Suit (Article 58 — 3 years)
  - Debt / Money Recovery (Articles 19 & 22 — 3 years)
  - Immovable Property Possession based on Title (Article 65 — 12 years)
  - Cheque Dishonour Complaint (NI Act Section 138 / Section 142 — 30-day notice + 15-day cure + 30-day filing window)
  - Consumer Protection Act Complaint (CPA Section 69 — 2 years)
  - Criminal Appeal to High Court (Article 115 — 60 days)
  - Special Leave Petition (SLP) to Supreme Court of India (Supreme Court Rules — 90 days)
- **Output**: Exact computed deadline date, days remaining, time-barred alert, and Section 5 Condonation of Delay guidance.

### 2. Multi-Tenant Conflict Checker
- **Function**: Scans all case files, consultation notes, and knowledge entries in the current firm's vault for adversary or client names.
- **Privacy Assurance**: 100% restricted to the active firm's records — zero cross-firm leakage.

### 3. AI Judgment & Order Summarizer
- **Function**: Processes raw Supreme Court, High Court, or NCLT judgments.
- **Structured Briefing Output**:
  1. Case Details & Bench
  2. Principal Legal Issues
  3. Statutes & Constitutional Articles Examined
  4. Ratio Decidendi (Binding Legal Principle)
  5. Operative Order / Disposition

### 4. Junior Associate & Intern Precedent Quiz Mode
- **Function**: Blind-tests associates and interns on internal firm precedents, landmark rulings, and statutory strategies.
- **Interactive UI**: Displays doctrine excerpt and practice area hint; user clicks to reveal answer precedent and strategy.

### 5. Court Hearing Tracker
- **Function**: Manages upcoming listings before the High Courts, NCLT, City Civil Courts, and Supreme Court.
- **Features**: Case Title, Forum / Bench, Hearing Date, Purpose of Listing, countdown, and persistent local storage.

---

## 6. Verification & Quick Test Commands

```bash
# 1. Health check
curl http://localhost:8000/health

# 2. Test BNS/IPC Mapper
curl "http://localhost:8000/api/statutes/bns-map?ipc=302"
curl "http://localhost:8000/api/statutes/resolve?cite=IPC+376"

# 3. Test Statute Library
curl "http://localhost:8000/api/statutes/library?act=BNS"

# 4. Test Limitation Calculator
curl "http://localhost:8000/api/tools/limitation/calculate?case_type=specific_performance&trigger_date=2024-01-15"

# 5. Run Multi-Tenancy Isolation Test
python backend/test_isolation.py
```
