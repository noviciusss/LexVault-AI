import json
import logging
from datetime import datetime, timedelta
from sqlmodel import select
from app.core.database import async_session_maker
from app.core.security import get_password_hash
from app.models.firm import Firm
from app.models.user import User
from app.models.knowledge import KnowledgeItem
from app.models.audit import AuditLogEntry
from app.models.pipeline import PipelineJob
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service
from app.services.neo4j_service import neo4j_service

logger = logging.getLogger("lexvault.seed")

# -------------------------------------------------------------
# FIRM 1: Chandra & Rao Associates (Mumbai — Corporate & Civil Litigation)
# -------------------------------------------------------------
CHANDRA_RAO_PUBLISHED_ITEMS = [
    {
        "title": "NCLT Section 9 IBC: Operational Creditor Invalidation via Pre-Existing Dispute Threshold",
        "practice_area": "Corporate Insolvency & IBC",
        "raw_text": "Appearing before NCLT Mumbai Bench for Kalpataru Engineering against steel supplier Metalfab Industries. Operational creditor served Section 8 demand notice claiming ₹4.8 Crores unpaid invoices. We resisted Section 9 admission by producing email exchanges prior to demand notice establishing defective tensile strength in supplied rebar.",
        "sanitized_text": "Appearing before NCLT Mumbai Bench for <ORG> against <ORG>. Operational creditor served Section 8 demand notice claiming ₹<AMOUNT> unpaid invoices. We resisted Section 9 admission by producing email exchanges prior to demand notice establishing defective goods.",
        "abstracted_insight": "INSOLVENCY LITIGATION PLAYBOOK — SECTION 9 IBC DEFENCE:\n1. Under Mobilox Innovations (Supreme Court), an adjudicating authority (NCLT) is strictly forbidden from examining the merits or quantum of a dispute; it must only ascertain whether a plausible contest exists pre-dating the statutory demand notice.\n2. Any contemporaneous complaint regarding quality defects, delivery delays, or debit notes completely paralyzes Section 9 proceedings and forces the creditor into ordinary civil recovery or arbitration.\n3. Verify threshold compliance: minimum default must be ₹1 Crore (post-2020 notification); interest cannot be clubbed to meet the pecuniary threshold unless explicitly agreed in the signed purchase order.",
        "concepts": ["Section 9 IBC", "NCLT Mumbai", "Pre-Existing Dispute", "Mobilox Doctrine", "Operational Debt Threshold"],
        "pii_count": 2,
    },
    {
        "title": "SEBI PFUTP & PIT Regulations: Defense Architecture Against Algorithmic Insider Trading Allegations",
        "practice_area": "SEBI & Securities Law",
        "raw_text": "Defending chief strategy officer Rajiv Singhania of FinTech Capital before SEBI Adjudicating Officer. SEBI issued show-cause alleging trading in scrip during UPSI (Unpublished Price Sensitive Information) window preceding Q3 earnings announcement. Proved trades executed under pre-scheduled Rule 5(1) Trading Plan submitted to stock exchange 6 months prior.",
        "sanitized_text": "Defending corporate insider <PERSON> of <ORG> before SEBI Adjudicating Officer. Regulator issued show-cause alleging trading in scrip during UPSI window. Proved trades executed under pre-scheduled statutory Trading Plan submitted to stock exchange.",
        "abstracted_insight": "SECURITIES DEFENCE PROTOCOL — SEBI PIT REGULATIONS:\n1. Statutory Trading Plans (Regulation 5 PIT 2015) provide an absolute safe harbor against UPSI allegations, provided the plan was approved by the compliance officer and publicly disclosed at least 6 months before trading commenced.\n2. In defending SEBI circular show-cause notices, scrutinize circumstantial digital communication metadata: the regulator must establish an unbroken evidentiary chain showing transmission of price-sensitive numbers, not mere casual social contact.\n3. Pair substantive merits reply with a formal settlement application under SEBI (Settlement Proceedings) Regulations, 2018 to cap monetary exposure without admitting guilt.",
        "concepts": ["SEBI PIT Regulations", "UPSI", "Trading Plan Safe Harbor", "PFUTP", "Securities Settlement"],
        "pii_count": 2,
    },
    {
        "title": "Transfer of Property Act Section 54: Invalidation of GPA / Agreement to Sell as Substantive Title",
        "practice_area": "Transfer of Property & Real Estate",
        "raw_text": "High Court of Bombay, Civil Appellate Jurisdiction. Defending client Mrs. Suniti Deshmukh in title suit filed by prospective buyer claiming ownership based on Notarized Agreement to Sell and General Power of Attorney (GPA) from 2012 without registered conveyance deed.",
        "sanitized_text": "High Court of Bombay, Civil Appellate Jurisdiction. Defending client <PERSON> in title suit filed by prospective buyer claiming ownership based on Notarized Agreement to Sell and General Power of Attorney without registered conveyance deed.",
        "abstracted_insight": "PROPERTY TITLE LITIGATION — SURAJ LAMP DOCTRINE:\n1. Under Section 54 Transfer of Property Act read with Section 17 Registration Act, immovable property exceeding ₹100 value transfers only via a duly stamped, registered Deed of Conveyance (Sale Deed).\n2. General Power of Attorney (GPA) sales or Agreement to Sell paired with possession under Section 53A do not confer marketable title or ownership (Suraj Lamp & Industries v. State of Haryana, Supreme Court).\n3. In defending eviction or title claims, immediately plead Order 7 Rule 11 CPC dismissal where the plaintiff sues for declaration of ownership solely on unregistered SA/GPA/Will documents.",
        "concepts": ["Section 54 TPA", "Suraj Lamp Doctrine", "GPA Sales", "Registration Act", "Title Suit"],
        "pii_count": 2,
    },
    {
        "title": "धारा ६४ बीएनएस / धारा ३७६ भा.दं.वि. — सहमति बनाम कपटपूर्ण वादा (False Promise to Marry Trial Defence)",
        "practice_area": "Criminal Law & BNS/IPC",
        "raw_text": "सत्र न्यायालय ठाणे में श्री निखिल सावंत के विरुद्ध भारतीय न्याय संहिता की धारा ६४ एवं धारा ६९ (विवाह के वादे पर संबंध) के तहत दर्ज प्राथमिकी का विचारण। हमने शिकायतकर्ता के पूर्व वैवाहिक स्थिति को सिद्ध करते हुए सर्वोच्च न्यायालय के अनूराग सोनी एवं सोनू उर्फ सुभाष निर्णय के तहत जिरह की।",
        "sanitized_text": "सत्र न्यायालय में <व्यक्ति> के विरुद्ध भारतीय न्याय संहिता की धारा ६४ एवं धारा ६९ के तहत दर्ज प्राथमिकी का विचारण। हमने शिकायतकर्ता के पूर्व स्थिति को सिद्ध करते हुए सर्वोच्च न्यायालय के निर्णयों के तहत जिरह की।",
        "abstracted_insight": "दांडिक विचारण सूत्र — बीएनएस धारा ६४ व ६९ (Rape vs Consensual Relationship):\n१. प्रत्येक संबंध जो विवाह में परिणित न हो सके बलात्कार या बीएनएस धारा ६९ का अपराध नहीं होता। अभियोजन को सिद्ध करना होगा कि अभियुक्त का विवाह का वादा आरंभ से ही कपटपूर्ण (Misconception of Fact ab initio) था।\n२. यदि दोनों पक्षकार बालिग, सुशिक्षित हैं और लंबे समय तक वैवाहिक रिश्ते के बिना साथ रहे हैं, तो इसे सहमतिजन्य संबंध (Consensual Relationship) माना जाएगा।\n३. सत्र विचारण में व्हाट्सएप चैट, होटल बिल एवं आपसी ईमेल के डिजिटल साक्ष्य को बीएसए धारा ६१ (BSA Section 61 / पूर्ववर्ती 65B) के प्रमाण-पत्र के साथ दाखिल कर पहली तिथि पर ही अभियोजन के मामले में दरार स्थापित करें।",
        "concepts": ["BNS Section 64", "BNS Section 69", "Section 376 IPC", "BSA Section 61", "Consensual Relationship"],
        "pii_count": 1,
    },
    {
        "title": "Specific Relief Act Section 10: Mandatory Specific Performance Post-2018 Amendment Architecture",
        "practice_area": "Commercial Litigation & Civil",
        "raw_text": "Commercial Suit before Bombay High Court representing Godrej Real Estate against landowners who attempted to rescind joint development agreement after receiving ₹15 Crores initial earnest deposit. Defendants claimed damages in lieu of specific performance.",
        "sanitized_text": "Commercial Suit before High Court representing <ORG> against landowners who attempted to rescind joint development agreement after receiving ₹<AMOUNT> initial deposit. Defendants claimed damages in lieu of specific performance.",
        "abstracted_insight": "CIVIL LITIGATION PLAYBOOK — SPECIFIC PERFORMANCE OF CONTRACTS:\n1. Following the Specific Relief (Amendment) Act 2018, courts no longer possess discretionary power to deny specific performance and award damages; specific performance of contracts under Section 10 is now MANDATORY upon proof of readiness and willingness (Section 16(c)).\n2. The only statutory bars remain Section 14 exceptions: (a) contracts where substituted performance was obtained, (b) contracts dependent on personal qualifications, (c) contracts determinable by their nature, and (d) infrastructure projects under Section 20A.\n3. Always seek an interim injunction under Order 39 Rules 1-2 CPC or Section 9 Arbitration Act restraining third-party alienation pending decree.",
        "concepts": ["Section 10 SRA", "Mandatory Specific Performance", "2018 SRA Amendment", "Section 16(c) SRA", "Determinable Contracts"],
        "pii_count": 2,
    },
]

CHANDRA_RAO_PENDING_ITEMS = [
    {
        "title": "Commercial Courts Act Section 12A: Mandatory Pre-Institution Mediation Exemption Bar",
        "practice_area": "Commercial Litigation & Civil",
        "firm_id": 1,
        "raw_text": "Drafting commercial summary suit for client Nirlon Tech against defaulting vendor. Client wanted to skip pre-institution mediation to save time. We advised that under Patil Automation (Supreme Court), Section 12A is mandatory unless urgent interim relief is bona fide contemplated.",
        "sanitized_text": "Drafting commercial summary suit for client <ORG> against defaulting vendor. Client wanted to skip mediation. We advised that under Supreme Court precedent, Section 12A is mandatory unless urgent interim relief is bona fide contemplated.",
        "abstracted_insight": "COMMERCIAL COURTS PROCEDURE — SECTION 12A MANDATORY MEDIATION:\n1. Section 12A of the Commercial Courts Act 2015 is strictly mandatory; plaints filed without undergoing pre-institution mediation must be rejected under Order 7 Rule 11 CPC (Patil Automation v. Rakheja Engineers, 2022).\n2. The sole exception is where the suit contemplates 'urgent interim relief'. The urgency must be genuine and pleaded in a separate interim application, not a manufactured device to bypass the legal mandate.\n3. Standard timeline: Mediation period is 3 months, extendable by 2 months with mutual consent, and this period is excluded from computing limitation under Section 12A(3).",
        "concepts": ["Section 12A Commercial Courts", "Patil Automation Precedent", "Pre-Institution Mediation", "Order 7 Rule 11"],
        "pii_count": 1,
    },
    {
        "title": "Arbitration Act Section 34: Patent Illegality & Re-Appreciation of Evidence Thresholds",
        "practice_area": "Arbitration & ADR",
        "firm_id": 1,
        "raw_text": "Filing Section 34 petition before Commercial Division, Bombay High Court challenging domestic arbitral award in shipping logistics dispute. Arbitrator rewrote unambiguous liquidated damages clause in charterparty agreement.",
        "sanitized_text": "Filing Section 34 petition before Commercial Division, High Court challenging domestic arbitral award in shipping dispute. Arbitrator rewrote unambiguous liquidated damages clause in agreement.",
        "abstracted_insight": "ARBITRAL AWARD CHALLENGE — SECTION 34 STANDARDS:\n1. 'Patent illegality' under Section 34(2A) requires an illegality that goes to the root of the matter; mere erroneous application of law or reappreciation of evidence is strictly impermissible (Ssangyong Engineering & Construction, 2019).\n2. However, where an arbitrator rewrites contract terms or wanders outside the boundaries of the signed commercial agreement, the award is perverse and vulnerable to being set aside under Section 34(2)(b)(ii) for violating fundamental policy of Indian law.\n3. Section 34 does not empower the court to modify or reform the award (NHAI v. M. Hakeem); the court may only set it aside or uphold it.",
        "concepts": ["Section 34 Arbitration", "Patent Illegality", "Ssangyong Precedent", "Modification of Award Bar", "Domestic Arbitration"],
        "pii_count": 1,
    },
]

# -------------------------------------------------------------
# FIRM 2: NyayaVault India Platform (New Delhi — Constitutional, Criminal & Family Law)
# -------------------------------------------------------------
NYAYAVAULT_PUBLISHED_ITEMS = [
    {
        "title": "अनुच्छेद २१ एवं निजता का मौलिक अधिकार — डिजिटल साक्ष्य एवं सर्विलांस चुनौती (Article 21 & Privacy)",
        "practice_area": "Constitutional Law & Fundamental Rights",
        "raw_text": "नई दिल्ली में श्री आलोक कुमार के मामले में परामर्श। पुलिस ने बिना विधिसम्मत वारंट या न्यायिक अनुमति के अभियुक्त के फोन का आईएमईआई क्लोन कर डिजिटल चैट प्राप्त की। हमने के.एस. पुट्टास्वामी (९ जजों की संविधान पीठ) के 'आनुपातिकता परीक्षण' (Proportionality Test) के आधार पर आपत्ति दर्ज की।",
        "sanitized_text": "नई दिल्ली में <व्यक्ति> के मामले में परामर्श। पुलिस ने बिना विधिसम्मत वारंट या न्यायिक अनुमति के अभियुक्त के फोन का आईएमईआई क्लोन कर डिजिटल चैट प्राप्त की। हमने के.एस. पुट्टास्वामी (९ जजों की संविधान पीठ) के 'आनुपातिकता परीक्षण' (Proportionality Test) के आधार पर आपत्ति दर्ज की।",
        "abstracted_insight": "संवैधानिक रणनीति — अनुच्छेद २१ व डिजिटल निजता:\n१. राज्य अथवा जांच एजेंसी द्वारा किसी भी डिजिटल उपकरण या फोन के अनधिकृत अधिग्रहण पर 'पुट्टास्वामी आनुपातिकता परीक्षण' के चार चरणों (वैध उद्देश्य, तर्कसंगत संबंध, न्यूनतम दखल, आनुपातिक संतुलन) को चुनौती में अनिवार्य रूप से उद्धृत करें।\n२. भारतीय साक्ष्य अधिनियम की धारा ६५-ख (६५B) व बीएसए (भारतीय साक्ष्य अधिनियम २०२३) धारा ६१ के प्रमाण-पत्र की तकनीकी सत्यता पर पहली ही सुनवाई में आपत्ति दर्ज करें।\n३. प्रक्रियात्मक उल्लंघन होने पर अनुच्छेद ३२ (सर्वोच्च न्यायालय) या अनुच्छेद २२६ (उच्च न्यायालय) के अंतर्गत रिट याचिका दाखिल कर अवैध साक्ष्य को रिकॉर्ड से हटवाएं।",
        "concepts": ["Article 21", "Right to Privacy", "Puttaswamy Doctrine", "Proportionality Test", "BSA Section 61"],
        "pii_count": 1,
    },
    {
        "title": "Article 14 & Arbitrary State Tender Cancellations (Non-Arbitrariness Precedent)",
        "practice_area": "Constitutional Law & Fundamental Rights",
        "raw_text": "Arbitration with National Highways Authority of India (NHAI) representing Larsen & Toubro infrastructure joint venture. NHAI unilaterally cancelled an awarded EPC contract without reasoned administrative order. Challenged under Article 14 Wednesbury unreasonableness.",
        "sanitized_text": "Arbitration with <ORG> representing <ORG> infrastructure joint venture. Authority unilaterally cancelled an awarded EPC contract without reasoned administrative order. Challenged under Article 14 Wednesbury unreasonableness.",
        "abstracted_insight": "CONSTITUTIONAL WRIT STRATEGY — ARTICLE 14 IN PUBLIC CONTRACTS:\n1. State instrumentalities and PSUs cannot claim private contractual immunity when cancelling public tenders; administrative actions remain subject to Article 14 non-arbitrariness and natural justice.\n2. In challenging arbitrary terminations, plead the Royappa & Shrilekha Vidyarthi precedent: state actions devoid of public interest rationale are void ab initio.\n3. Pair writ petitions under Article 226 with Section 9 interim relief under the Arbitration & Conciliation Act, 1996.",
        "concepts": ["Article 14", "Non-Arbitrariness", "Public Procurement", "Article 226", "Administrative Law"],
        "pii_count": 2,
    },
    {
        "title": "धारा ४९८-क भा.दं.वि. / धारा ८५ बीएनएस — अरणेश कुमार दिशा-निर्देश एवं अग्रिम जमानत कार्ययोजना",
        "practice_area": "Criminal Law & BNS/IPC",
        "raw_text": "रोहिणी कोर्ट, दिल्ली में श्री सचिन गुप्ता एवं उनके वृद्ध माता-पिता के विरुद्ध धारा ४९८-क (बीएनएस धारा ८५) एवं दहेज प्रतिषेध अधिनियम के अंतर्गत प्राथमिकी दर्ज। पुलिस ने धारा ४१-क सीआरपीसी (बीएनएसएस धारा ३५) का नोटिस दिए बिना सीधे गिरफ्तारी की धमकी दी।",
        "sanitized_text": "रोहिणी कोर्ट, दिल्ली में <व्यक्ति> एवं उनके वृद्ध माता-पिता के विरुद्ध प्राथमिकी दर्ज। पुलिस ने धारा ४१-क सीआरपीसी (बीएनएसएस धारा ३५) का नोटिस दिए बिना सीधे गिरफ्तारी की धमकी दी।",
        "abstracted_insight": "आपराधिक रक्षा सूत्र — धारा ४९८-क / बीएनएस धारा ८५ एवं अरणेश कुमार सुरक्षा:\n१. वैवाहिक विवादों में ७ वर्ष से कम कारावास वाले अपराधों में पुलिस के लिए सीआरपीसी की धारा ४१-क (अब धारा ३५ बीएनएसएस २०२३) का नोटिस जारी करना विधिक रूप से अनिवार्य है।\n२. पुलिस द्वारा नोटिस का अनुपालन न करने पर संबंधित जांच अधिकारी (IO) के विरुद्ध उच्च न्यायालय में अवमानना (Contempt) की अर्जी दाखिल करने की चेतावनी दें।\n३. दूर रहने वाले ससुराल पक्ष के रिश्तेदारों के नाम केवल सामान्य आरोपों (Omnibus Allegations) पर हटाने हेतु धारा ४८२ सीआरपीसी / धारा ५२८ बीएनएसएस (क्वैशिंग याचिका) तुरंत दाखिल करें।",
        "concepts": ["Section 498A IPC", "BNS Section 85", "Arnesh Kumar Guidelines", "BNSS Section 35", "Quashing FIR"],
        "pii_count": 1,
    },
    {
        "title": "Order 39 Rules 1 & 2 CPC: Interim Injunction Tripartite Test in Trademark Infringement",
        "practice_area": "Civil Procedure (CPC)",
        "raw_text": "Appearing before Delhi High Court for Cipla Pharmaceuticals against Sun Health formulations. Defendant launched deceptive trade dress copying our client's registered trademark. Moving for ex-parte ad-interim injunction under Order XXXIX Rules 1 & 2 read with Section 151 CPC.",
        "sanitized_text": "Appearing before Delhi High Court for <ORG> against <ORG>. Defendant launched deceptive trade dress copying our client's registered trademark. Moving for ex-parte ad-interim injunction under Order XXXIX Rules 1 & 2 read with Section 151 CPC.",
        "abstracted_insight": "CIVIL LITIGATION PLAYBOOK — ORDER 39 CPC INTERIM INJUNCTIONS:\n1. Plead and establish all three legs of the tripartite injunction test simultaneously: (a) Prima facie case of distinctiveness/prior user, (b) Irreparable loss beyond monetary damages, and (c) Balance of convenience favouring status quo.\n2. In ex-parte injunction applications, explicitly comply with Order XXXIX Rule 3 proviso by tendering affidavit confirming delivery of process within 24 hours to preserve the injunction order.\n3. Offer an immediate local commissioner appointment under Order 26 Rule 9 CPC for spot inspection and inventory seizure.",
        "concepts": ["Order 39 CPC", "Interim Injunction", "Balance of Convenience", "Prima Facie Case", "Local Commissioner"],
        "pii_count": 2,
    },
    {
        "title": "धारा २७ भारतीय अनुबंध अधिनियम, १८७२ — रोजगार अनुबंधों में गैर-प्रतिस्पर्धा (Non-Compete) शून्यता",
        "practice_area": "Indian Contract Act & Commercial",
        "raw_text": "मेसर्स टेक महिंद्रा लीगल सेल से विधिक परामर्श। कंपनी ने सॉफ्टवेयर इंजीनियर राहुल मेहता के रोजगार पत्र में २ वर्ष का नॉन-कम्पीट खंड जोड़ा था। कर्मचारी ने प्रतिस्पर्धी कंपनी ज्वाइन की। हमने क्लाइंट को समझाया कि भारत में रोजगार समाप्ति उपरांत व्यापार प्रतिबंध धारा २७ के अंतर्गत पूर्णतः शून्य (Void) होता है।",
        "sanitized_text": "मेसर्स <संस्था> लीगल सेल से विधिक परामर्श। कंपनी ने सॉफ्टवेयर इंजीनियर <व्यक्ति> के रोजगार पत्र में २ वर्ष का नॉन-कम्पीट खंड जोड़ा था। कर्मचारी ने प्रतिस्पर्धी कंपनी ज्वाइन की। हमने क्लाइंट को समझाया कि भारत में रोजगार समाप्ति उपरांत व्यापार प्रतिबंध धारा २७ के अंतर्गत पूर्णतः शून्य (Void) होता है।",
        "abstracted_insight": "व्यापारिक संविदा सिद्धांत — धारा २७ भारतीय अनुबंध अधिनियम:\n१. भारतीय विधि (निर्गंजन शंकर गोलिकरी बनाम सेंचुरी स्पिनिंग केस) के अनुसार रोजगार अवधि के दौरान नॉन-कम्पीट मान्य है, परंतु रोजगार समाप्ति के उपरांत लगाया गया कोई भी व्यापार प्रतिबंध शून्य (Void ab initio) होता है।\n२. नियोक्ता को केवल व्यापारिक गोपनीयता (Trade Secrets) व अनाधिकृत ग्राहक संपर्क (Non-Solicitation) के उल्लंघन पर अंतरिम रोक की राहत मिल सकती है, सामान्य आजीविका के अधिकार पर नहीं।\n३. संविदा में व्यापक प्रतिबंध के स्थान पर 'सद्भावना (Goodwill) क्रय' अपवाद अथवा विशिष्ट गोपनीय डेटा चोरी पर लिक्विडेटेड डैमेज खंड तैयार करें।",
        "concepts": ["Section 27 Contract Act", "Restraint of Trade", "Non-Compete Clause", "Trade Secrets Protection", "Liquidated Damages"],
        "pii_count": 2,
    },
    {
        "title": "Article 32 & 226 Writs: Habeas Corpus and Quo Warranto Procedural Playbook",
        "practice_area": "Constitutional Law & Fundamental Rights",
        "raw_text": "Filing Habeas Corpus petition before Allahabad High Court for detainee Vikram Yadav held in preventive detention under National Security Act (NSA) without grounds communicated within statutory 5 days. Invoking Article 22(5) and Article 226.",
        "sanitized_text": "Filing Habeas Corpus petition before High Court for detainee <PERSON> held in preventive detention under National Security Act without grounds communicated within statutory 5 days. Invoking Article 22(5) and Article 226.",
        "abstracted_insight": "CONSTITUTIONAL WRIT LITIGATION — HABEAS CORPUS PRACTICE:\n1. In preventive detention challenges under Article 226, scrutinize the subjective satisfaction of the District Magistrate: any uncommunicated ground or delay in considering the detainee's representation invalidates the entire detention.\n2. Article 22(5) mandates communication of grounds in a language the detainee understands; non-furnishing of translated copies is fatal to the state's defense.\n3. Maintain that writ of Habeas Corpus bypasses ordinary alternative remedy doctrines because personal liberty under Article 21 cannot be delayed.",
        "concepts": ["Habeas Corpus", "Article 226", "Article 32", "Preventive Detention", "Article 22(5)"],
        "pii_count": 1,
    },
    {
        "title": "Hindu Marriage Act Section 13B: Mutual Consent Divorce Six-Month Cooling Period Waiver",
        "practice_area": "Family Law & Personal Law",
        "raw_text": "Representing Rohit Verma and Sunita Sharma in family court Saket, New Delhi. Parties living separately for 3 years with all stridhan settled. Moving joint application under Section 13B(2) HMA requesting waiver of statutory 6-month statutory waiting period pursuant to Amardeep Singh v. Harveen Kaur.",
        "sanitized_text": "Representing <PERSON> and <PERSON> in family court. Parties living separately for 3 years with all stridhan settled. Moving joint application under Section 13B(2) HMA requesting waiver of statutory 6-month statutory waiting period pursuant to Supreme Court precedent.",
        "abstracted_insight": "FAMILY LAW PRECEDENT — HMA SECTION 13B COOLING PERIOD WAIVER:\n1. The 6-month cooling period under Section 13B(2) of the Hindu Marriage Act is directory and not mandatory (Amardeep Singh v. Harveen Kaur, 2017).\n2. Waiver requires meeting four criteria: (a) 18 months separate living before motion, (b) All mediation attempts exhausted, (c) Full settlement of alimony, maintenance, and child custody, and (d) Waiting period will only prolong agony.\n3. Supreme Court can also grant instant divorce on grounds of 'irretrievable breakdown of marriage' invoking Article 142 complete justice powers (Shilpa Sailesh, 2023).",
        "concepts": ["Section 13B HMA", "Mutual Consent Divorce", "Cooling Period Waiver", "Article 142", "Stridhan Settlement"],
        "pii_count": 2,
    },
    {
        "title": "धारा ३१८ बीएनएस / धारा ४२० भा.दं.वि. — दीवानी विवादों का आपराधिक रूप में दुरुपयोग रोकने की रणनीति",
        "practice_area": "Criminal Law & BNS/IPC",
        "raw_text": "पटियाला हाउस कोर्ट, नई दिल्ली में रियल एस्टेट डेवलपर्स आनंद बिल्डटेक व श्री राकेश बंसल के विरुद्ध चेक बाउंस व फ्लैट पजेशन में देरी के लिए धारा ४२० (अब बीएनएस धारा ३१८) में एफआईआर दर्ज कराई गई। हमने सर्वोच्च न्यायालय के वी.वाई. जोस निर्णय के तहत याचिका दाखिल की।",
        "sanitized_text": "पटियाला हाउस कोर्ट, नई दिल्ली में रियल एस्टेट डेवलपर्स <संस्था> व <व्यक्ति> के विरुद्ध एफआईआर दर्ज कराई गई। हमने सर्वोच्च न्यायालय के निर्णय के तहत याचिका दाखिल की।",
        "abstracted_insight": "आपराधिक कानून रणनीति — संविदा उल्लंघन बनाम धोखाधड़ी (Section 318 BNS / 420 IPC):\n१. प्रत्येक संविदा उल्लंघन धोखाधड़ी नहीं होता। धारा ३१८ बीएनएस / ४२० भा.दं.वि. के अंतर्गत अपराध सिद्ध करने हेतु संविदा के आरंभ से ही बेईमानी का इरादा (Fraudulent Intention ab initio) सिद्ध करना अनिवार्य है।\n२. वाणिज्यिक लेनदेन में केवल चेक बाउंस या भुगतान में विलंब होने पर दर्ज एफआईआर को उच्च न्यायालय में धारा ५२८ बीएनएसएस (पूर्ववर्ती ४८२ सीआरपीसी) के तहत निरस्त (Quash) कराया जा सकता है।\n३. अमानत में खयानत (BNS 316 / IPC 406) और धोखाधड़ी (BNS 318 / IPC 420) के तत्व परस्पर विरोधी हैं — एक ही लेन-देन में दोनों का एक साथ लागू होना विधिक दृष्टि से असंगत है।",
        "concepts": ["Section 318 BNS", "Section 420 IPC", "BNSS Section 528", "Cheating vs Breach of Contract", "Quashing FIR"],
        "pii_count": 2,
    },
    {
        "title": "Section 56 Indian Contract Act: Doctrine of Frustration and Commercial Impossibility",
        "practice_area": "Indian Contract Act & Commercial",
        "raw_text": "Representing Delhi Metro supply contractor regarding force majeure claim during supply-chain disruptions. Government entity invoked performance bank guarantee. We resisted based on Section 56 frustration doctrine and Satyabrata Ghose precedent.",
        "sanitized_text": "Representing metro supply contractor regarding force majeure claim during supply-chain disruptions. Government entity invoked performance bank guarantee. We resisted based on Section 56 frustration doctrine and landmark precedent.",
        "abstracted_insight": "CONTRACTUAL DOCTRINE — SECTION 56 FRUSTRATION & FORCE MAJEURE:\n1. Commercial hardship, price escalation, or mere onerousness does not amount to frustration under Section 56 (Energy Watchdog v. CERC, 2017).\n2. Frustration applies only when the very foundation of the contract is fundamentally destroyed, rendering performance physically or legally impossible.\n3. Ensure express Force Majeure clauses enumerate supply-chain embargoes, pandemic closures, and statutory import bans; in the presence of an express FM clause, Section 56 does not apply as the contract governs.",
        "concepts": ["Section 56 Contract Act", "Doctrine of Frustration", "Force Majeure", "Bank Guarantee Injunction", "Energy Watchdog Doctrine"],
        "pii_count": 0,
    },
    {
        "title": "Section 9 vs Section 17 Arbitration Act: Interim Relief Post-2015 Amendment Architecture",
        "practice_area": "Civil Procedure (CPC)",
        "raw_text": "Appearing before Commercial Division, Delhi High Court for infrastructure consortium seeking stay on invocation of unconditional bank guarantees. Court debated whether Section 9 petition is maintainable once arbitrator is appointed.",
        "sanitized_text": "Appearing before Commercial Division, High Court for infrastructure consortium seeking stay on invocation of unconditional bank guarantees. Court debated whether Section 9 petition is maintainable once arbitrator is appointed.",
        "abstracted_insight": "ARBITRATION STRATEGY — INTERIM RELIEF IN INDIAN COURTS:\n1. Post-2015 amendments, once an Arbitral Tribunal is constituted, courts will not entertain Section 9 petitions unless applicant demonstrates remedy under Section 17 before the tribunal is inefficacious.\n2. To successfully restrain invocation of an unconditional Bank Guarantee, plead and demonstrate: (a) Egregious fraud of a fraudulent nature going to the foundation of the guarantee, or (b) Special equities resulting in irretrievable injustice.\n3. Secure expedited Section 17 interim award which is directly enforceable as a civil court decree under Section 17(2).",
        "concepts": ["Section 9 Arbitration Act", "Section 17 Interim Relief", "Bank Guarantee Injunction", "Arbitral Tribunal", "Commercial Courts Act"],
        "pii_count": 2,
    },
]

NYAYAVAULT_PENDING_ITEMS = [
    {
        "title": "अनुच्छेद ३२ रिट याचिका — विचाराधीन कैदियों की जमानत एवं त्वरित न्याय (Under-Trial Prisoners Bail)",
        "practice_area": "Constitutional Law & Fundamental Rights",
        "firm_id": 2,
        "raw_text": "तिहाड़ जेल में बंद विचाराधीन कैदी रमेश कुमार की ओर से सुप्रीम कोर्ट में याचिका। अभियुक्त पिछले ४ वर्षों से चोरी व हेराफेरी के आरोप में बंद है, जबकि अधिकतम सजा ३ वर्ष थी। हमने हुस्नआरा खातून एवं धारा ४३६-क सीआरपीसी (धारा ४७९ बीएनएसएस) के तहत तत्काल रिहाई मांगी।",
        "sanitized_text": "तिहाड़ जेल में बंद विचाराधीन कैदी <व्यक्ति> की ओर से सुप्रीम कोर्ट में याचिका। अभियुक्त पिछले ४ वर्षों से आरोप में बंद है, जबकि अधिकतम सजा ३ वर्ष थी। हमने हुस्नआरा खातून एवं धारा ४७९ बीएनएसएस के तहत तत्काल रिहाई मांगी।",
        "abstracted_insight": "संवैधानिक न्याय सूत्र — विचाराधीन बंदी अधिकार एवं धारा ४७९ बीएनएसएस:\n१. यदि विचाराधीन बंदी ने कथित अपराध की अधिकतम सजा की आधी अवधि हिरासत में पूरी कर ली है (अथवा प्रथम बार अपराध में एक-तिहाई), तो वह धारा ४७९ बीएनएसएस (पूर्ववर्ती धारा ४३६-क) के अंतर्गत जमानत पर रिहाई का वैधानिक हकदार है।\n२. त्वरित विचारण (Speedy Trial) अनुच्छेद २१ के अंतर्गत प्रदत्त मौलिक अधिकार है — अनावश्यक न्यायिक देरी होने पर जमानत अस्वीकार नहीं की जा सकती।",
        "concepts": ["Article 32", "Under-Trial Rights", "BNSS Section 479", "Hussainara Khatoon", "Speedy Trial"],
        "pii_count": 1,
    },
    {
        "title": "CPC Order 7 Rule 11: Rejection of Plaint for Want of Cause of Action in Property Disputes",
        "practice_area": "Civil Procedure (CPC)",
        "firm_id": 2,
        "raw_text": "Drafting Order VII Rule 11 application for client Suresh Goel in Tis Hazari Court. Plaintiff filed partition suit after 22 years without challenging registered gift deed of 2002. Pleading bar of limitation under Article 58 Limitation Act.",
        "sanitized_text": "Drafting Order VII Rule 11 application for client <PERSON> in Tis Hazari Court. Plaintiff filed partition suit after 22 years without challenging registered gift deed. Pleading bar of limitation under Article 58 Limitation Act.",
        "abstracted_insight": "CIVIL LITIGATION DEFENSE — ORDER 7 RULE 11 CPC:\n1. On an Order 7 Rule 11 application, court looks strictly at the plaint averments and accompanying documents, ignoring defendant's written statement.\n2. When clever drafting attempts to create an illusory cause of action in a time-barred claim, court must nip the litigation in the bud (Dahiben v. Arvindbhai Kalyanji Bhanusali, 2020).\n3. Demand dismissal under clause (d) when claim is manifestly barred by Limitation Act 1963.",
        "concepts": ["Order 7 Rule 11 CPC", "Rejection of Plaint", "Limitation Act", "Illusory Cause of Action"],
        "pii_count": 1,
    },
    {
        "title": "घरेलू हिंसा से महिलाओं का संरक्षण अधिनियम, २००५ (DV Act) — निवास अधिकार एवं अंतरिम भरण-पोषण",
        "practice_area": "Family Law & Personal Law",
        "firm_id": 2,
        "raw_text": "साकेत कोर्ट में श्रीमती वंदना भटनागर बनाम मोहित भटनागर डीवी एक्ट धारा १२ आवेदन। पति ने सास-ससुर के स्वामित्व वाले मकान से पत्नी को बेदखल करने की धमकी दी। हमने सतीश चंदर आहूजा (सुप्रीम कोर्ट ३ जज बेंच) के फैसले के अनुसार 'साझा घर' (Shared Household) में निवास अधिकार का दावा किया।",
        "sanitized_text": "साकेत कोर्ट में <व्यक्ति> बनाम <व्यक्ति> डीवी एक्ट धारा १२ आवेदन। पति ने ससुराल के स्वामित्व वाले मकान से पत्नी को बेदखल करने की धमकी दी। हमने सर्वोच्च न्यायालय के निर्णय के अनुसार 'साझा घर' (Shared Household) में निवास अधिकार का दावा किया।",
        "abstracted_insight": "पारिवारिक न्याय रणनीति — डीवी एक्ट में साझा घर (Shared Household) अधिकार:\n१. सतीश चंदर आहूजा (२०२०) निर्णय के अनुसार, साझा घर केवल पति का स्व-अर्जित होना आवश्यक नहीं है; यदि पीड़िता वैवाहिक संबंध में वहां रही है, तो सास-ससुर के मकान में भी धारा १७ के तहत निवास अधिकार सुरक्षित रहता है।\n२. धारा १२ आवेदन के साथ धारा २३ के तहत शपथ-पत्र दाखिल कर पहली ही तारीख पर अंतरिम भरण-पोषण (Interim Maintenance) व निवास आदेश (Residence Order) प्राप्त करें।",
        "concepts": ["Domestic Violence Act", "Section 12 DV Act", "Shared Household", "Interim Maintenance", "Satish Chander Ahuja"],
        "pii_count": 2,
    },
]


async def auto_seed_if_empty(force: bool = False):
    """
    Seed database with:
    - 2 Indian Firms (Firm 1: Chandra & Rao Associates [Mumbai] | Firm 2: NyayaVault India Platform [Delhi])
    - 6 Users (3 Chandra & Rao + 3 NyayaVault lawyers/partners)
    - 15 Published Items (5 Chandra & Rao + 10 NyayaVault — strictly segregated by firm_id)
    - 5 Pending Approval Items (2 Chandra & Rao + 3 NyayaVault)
    - Strict Multi-Tenant Vector & Graph Indexing (No cross-firm leaks!)
    """
    async with async_session_maker() as session:
        if not force:
            res = await session.execute(select(User).limit(1))
            existing_user = res.first()
            if existing_user:
                logger.info("Database already seeded with demo records.")
                return

        logger.info("Seeding database with purely Indian multi-firm demo data...")

        # 1. Firms
        firm1 = Firm(id=1, name="Chandra & Rao Associates (Mumbai)")
        firm2 = Firm(id=2, name="NyayaVault India Platform (New Delhi)")
        session.add(firm1)
        session.add(firm2)
        await session.flush()

        # 2. Users
        pwd_hash = get_password_hash("password123")
        users = [
            # Firm 1: Chandra & Rao Associates (Mumbai)
            User(id=1, name="Adv. Rohit Kulkarni", email="rohit@chandrarao.law", hashed_password=pwd_hash, role="lawyer", firm_id=1),
            User(id=2, name="Adv. Meera Rao (Senior Partner)", email="meera.rao@chandrarao.law", hashed_password=pwd_hash, role="admin", firm_id=1),
            User(id=3, name="Adv. Karan Mehta", email="karan@chandrarao.law", hashed_password=pwd_hash, role="lawyer", firm_id=1),
            # Firm 2: NyayaVault India Platform (New Delhi)
            User(id=4, name="Adv. Arjun Sharma", email="arjun@nyayavault.in", hashed_password=pwd_hash, role="lawyer", firm_id=2),
            User(id=5, name="Adv. Priya Narayanan (Managing Partner)", email="priya@nyayavault.in", hashed_password=pwd_hash, role="admin", firm_id=2),
            User(id=6, name="Adv. Vikram Malhotra", email="vikram@nyayavault.in", hashed_password=pwd_hash, role="lawyer", firm_id=2),
        ]
        session.add_all(users)
        await session.flush()

        # 3. Helper to seed published items
        async def seed_published_batch(items_data, start_id: int, firm_id: int, author_id: int, approver_id: int, approver_name: str):
            for idx, item_data in enumerate(items_data, start=start_id):
                k_item = KnowledgeItem(
                    id=idx,
                    title=item_data["title"],
                    author_id=author_id,
                    firm_id=firm_id,
                    practice_area=item_data["practice_area"],
                    status="published",
                    raw_input_type="text",
                    raw_text=item_data["raw_text"],
                    cleaned_text=item_data["raw_text"],
                    sanitized_text=item_data["sanitized_text"],
                    abstracted_insight=item_data["abstracted_insight"],
                    pii_entities_found=json.dumps([{"entity_type": "CLIENT_IDENTIFIER", "count": item_data["pii_count"]}]),
                    current_stage=6,
                    approved_by=approver_id,
                    approved_at=datetime.utcnow() - timedelta(days=idx - start_id + 1),
                    created_at=datetime.utcnow() - timedelta(days=idx - start_id + 2),
                )
                session.add(k_item)
                await session.flush()

                # Pipeline job
                job = PipelineJob(
                    knowledge_item_id=k_item.id,
                    stage=6,
                    stage_name="Vector DB & Knowledge Graph",
                    status="done",
                    output_preview=f"Published to firm knowledge base and graph. Concepts: {', '.join(item_data['concepts'])}",
                    finished_at=datetime.utcnow(),
                )
                session.add(job)

                # Audit log
                audit = AuditLogEntry(
                    firm_id=firm_id,
                    actor_id=approver_id,
                    actor_name=approver_name,
                    action="KNOWLEDGE_PUBLISHED",
                    target_type="KnowledgeItem",
                    target_id=k_item.id,
                    details=f"Partner approved and published insight '{k_item.title}' firm-wide.",
                )
                session.add(audit)

                # Vector Indexing — STRICTLY ISOLATED TO firm_id
                try:
                    vec = embedding_service.embed_text(item_data["abstracted_insight"])
                    vector_id = qdrant_service.upsert(
                        item_id=k_item.id,
                        vector=vec,
                        payload={
                            "item_id": k_item.id,
                            "title": k_item.title,
                            "firm_id": firm_id,
                            "practice_area": k_item.practice_area,
                            "abstracted_insight": k_item.abstracted_insight,
                        },
                    )
                    k_item.vector_id = vector_id
                except Exception as ve:
                    logger.warning(f"Vector upsert failed for item #{k_item.id}: {ve}")

                # Neo4j Graph Ingestion
                try:
                    graph_id = neo4j_service.ingest_knowledge_item(
                        item_id=k_item.id,
                        title=k_item.title,
                        practice_area=k_item.practice_area,
                        author_name=approver_name,
                        concepts=item_data["concepts"],
                    )
                    k_item.graph_node_id = graph_id
                except Exception as ge:
                    logger.warning(f"Graph ingest failed for item #{k_item.id}: {ge}")

                session.add(k_item)

        # Seed Firm 1: Chandra & Rao Associates (Items 101-105)
        await seed_published_batch(
            CHANDRA_RAO_PUBLISHED_ITEMS,
            start_id=101,
            firm_id=1,
            author_id=1,
            approver_id=2,
            approver_name="Adv. Meera Rao"
        )

        # Seed Firm 2: NyayaVault India Platform (Items 201-210)
        await seed_published_batch(
            NYAYAVAULT_PUBLISHED_ITEMS,
            start_id=201,
            firm_id=2,
            author_id=4,
            approver_id=5,
            approver_name="Adv. Priya Narayanan"
        )

        # 4. Helper to seed pending items
        all_pending = CHANDRA_RAO_PENDING_ITEMS + NYAYAVAULT_PENDING_ITEMS
        for idx, pend_data in enumerate(all_pending, start=301):
            f_id = pend_data["firm_id"]
            author_id = 1 if f_id == 1 else 4
            author_name = "Adv. Rohit Kulkarni" if f_id == 1 else "Adv. Arjun Sharma"
            
            p_item = KnowledgeItem(
                id=idx,
                title=pend_data["title"],
                author_id=author_id,
                firm_id=f_id,
                practice_area=pend_data["practice_area"],
                status="pending_approval",
                raw_input_type="text",
                raw_text=pend_data["raw_text"],
                cleaned_text=pend_data["raw_text"],
                sanitized_text=pend_data["sanitized_text"],
                abstracted_insight=pend_data["abstracted_insight"],
                pii_entities_found=json.dumps([{"entity_type": "CLIENT_IDENTIFIER", "count": pend_data["pii_count"]}]),
                current_stage=5,
                created_at=datetime.utcnow() - timedelta(hours=idx - 300),
            )
            session.add(p_item)
            await session.flush()

            job = PipelineJob(
                knowledge_item_id=p_item.id,
                stage=5,
                stage_name="Lawyer Approval Gate",
                status="waiting_approval",
                output_preview="Awaiting review in Senior Partner Approvals Queue.",
            )
            session.add(job)

            audit = AuditLogEntry(
                firm_id=f_id,
                actor_id=author_id,
                actor_name=author_name,
                action="STRATEGY_ABSTRACTED",
                target_type="KnowledgeItem",
                target_id=p_item.id,
                details="Submitted insight for Senior Partner review.",
            )
            session.add(audit)

        await session.commit()
        logger.info("Successfully seeded India-Only multi-firm data: Firm 1 (Chandra & Rao), Firm 2 (NyayaVault).")
