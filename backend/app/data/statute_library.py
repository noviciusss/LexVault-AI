"""
Statute Library Dataset for Indian Laws
Covers key codified sections of:
- BNS (Bharatiya Nyaya Sanhita, 2023)
- BNSS (Bharatiya Nagarik Suraksha Sanhita, 2023)
- BSA (Bharatiya Sakshya Adhiniyam, 2023)
- Indian Contract Act, 1872
- Code of Civil Procedure (CPC), 1908
- Specific Relief Act, 1963
- Transfer of Property Act, 1882
- Insolvency and Bankruptcy Code (IBC), 2016
- Limitation Act, 1963
- Arbitration and Conciliation Act, 1996
"""

from typing import List, Dict, Any

STATUTE_ACTS = [
    {"code": "BNS", "name_en": "Bharatiya Nyaya Sanhita, 2023", "name_hi": "भारतीय न्याय संहिता, २०२३", "category": "Criminal Law"},
    {"code": "BNSS", "name_en": "Bharatiya Nagarik Suraksha Sanhita, 2023", "name_hi": "भारतीय नागरिक सुरक्षा संहिता, २०२३", "category": "Criminal Procedure"},
    {"code": "BSA", "name_en": "Bharatiya Sakshya Adhiniyam, 2023", "name_hi": "भारतीय साक्ष्य अधिनियम, २०२३", "category": "Evidence"},
    {"code": "CONTRACT", "name_en": "Indian Contract Act, 1872", "name_hi": "भारतीय अनुबंध अधिनियम, १८७२", "category": "Commercial & Civil"},
    {"code": "CPC", "name_en": "Code of Civil Procedure, 1908", "name_hi": "सिविल प्रक्रिया संहिता, १९०८", "category": "Civil Procedure"},
    {"code": "SRA", "name_en": "Specific Relief Act, 1963", "name_hi": "विनिर्दिष्ट अनुतोष अधिनियम, १९६३", "category": "Commercial & Civil"},
    {"code": "TPA", "name_en": "Transfer of Property Act, 1882", "name_hi": "संपत्ति अंतरण अधिनियम, १८८२", "category": "Property Law"},
    {"code": "IBC", "name_en": "Insolvency and Bankruptcy Code, 2016", "name_hi": "दिवाला एवं शोधन अक्षमता संहिता, २०१६", "category": "Insolvency & Corporate"},
    {"code": "LIMITATION", "name_en": "Limitation Act, 1963", "name_hi": "परिसीमा अधिनियम, १९६३", "category": "Civil & Procedural"},
    {"code": "ARBITRATION", "name_en": "Arbitration and Conciliation Act, 1996", "name_hi": "माध्यस्थम एवं सुलह अधिनियम, १९९६", "category": "Alternative Dispute Resolution"}
]

STATUTE_LIBRARY_SECTIONS: List[Dict[str, Any]] = [
    # BNS
    {
        "act_code": "BNS",
        "act_name": "Bharatiya Nyaya Sanhita, 2023",
        "section": "103",
        "title_en": "Section 103: Punishment for Murder",
        "title_hi": "धारा १०३: हत्या के लिए दंड",
        "text_en": "(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.\n(2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other similar ground, each member of such group shall be punished with death or with imprisonment for life, and shall also be liable to fine.",
        "text_hi": "(१) जो कोई हत्या करेगा वह मृत्युदंड या आजीवन कारावास से दंडित किया जाएगा और जुर्माने का भी भागी होगा।\n(२) जब पांच या अधिक व्यक्तियों का समूह मिलकर नस्ल, जाति, समुदाय, लिंग, जन्म स्थान या भाषा के आधार पर हत्या करता है, तो समूह का प्रत्येक सदस्य मृत्यु या आजीवन कारावास से दंडित होगा।",
        "tags": ["murder", "mob lynching", "death penalty", "bns 103", "ipc 302"],
        "landmark_cases": "Bachan Singh v. State of Punjab (Rarest of Rare Doctrine)"
    },
    {
        "act_code": "BNS",
        "act_name": "Bharatiya Nyaya Sanhita, 2023",
        "section": "64",
        "title_en": "Section 64: Punishment for Rape",
        "title_hi": "धारा ६४: बलात्कार के लिए दंड",
        "text_en": "(1) Whoever commits rape shall be punished with rigorous imprisonment of either description for a term which shall not be less than ten years, but which may extend to imprisonment for life, and shall also be liable to fine.",
        "text_hi": "(१) जो कोई बलात्कार करेगा, वह कठोर कारावास से दंडित किया जाएगा जो दस वर्ष से कम का नहीं होगा और आजीवन कारावास तक हो सकेगा तथा जुर्माने से भी दंडनीय होगा।",
        "tags": ["rape", "sexual assault", "bns 64", "ipc 376"],
        "landmark_cases": "State of Punjab v. Gurmit Singh (1996)"
    },
    {
        "act_code": "BNS",
        "act_name": "Bharatiya Nyaya Sanhita, 2023",
        "section": "85",
        "title_en": "Section 85: Cruelty to a Married Woman",
        "title_hi": "धारा ८५: विवाहिता के प्रति क्रूरता",
        "text_en": "Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.",
        "text_hi": "जो कोई किसी स्त्री का पति या पति का नातेदार होते हुए उस स्त्री के प्रति क्रूरता करेगा, वह तीन वर्ष तक के कारावास और जुर्माने से दंडनीय होगा।",
        "tags": ["matrimonial cruelty", "dowry harassment", "bns 85", "ipc 498a"],
        "landmark_cases": "Arnesh Kumar v. State of Bihar (2014)"
    },
    {
        "act_code": "BNS",
        "act_name": "Bharatiya Nyaya Sanhita, 2023",
        "section": "318",
        "title_en": "Section 318: Cheating and Dishonestly Inducing Delivery of Property",
        "title_hi": "धारा ३१८: धोखाधड़ी एवं बेईमानी से संपत्ति का परिदान",
        "text_en": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
        "text_hi": "जो कोई धोखाधड़ी करता है और छलपूर्वक किसी व्यक्ति को संपत्ति परिदत्त करने के लिए उत्प्रेरित करता है, वह सात वर्ष तक के कारावास और जुर्माने से दंडित होगा।",
        "tags": ["cheating", "fraud", "bns 318", "ipc 420"],
        "landmark_cases": "V.Y. Jose v. State of Gujarat (2009)"
    },

    # BNSS
    {
        "act_code": "BNSS",
        "act_name": "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "section": "35",
        "title_en": "Section 35: Notice of Appearance Before Police Officer",
        "title_hi": "धारा ३५: पुलिस अधिकारी के समक्ष उपस्थिति का नोटिस",
        "text_en": "(1) The police officer shall, in all cases where the arrest of a person is not required under sub-section (1) of section 35, issue a notice directing the person against whom a reasonable complaint has been made to appear before him or at such other place as specified.\n(2) No arrest shall be made without prior permission of an officer not below the rank of Deputy Superintendent of Police where offence is punishable with less than 3 years or accused is infirm/elderly.",
        "text_hi": "(१) जिन मामलों में अभियुक्त की गिरफ्तारी आवश्यक नहीं है, पुलिस अधिकारी उसे उपस्थित होने हेतु लिखित नोटिस जारी करेगा।\n(२) तीन वर्ष से कम सजा वाले अपराधों अथवा वृद्ध/अशक्त व्यक्तियों के मामले में डीएसपी स्तर के अधिकारी की पूर्व अनुमति के बिना गिरफ्तारी नहीं होगी।",
        "tags": ["notice of appearance", "bnss 35", "crpc 41a", "arrest protection"],
        "landmark_cases": "Arnesh Kumar Guidelines Codified in BNSS"
    },
    {
        "act_code": "BNSS",
        "act_name": "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "section": "173",
        "title_en": "Section 173: Information in Cognizable Cases (FIR & e-FIR)",
        "title_hi": "धारा १७३: संज्ञेय मामलों में प्राथमिकी एवं ई-एफआईआर",
        "text_en": "(1) Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing.\nProvided that information given by electronic communication shall be taken on record and signed by the complainant within three days before registration of FIR.",
        "text_hi": "(१) संज्ञेय अपराध की सूचना दर्ज करना। इलेक्ट्रॉनिक माध्यम (e-FIR) से दी गई सूचना को अभिलेख पर लिया जाएगा और तीन दिन के भीतर शिकायतकर्ता के हस्ताक्षर उपरांत औपचारिक प्राथमिकी दर्ज होगी।",
        "tags": ["fir", "e-fir", "zero fir", "bnss 173", "crpc 154"],
        "landmark_cases": "Lalita Kumari v. Govt. of UP (Mandatory FIR)"
    },
    {
        "act_code": "BNSS",
        "act_name": "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "section": "528",
        "title_en": "Section 528: Saving of Inherent Powers of High Court",
        "title_hi": "धारा ५२८: उच्च न्यायालय की अंतर्निहित शक्तियों का संरक्षण (क्वैशिंग)",
        "text_en": "Nothing in this Sanhita shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Sanhita, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.",
        "text_hi": "इस संहिता की कोई भी बात उच्च न्यायालय की उस अंतर्निहित शक्ति को सीमित नहीं करेगी जो न्यायालय की प्रक्रिया के दुरुपयोग को रोकने अथवा न्याय के उद्देश्यों को सुरक्षित करने हेतु आवश्यक हो।",
        "tags": ["quashing", "inherent powers", "bnss 528", "crpc 482", "abuse of process"],
        "landmark_cases": "State of Haryana v. Bhajan Lal (1992)"
    },

    # BSA
    {
        "act_code": "BSA",
        "act_name": "Bharatiya Sakshya Adhiniyam, 2023",
        "section": "61",
        "title_en": "Section 61: Admissibility of Electronic or Digital Records",
        "title_hi": "धारा ६१: इलेक्ट्रॉनिक या डिजिटल अभिलेखों की ग्राह्यता",
        "text_en": "Nothing in this Adhiniyam shall apply to electronic or digital records which shall be admissible as evidence without further proof or production of original, provided the certificate in terms of the Schedule is signed by the person in charge of computer or device or an expert.",
        "text_hi": "इलेक्ट्रॉनिक अथवा डिजिटल रिकॉर्ड मूल उत्पादन के बिना साक्ष्य के रूप में ग्राह्य होंगे यदि अनुसूची के तहत प्रमाण-पत्र अधिकृत विशेषज्ञ या उपकरण प्रबंधक द्वारा हस्ताक्षरित हो।",
        "tags": ["electronic evidence", "digital certificate", "bsa 61", "iea 65b"],
        "landmark_cases": "Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020)"
    },

    # Indian Contract Act, 1872
    {
        "act_code": "CONTRACT",
        "act_name": "Indian Contract Act, 1872",
        "section": "27",
        "title_en": "Section 27: Agreement in Restraint of Trade Void",
        "title_hi": "धारा २७: व्यापार में अवरोधक करार शून्य",
        "text_en": "Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.\nException 1: One who sells the goodwill of a business may agree with the buyer to refrain from carrying on a similar business within specified local limits.",
        "text_hi": "प्रत्येक करार जिससे किसी को कोई विधिपूर्ण वृत्ति, व्यापार या कारोबार चलाने से अवरुद्ध किया जाता है, उस सीमा तक शून्य है। सद्भावना (Goodwill) की बिक्री एकमात्र वैधानिक अपवाद है।",
        "tags": ["restraint of trade", "non compete", "contract act 27", "void agreement", "employment clause"],
        "landmark_cases": "Niranjan Shankar Golikari v. Century Spg & Mfg Co. (1967), Percept D'Mark v. Zaheer Khan (2006)"
    },
    {
        "act_code": "CONTRACT",
        "act_name": "Indian Contract Act, 1872",
        "section": "56",
        "title_en": "Section 56: Agreement to Do Impossible Act & Doctrine of Frustration",
        "title_hi": "धारा ५६: असंभव कार्य करने का करार एवं विफलता (Frustration) का सिद्धांत",
        "text_en": "An agreement to do an act impossible in itself is void.\nA contract to do an act which, after the contract is made, becomes impossible, or, by reason of some event which the promisor could not prevent, unlawful, becomes void when the act becomes impossible or unlawful.",
        "text_hi": "असंभव कार्य करने का करार शून्य है। संविदा होने के पश्चात किसी अप्रत्याशित घटना के कारण कार्य असंभव या गैर-कानूनी हो जाने पर संविदा विफल (Frustrated) होकर शून्य हो जाती है।",
        "tags": ["frustration", "force majeure", "contract act 56", "impossibility"],
        "landmark_cases": "Satyabrata Ghose v. Mugneeram Bangur (1954), Energy Watchdog v. CERC (2017)"
    },
    {
        "act_code": "CONTRACT",
        "act_name": "Indian Contract Act, 1872",
        "section": "73",
        "title_en": "Section 73: Compensation for Loss or Damage Caused by Breach of Contract",
        "title_hi": "धारा ७३: संविदा भंग से हुई हानि या क्षति के लिए प्रतिकर",
        "text_en": "When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.",
        "text_hi": "जब संविदा भंग होती है, तो पीड़ित पक्षकार स्वाभाविक रूप से उत्पन्न होने वाली वास्तविक प्रत्यक्ष हानि के लिए हर्जाना प्राप्त करने का हकदार है। सुदूर (Remote) क्षति हेतु हर्जाना देय नहीं होता।",
        "tags": ["damages", "breach of contract", "contract act 73", "hadley v baxendale"],
        "landmark_cases": "Hadley v. Baxendale, Pannalal Jankidas v. Mohanlal (1951)"
    },

    # CPC 1908
    {
        "act_code": "CPC",
        "act_name": "Code of Civil Procedure, 1908",
        "section": "Order 39 Rules 1-2",
        "title_en": "Order XXXIX Rules 1 & 2: Temporary Injunctions and Interlocutory Orders",
        "title_hi": "आदेश ३९ नियम १ व २: अस्थायी व्यादेश (अंतरिम स्टे / Injunction)",
        "text_en": "Where in any suit it is proved by affidavit or otherwise: (a) that any property in dispute is in danger of being wasted, damaged or alienated, or (b) that defendant threatens or intends to remove or dispose of his property with a view to defrauding creditors, the Court may grant a temporary injunction.\nGoverned by Tripartite Test: (1) Prima Facie Case, (2) Irreparable Injury, (3) Balance of Convenience.",
        "text_hi": "जब वादग्रस्त संपत्ति के नष्ट होने, अंतरित किए जाने अथवा प्रतिवादी द्वारा लेनदारों को धोखा देने की आशंका हो, न्यायालय अंतरिम स्थगन आदेश पारित कर सकता है। त्रिपक्षीय कसौटी: प्रथम दृष्टया मामला, अपूरणीय क्षति एवं सुविधा का संतुलन।",
        "tags": ["cpc order 39", "interim injunction", "stay order", "balance of convenience", "prima facie"],
        "landmark_cases": "Gujarat Bottling Co. Ltd. v. Coca Cola Co. (1995), Dalpat Kumar v. Prahlad Singh (1992)"
    },
    {
        "act_code": "CPC",
        "act_name": "Code of Civil Procedure, 1908",
        "section": "Order 7 Rule 11",
        "title_en": "Order VII Rule 11: Rejection of Plaint",
        "title_hi": "आदेश ७ नियम ११: वादपत्र का नामंजूर किया जाना",
        "text_en": "The plaint shall be rejected in the following cases:\n(a) where it does not disclose a cause of action;\n(b) where the relief claimed is undervalued;\n(d) where the suit appears from the statement in the plaint to be barred by any law (including Limitation Act).",
        "text_hi": "वादपत्र को आरंभ में ही खारिज किया जाएगा: (क) जहां वादहेतुक (Cause of Action) प्रकट नहीं होता, (घ) जहां वादपत्र के कथनों से ही वाद किसी विधि (जैसे परिसीमा अधिनियम) द्वारा वर्जित प्रतीत होता है।",
        "tags": ["cpc order 7 rule 11", "rejection of plaint", "cause of action", "limitation bar"],
        "landmark_cases": "Dahiben v. Arvindbhai Kalyanji Bhanusali (2020)"
    },

    # Specific Relief Act, 1963
    {
        "act_code": "SRA",
        "act_name": "Specific Relief Act, 1963",
        "section": "10",
        "title_en": "Section 10: Specific Performance in Respect of Contracts",
        "title_hi": "धारा १०: संविदाओं का विनिर्दिष्ट पालन (Specific Performance)",
        "text_en": "The specific performance of a contract shall be enforced by the court subject to the provisions contained in sub-section (2) of section 11, section 14 and section 16.\nNote: Post-2018 amendment, specific performance is mandatory, not discretionary.",
        "text_hi": "संविदा का विनिर्दिष्ट पालन न्यायालय द्वारा अनिवार्य रूप से लागू कराया जाएगा। २०१८ संशोधन के पश्चात यह न्यायालय का विवेकाधिकार न होकर एक बाध्यकारी वैधानिक उपचार बन चुका है।",
        "tags": ["specific performance", "sra section 10", "property sale agreement", "2018 amendment"],
        "landmark_cases": "B. Santoshamma v. D. Sarala (2020)"
    },

    # Transfer of Property Act, 1882
    {
        "act_code": "TPA",
        "act_name": "Transfer of Property Act, 1882",
        "section": "54",
        "title_en": "Section 54: Sale Defined and Transfer of Immovable Property",
        "title_hi": "धारा ५४: विक्रय की परिभाषा एवं अचल संपत्ति का अंतरण",
        "text_en": "'Sale' is a transfer of ownership in exchange for a price paid or promised or part-paid and part-promised.\nTransfer of tangible immovable property of value of one hundred rupees and upwards can be made only by a registered instrument. A contract for sale does not, of itself, create any interest in or charge on such property.",
        "text_hi": "विक्रय कीमत के बदले स्वामित्व का अंतरण है। ₹१०० या अधिक मूल्य की अचल संपत्ति का अंतरण केवल पंजीकृत विलेख (Registered Sale Deed) द्वारा ही मान्य है। विक्रय अनुबंध स्वयं संपत्ति में स्वत्व उत्पन्न नहीं करता।",
        "tags": ["sale deed", "tpa 54", "immovable property", "registration act", "title transfer"],
        "landmark_cases": "Suraj Lamp & Industries v. State of Haryana (GPA Sales Invalid)"
    },
    {
        "act_code": "TPA",
        "act_name": "Transfer of Property Act, 1882",
        "section": "52",
        "title_en": "Section 52: Transfer of Property Pending Suit Relating Thereto (Lis Pendens)",
        "title_hi": "धारा ५२: वाद लंबित रहने के दौरान संपत्ति का अंतरण (Lis Pendens सिद्धांत)",
        "text_en": "During the active pendency of any suit or proceeding in which any right to immovable property is directly and specifically in question, the property cannot be transferred or otherwise dealt with by any party to the suit so as to affect the rights of any other party thereto under any decree or order.",
        "text_hi": "न्यायालय में विचाराधीन वाद के दौरान विवादित संपत्ति का किया गया कोई भी अंतरण न्यायालय के अंतिम निर्णय के अधीन रहेगा तथा वादी के अधिकारों को प्रभावित नहीं कर सकता।",
        "tags": ["lis pendens", "tpa 52", "pendency of suit", "property litigation"],
        "landmark_cases": "Amit Kumar Shaw v. Farida Khatoon (2005)"
    },

    # IBC 2016
    {
        "act_code": "IBC",
        "act_name": "Insolvency and Bankruptcy Code, 2016",
        "section": "9",
        "title_en": "Section 9: Application for Initiation of CIRP by Operational Creditor",
        "title_hi": "धारा ९: परिचालन लेनदार द्वारा दिवाला प्रक्रिया (CIRP) प्रारंभ करने का आवेदन",
        "text_en": "After the expiry of the period of ten days from the date of delivery of the demand notice under section 8, if the operational creditor does not receive payment or notice of pre-existing dispute, he may file an application before the NCLT for initiating corporate insolvency resolution process (CIRP).\nMinimum default threshold: Rs 1 Crore.",
        "text_hi": "मांग नोटिस (Section 8) के १० दिन बीतने पर यदि भुगतान अथवा 'पूर्व विवाद' (Pre-existing Dispute) का प्रमाण नहीं मिलता, तो ₹१ करोड़ या अधिक के बकाए हेतु एनसीएलटी में सीआईआरपी याचिका दाखिल की जा सकती है।",
        "tags": ["nclt", "ibc section 9", "operational creditor", "pre existing dispute", "cirp"],
        "landmark_cases": "Mobilox Innovations Pvt. Ltd. v. Kirusa Software Pvt. Ltd. (2018)"
    },
    {
        "act_code": "IBC",
        "act_name": "Insolvency and Bankruptcy Code, 2016",
        "section": "14",
        "title_en": "Section 14: Moratorium on Institution of Suits and Continuation of Proceedings",
        "title_hi": "धारा १४: न्यायिक कार्यवाहियों एवं ऋण वसूली पर अधिस्थगन (Moratorium)",
        "text_en": "Subject to provisions of this Code, on the insolvency commencement date, the Adjudicating Authority shall by order declare moratorium for prohibiting: (a) institution of suits or continuation of pending proceedings, (b) transferring or encumbering assets, (c) foreclosure or enforcement of security interest under SARFAESI.",
        "text_hi": "एनसीएलटी द्वारा दिवाला आवेदन स्वीकार होते ही कॉरपोरेट देनदार के विरुद्ध समस्त मुकदमों, वसूली एवं बैंक खातों की जब्ती पर वैधानिक रोक (Moratorium) प्रभावी हो जाती है।",
        "tags": ["moratorium", "ibc section 14", "stay on recovery", "sarfaesi shield"],
        "landmark_cases": "Innoventive Industries Ltd. v. ICICI Bank (2018)"
    },

    # Limitation Act, 1963
    {
        "act_code": "LIMITATION",
        "act_name": "Limitation Act, 1963",
        "section": "Article 54",
        "title_en": "Article 54: Limitation for Specific Performance of a Contract",
        "title_hi": "अनुच्छेद ५४: संविदा के विनिर्दिष्ट पालन वाद की परिसीमा अवधि",
        "text_en": "Period of Limitation: 3 Years.\nTime from which period begins to run: The date fixed for the performance, or, if no such date is fixed, when the plaintiff has notice that performance is refused.",
        "text_hi": "परिसीमा अवधि: ३ वर्ष। समय की गणना उस तिथि से आरंभ होगी जो निष्पादन हेतु अनुबंध में तय की गई थी, अथवा यदि तिथि तय नहीं थी तो उस दिन से जब वादी को संविदा निष्पादन से इनकार का ज्ञान हुआ।",
        "tags": ["article 54 limitation", "specific performance limitation", "3 years limitation"],
        "landmark_cases": "Urchunan v. D.M. Shanmugam (2020)"
    },
    {
        "act_code": "LIMITATION",
        "act_name": "Limitation Act, 1963",
        "section": "Section 5",
        "title_en": "Section 5: Extension of Prescribed Period (Condonation of Delay)",
        "title_hi": "धारा ५: विलंब की माफी (Condonation of Delay)",
        "text_en": "Any appeal or any application, other than an application under any of the provisions of Order XXI of the Code of Civil Procedure, 1908, may be admitted after the prescribed period if the appellant or applicant satisfies the court that he had sufficient cause for not preferring the appeal or making the application within such period.\nNote: Section 5 applies to appeals and applications, NOT to original suits.",
        "text_hi": "अपील या आवेदन (मूल वादों को छोड़कर) में परिसीमा अवधि बीत जाने के पश्चात भी न्यायालय द्वारा 'पर्याप्त कारण' (Sufficient Cause) सिद्ध होने पर विलंब माफ किया जा सकता है।",
        "tags": ["section 5 limitation", "condonation of delay", "sufficient cause", "appeal delay"],
        "landmark_cases": "Collector Land Acquisition, Anantnag v. Mst. Katiji (1987)"
    },

    # Arbitration Act 1996
    {
        "act_code": "ARBITRATION",
        "act_name": "Arbitration and Conciliation Act, 1996",
        "section": "9",
        "title_en": "Section 9: Interim Measures by Court",
        "title_hi": "धारा ९: न्यायालय द्वारा अंतरिम उपाय",
        "text_en": "A party may, before or during arbitral proceedings or at any time after the making of the arbitral award but before it is enforced in accordance with section 36, apply to a court for interim measures of protection.\nPost-2015 amendment: Once the arbitral tribunal has been constituted, court shall not entertain an application under sub-section (1) unless tribunal remedy under section 17 is inefficacious.",
        "text_hi": "माध्यस्थम कार्यवाहियों से पूर्व अथवा दौरान न्यायालय से संपत्ति के संरक्षण या बैंक गारंटी पर रोक हेतु अंतरिम राहत का आवेदन। पंचाट ट्रिब्यूनल के गठन उपरांत सामान्यतः धारा १७ के तहत ट्रिब्यूनल में जाना अनिवार्य।",
        "tags": ["arbitration section 9", "interim relief court", "bank guarantee injunction"],
        "landmark_cases": "BCCI v. Kochi Cricket Pvt. Ltd. (2018)"
    }
]
