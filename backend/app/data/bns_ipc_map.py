"""
Comprehensive BNS (Bharatiya Nyaya Sanhita) <-> IPC (Indian Penal Code),
BNSS (Bharatiya Nagarik Suraksha Sanhita) <-> CrPC (Code of Criminal Procedure),
and BSA (Bharatiya Sakshya Adhiniyam) <-> IEA (Indian Evidence Act) Cross-Reference Data.
Enacted: 1 July 2024.
"""

from typing import List, Dict, Any, Optional

BNS_IPC_MAPPINGS: List[Dict[str, Any]] = [
    {
        "bns_section": "103",
        "ipc_section": "302",
        "act": "BNS",
        "title_en": "Punishment for Murder",
        "title_hi": "हत्या के लिए दंड",
        "description_en": "Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. Includes sub-clause 103(2) for mob lynching / murder on grounds of race, caste, community.",
        "description_hi": "जो कोई हत्या करेगा वह मृत्युदंड या आजीवन कारावास से दंडित किया जाएगा और जुर्माने का भी भागी होगा। उप-धारा १०३(२) मॉब लिंचिंग को विशेष दंडनीय बनाती है।",
        "bailable": False,
        "cognizable": True,
        "court": "Court of Session",
        "keywords": ["murder", "hatya", "302", "103", "death penalty", "life imprisonment"]
    },
    {
        "bns_section": "101",
        "ipc_section": "300",
        "act": "BNS",
        "title_en": "Murder Defined",
        "title_hi": "हत्या की परिभाषा",
        "description_en": "Culpable homicide is murder if the act by which the death is caused is done with the intention of causing death or grievous bodily harm.",
        "description_hi": "आपराधिक मानव वध हत्या है यदि वह कार्य जिससे मृत्यु कारित की गई हो, मृत्यु कारित करने के आशय से किया गया हो।",
        "bailable": False,
        "cognizable": True,
        "court": "Court of Session",
        "keywords": ["murder definition", "culpable homicide", "mens rea", "300", "101"]
    },
    {
        "bns_section": "105",
        "ipc_section": "304",
        "act": "BNS",
        "title_en": "Culpable Homicide Not Amounting to Murder",
        "title_hi": "आपराधिक मानव वध जो हत्या नहीं है",
        "description_en": "Punishment for culpable homicide not amounting to murder (imprisonment up to life or 10 years).",
        "description_hi": "हत्या की श्रेणी में न आने वाले गैर-इरादतन मानव वध के लिए दंड (आजीवन कारावास या १० वर्ष तक)।",
        "bailable": False,
        "cognizable": True,
        "court": "Court of Session",
        "keywords": ["culpable homicide", "304", "105", "manav vadh"]
    },
    {
        "bns_section": "106",
        "ipc_section": "304A",
        "act": "BNS",
        "title_en": "Causing Death by Negligence (Rash Driving / Hit-and-Run)",
        "title_hi": "उतावलेपन या लापरवाही से मृत्यु कारित करना (हिट एंड रन)",
        "description_en": "Punishment up to 5 years imprisonment for rash/negligent act not amounting to culpable homicide. Section 106(2) provides up to 10 years for hit-and-run without reporting to police/magistrate.",
        "description_hi": "लापरवाही से मृत्यु पर ५ वर्ष तक सजा। उप-धारा १०६(२) के अंतर्गत दुर्घटना के बाद बिना सूचना दिए फरार होने पर १० वर्ष तक कारावास।",
        "bailable": True,
        "cognizable": True,
        "court": "Magistrate First Class",
        "keywords": ["rash driving", "accident", "hit and run", "304a", "106", "negligence"]
    },
    {
        "bns_section": "64",
        "ipc_section": "376",
        "act": "BNS",
        "title_en": "Punishment for Rape",
        "title_hi": "बलात्कार के लिए दंड",
        "description_en": "Rigorous imprisonment not less than 10 years extending to life imprisonment and fine.",
        "description_hi": "कठोर कारावास जो १० वर्ष से कम का नहीं होगा और आजीवन कारावास तक हो सकेगा और जुर्माने से दंडनीय।",
        "bailable": False,
        "cognizable": True,
        "court": "Court of Session",
        "keywords": ["rape", "balatkar", "376", "64", "sexual assault"]
    },
    {
        "bns_section": "63",
        "ipc_section": "375",
        "act": "BNS",
        "title_en": "Rape Defined",
        "title_hi": "बलात्कार की विधिक परिभाषा",
        "description_en": "Definition of rape and categories of non-consent, coercion, or deceitful inducement.",
        "description_hi": "सहमति के बिना या छल-कपट द्वारा किए गए यौन उत्पीड़न की विस्तृत परिभाषा।",
        "bailable": False,
        "cognizable": True,
        "court": "Court of Session",
        "keywords": ["rape definition", "consent", "375", "63"]
    },
    {
        "bns_section": "70",
        "ipc_section": "376D",
        "act": "BNS",
        "title_en": "Gang Rape",
        "title_hi": "सामूहिक बलात्कार (गैंग रेप)",
        "description_en": "Where a woman is raped by one or more persons acting in common intention; minimum 20 years extending to remainder of natural life.",
        "description_hi": "सामूहिक रूप से किए गए बलात्कार में न्यूनतम २० वर्ष का कठोर कारावास या प्राकृतिक जीवनपर्यंत कारावास।",
        "bailable": False,
        "cognizable": True,
        "court": "Court of Session",
        "keywords": ["gang rape", "376d", "70", "samuhik balatkar"]
    },
    {
        "bns_section": "69",
        "ipc_section": "New Provision (Formerly 417/376)",
        "act": "BNS",
        "title_en": "Sexual Intercourse by Employing Deceitful Means / False Promise to Marry",
        "title_hi": "विवाह के झूठे वादे या कपटपूर्ण साधनों द्वारा यौन संबंध",
        "description_en": "Whoever by deceitful means or promise to marry without intention of fulfilling causes sexual intercourse not amounting to rape; punishable with up to 10 years imprisonment.",
        "description_hi": "विवाह के झूठे झांसे, पहचान छिपाकर या कपटपूर्ण तरीके से बनाए गए यौन संबंध पर १० वर्ष तक का कारावास।",
        "bailable": False,
        "cognizable": True,
        "court": "Court of Session",
        "keywords": ["false promise to marry", "promise to marry", "deceitful means", "shaadi ka jhootha vada", "69"]
    },
    {
        "bns_section": "85",
        "ipc_section": "498A",
        "act": "BNS",
        "title_en": "Husband or Relative of Husband Subjecting Woman to Cruelty",
        "title_hi": "पति या पति के नातेदार द्वारा महिला के प्रति क्रूरता",
        "description_en": "Cruelty to a married woman by husband or relatives; punishable with up to 3 years imprisonment and fine. Subject to Arnesh Kumar mandatory notice procedure.",
        "description_hi": "विवाहिता के प्रति मानसिक या शारीरिक क्रूरता अथवा दहेज मांग; ३ वर्ष तक कारावास और जुर्माना। अरणेश कुमार दिशा-निर्देश लागू।",
        "bailable": False,
        "cognizable": True,
        "court": "Magistrate First Class",
        "keywords": ["dowry cruelty", "498a", "85", "dahej", "matrimonial cruelty", "krurta"]
    },
    {
        "bns_section": "86",
        "ipc_section": "498A Explanation",
        "act": "BNS",
        "title_en": "Cruelty Defined",
        "title_hi": "क्रूरता की परिभाषा",
        "description_en": "Defines cruelty as willful conduct driving woman to suicide or grave mental/physical harm, or harassment for unlawful property demand.",
        "description_hi": "मानसिक अथवा शारीरिक प्रताड़ना तथा गैर-कानूनी संपत्ति की मांग के उत्पीड़न की स्पष्ट परिभाषा।",
        "bailable": False,
        "cognizable": True,
        "court": "Magistrate First Class",
        "keywords": ["cruelty definition", "harassment", "86"]
    },
    {
        "bns_section": "80",
        "ipc_section": "304B",
        "act": "BNS",
        "title_en": "Dowry Death",
        "title_hi": "दहेज मृत्यु",
        "description_en": "Death of a woman within 7 years of marriage caused by burns or bodily injury with proof of dowry cruelty; minimum 7 years extending to life imprisonment.",
        "description_hi": "विवाह के ७ वर्षों के भीतर अप्राकृतिक कारणों से मृत्यु तथा दहेज प्रताड़ना का साक्ष्य; न्यूनतम ७ वर्ष से आजीवन कारावास।",
        "bailable": False,
        "cognizable": True,
        "court": "Court of Session",
        "keywords": ["dowry death", "dahej mrityu", "304b", "80", "7 years marriage"]
    },
    {
        "bns_section": "316",
        "ipc_section": "405/406",
        "act": "BNS",
        "title_en": "Criminal Breach of Trust",
        "title_hi": "आपराधिक विश्वासघात (न्यासभंग)",
        "description_en": "Dishonest misappropriation or conversion to own use of property entrusted; punishable with up to 5 years imprisonment (increased from 3 years in IPC).",
        "description_hi": "सौंपी गई संपत्ति का बेईमानी से गबन या दुरुपयोग; ५ वर्ष तक का कारावास एवं जुर्माना।",
        "bailable": False,
        "cognizable": True,
        "court": "Magistrate First Class",
        "keywords": ["criminal breach of trust", "406", "405", "316", "nyasbhang", "misappropriation"]
    },
    {
        "bns_section": "318",
        "ipc_section": "420",
        "act": "BNS",
        "title_en": "Cheating and Dishonestly Inducing Delivery of Property",
        "title_hi": "धोखाधड़ी एवं बेईमानी से संपत्ति का परिदान कराना",
        "description_en": "Whoever cheats and thereby dishonestly induces delivery of property or alteration of valuable security; punishable with imprisonment up to 7 years and fine.",
        "description_hi": "धोखा देकर छलपूर्वक संपत्ति अर्जित करना या मूल्यवान प्रतिभूति में परिवर्तन कराना; ७ वर्ष तक कारावास और जुर्माना।",
        "bailable": False,
        "cognizable": True,
        "court": "Magistrate First Class",
        "keywords": ["cheating", "420", "318", "dhokhadhadi", "fraud", "420 ipc"]
    },
    {
        "bns_section": "303",
        "ipc_section": "378/379",
        "act": "BNS",
        "title_en": "Theft",
        "title_hi": "चोरी का अपराध एवं दंड",
        "description_en": "Dishonestly taking any movable property out of the possession of any person without consent; punishable with imprisonment up to 3 years or community service for petty theft under Rs 5,000.",
        "description_hi": "सहमति के बिना किसी की चल संपत्ति बेईमानी से ले जाना; ३ वर्ष तक कारावास या ₹५,००० से कम की चोरी पर सामुदायिक सेवा (Community Service)।",
        "bailable": False,
        "cognizable": True,
        "court": "Any Magistrate",
        "keywords": ["theft", "chori", "379", "378", "303", "community service"]
    },
    {
        "bns_section": "351",
        "ipc_section": "503/506",
        "act": "BNS",
        "title_en": "Criminal Intimidation",
        "title_hi": "आपराधिक धमकी (अभित्रास)",
        "description_en": "Threatening injury to person, reputation, or property with intent to cause alarm; punishable with up to 2 years or 7 years if threat is to cause death/grievous hurt.",
        "description_hi": "जान से मारने, चोट पहुंचाने या प्रतिष्ठा को हानि पहुंचाने की धमकी देना; २ से ७ वर्ष तक कारावास।",
        "bailable": True,
        "cognizable": False,
        "court": "Any Magistrate",
        "keywords": ["criminal intimidation", "506", "503", "351", "dhamki", "threat"]
    },
    {
        "bns_section": "356",
        "ipc_section": "499/500",
        "act": "BNS",
        "title_en": "Defamation",
        "title_hi": "मानहानि का अपराध एवं दंड",
        "description_en": "Making or publishing imputation intending to harm reputation; punishable with simple imprisonment up to 2 years, fine, or community service.",
        "description_hi": "प्रतिष्ठा को क्षति पहुंचाने के उद्देश्य से मिथ्या लांछन लगाना; २ वर्ष तक सादा कारावास, जुर्माना या सामुदायिक सेवा।",
        "bailable": True,
        "cognizable": False,
        "court": "Court of Session / Magistrate",
        "keywords": ["defamation", "manhani", "499", "500", "356", "reputation"]
    },
    {
        "bns_section": "189",
        "ipc_section": "141/143",
        "act": "BNS",
        "title_en": "Unlawful Assembly",
        "title_hi": "विधि-विरुद्ध जमाव",
        "description_en": "Assembly of five or more persons with common object to overawe government, resist law execution, or commit mischief; punishable with up to 6 months.",
        "description_hi": "पांच या अधिक व्यक्तियों का गैर-कानूनी जमावड़ा; ६ माह तक कारावास या जुर्माना।",
        "bailable": True,
        "cognizable": True,
        "court": "Any Magistrate",
        "keywords": ["unlawful assembly", "141", "143", "189", "jamawada"]
    },
    {
        "bns_section": "191",
        "ipc_section": "146/147",
        "act": "BNS",
        "title_en": "Rioting",
        "title_hi": "दंगा एवं बलवा",
        "description_en": "Force or violence used by an unlawful assembly; punishable with up to 2 years imprisonment or fine.",
        "description_hi": "विधि-विरुद्ध जमाव द्वारा बल या हिंसा का प्रयोग; २ वर्ष तक कारावास या जुर्माना।",
        "bailable": True,
        "cognizable": True,
        "court": "Any Magistrate",
        "keywords": ["rioting", "balwa", "danga", "147", "191"]
    },
    {
        "bns_section": "152",
        "ipc_section": "124A",
        "act": "BNS",
        "title_en": "Act Endangering Sovereignty, Unity and Integrity of India (Replaces Sedition)",
        "title_hi": "भारत की संप्रभुता, एकता और अखंडता को खतरे में डालने वाले कृत्य (राजद्रोह का स्थान)",
        "description_en": "Purposely or knowingly exciting subversive activities, armed rebellion, or feelings of separatist activities endangering sovereignty; punishable with 7 years up to life imprisonment.",
        "description_hi": "भारत की संप्रभुता या अखंडता को अलगाववादी या सशस्त्र विद्रोह द्वारा खतरे में डालना; ७ वर्ष से आजीवन कारावास। 'राजद्रोह' (Sedition) शब्द को समाप्त कर संप्रभुता रक्षा को केंद्र में रखा गया।",
        "bailable": False,
        "cognizable": True,
        "court": "Court of Session",
        "keywords": ["sovereignty", "sedition", "124a", "152", "rajdroh", "separatism", "integrity"]
    },
    {
        "bns_section": "111",
        "ipc_section": "New Provision (Organized Crime)",
        "act": "BNS",
        "title_en": "Organized Crime",
        "title_hi": "संगठित अपराध (सिंडिकेट, फिरौती, तस्करी)",
        "description_en": "Continuing unlawful activity including kidnapping, robbery, cyber-crimes, extortion, trafficking by a crime syndicate; death penalty or life imprisonment if death results, otherwise 5 years to life.",
        "description_hi": "आपराधिक सिंडिकेट द्वारा अपहरण, जबरन वसूली, मादक पदार्थ या साइबर अपराध; मृत्यु होने पर मृत्युदंड या आजीवन कारावास।",
        "bailable": False,
        "cognizable": True,
        "court": "Special Court / Court of Session",
        "keywords": ["organized crime", "gang", "syndicate", "extortion", "111"]
    },
    {
        "bns_section": "113",
        "ipc_section": "New Provision (Terrorist Act in General Law)",
        "act": "BNS",
        "title_en": "Terrorist Act",
        "title_hi": "आतंकवादी कृत्य का सामान्य दांडिक संहिता में समावेशन",
        "description_en": "Any act committed with intent to threaten unity, integrity, security of India or terrorize public; minimum 5 years to death penalty.",
        "description_hi": "भारत की एकता, सुरक्षा या संप्रभुता को आतंकित करने वाले कृत्यों को सामान्य दंड संहिता में परिभाषित किया गया।",
        "bailable": False,
        "cognizable": True,
        "court": "Court of Session",
        "keywords": ["terrorist act", "aatankwad", "113", "national security"]
    },
    {
        "bns_section": "336",
        "ipc_section": "463/465",
        "act": "BNS",
        "title_en": "Forgery",
        "title_hi": "जालसाजी एवं कूटकरण",
        "description_en": "Making false documents or electronic records with intent to defraud; punishable with imprisonment up to 2 years or fine.",
        "description_hi": "धोखाधड़ी के उद्देश्य से जाली दस्तावेज या इलेक्ट्रॉनिक रिकॉर्ड तैयार करना; २ वर्ष तक कारावास।",
        "bailable": True,
        "cognizable": False,
        "court": "Magistrate First Class",
        "keywords": ["forgery", "465", "463", "336", "jaalsazi", "fake documents"]
    },
    {
        "bns_section": "338",
        "ipc_section": "468",
        "act": "BNS",
        "title_en": "Forgery for Purpose of Cheating",
        "title_hi": "धोखाधड़ी के प्रयोजन से जालसाजी",
        "description_en": "Committing forgery intending that the forged document or electronic record shall be used for cheating; punishable up to 7 years imprisonment and fine.",
        "description_hi": "धोखा देने के उद्देश्य से दस्तावेज की कूट-रचना करना; ७ वर्ष तक का कारावास एवं जुर्माना।",
        "bailable": False,
        "cognizable": True,
        "court": "Magistrate First Class",
        "keywords": ["forgery cheating", "468", "338"]
    }
]

BNSS_CRPC_MAPPINGS: List[Dict[str, Any]] = [
    {
        "bnss_section": "35",
        "crpc_section": "41A",
        "act": "BNSS",
        "title_en": "Notice of Appearance Before Police Officer (Mandatory Notice Before Arrest)",
        "title_hi": "पुलिस अधिकारी के समक्ष उपस्थिति की सूचना (गिरफ्तारी से पूर्व अनिवार्य नोटिस)",
        "description_en": "For offenses punishable up to 7 years imprisonment, police officer must issue a notice directing accused to appear before him; arrest without compliance requires recorded reasons and prior sanction of DySP.",
        "description_hi": "७ वर्ष तक की सजा वाले अपराधों में सीधे गिरफ्तारी निषिद्ध; अभियुक्त को थाने उपस्थित होने का नोटिस देना अनिवार्य। अरणेश कुमार सुरक्षा बीएनएसएस धारा ३५ में संहिताबद्ध।",
        "keywords": ["41a", "35", "notice of appearance", "arnesh kumar", "arrest safeguard"]
    },
    {
        "bnss_section": "173",
        "crpc_section": "154",
        "act": "BNSS",
        "title_en": "Information in Cognizable Cases (FIR and e-FIR)",
        "title_hi": "संज्ञेय मामलों में सूचना (प्राथमिकी एवं ई-एफआईआर)",
        "description_en": "Manner of recording First Information Report (FIR). Sub-section 173(1) explicitly legalizes e-FIR: information given electronically must be taken on record and signed within 3 days.",
        "description_hi": "प्राथमिकी दर्ज करने की प्रक्रिया। धारा १७३(१) इलेक्ट्रॉनिक माध्यम से ई-एफआईआर दर्ज करने की विधिक मान्यता प्रदान करती है।",
        "keywords": ["fir", "efir", "154", "173", "prathmiki", "zero fir"]
    },
    {
        "bnss_section": "479",
        "crpc_section": "436A",
        "act": "BNSS",
        "title_en": "Maximum Period for Which an Undertrial Prisoner Can Be Detained",
        "title_hi": "विचाराधीन कैदी की हिरासत की अधिकतम अवधि एवं वैधानिक जमानत",
        "description_en": "Mandatory release on bail for first-time offenders who have served one-third (1/3rd) of the maximum imprisonment; and one-half (1/2) for regular undertrials.",
        "description_hi": "प्रथम बार अपराध करने वाले विचाराधीन बंदियों के लिए अधिकतम सजा की एक-तिहाई (१/३) अवधि पूरी होने पर अनिवार्य जमानत।",
        "keywords": ["undertrial bail", "436a", "479", "statutory bail", "vicharadhin bandi"]
    },
    {
        "bnss_section": "482",
        "crpc_section": "438",
        "act": "BNSS",
        "title_en": "Direction for Grant of Bail to Person Apprehending Arrest (Anticipatory Bail)",
        "title_hi": "गिरफ्तारी की आशंका वाले व्यक्ति की अग्रिम जमानत का आदेश",
        "description_en": "High Court or Sessions Court powers to grant anticipatory bail where reasonable apprehension of arrest in non-bailable offense exists.",
        "description_hi": "गैर-जमानती अपराध में अनुचित गिरफ्तारी से पूर्व उच्च न्यायालय या सत्र न्यायालय से अग्रिम जमानत प्राप्त करने की शक्ति।",
        "keywords": ["anticipatory bail", "438", "482 bnss", "agrim jamanat"]
    },
    {
        "bnss_section": "528",
        "crpc_section": "482",
        "act": "BNSS",
        "title_en": "Saving of Inherent Powers of High Court (Quashing of FIR / Proceedings)",
        "title_hi": "उच्च न्यायालय की अंतर्निहित शक्तियों का संरक्षण (एफआईआर निरस्तीकरण)",
        "description_en": "Inherent jurisdiction of High Court to prevent abuse of process of any court and to secure ends of justice; standard vehicle for quashing FIRs and chargesheets.",
        "description_hi": "न्यायिक प्रक्रिया के दुरुपयोग को रोकने एवं न्याय सुनिश्चित करने हेतु उच्च न्यायालय की असीम शक्तियां (क्वैशिंग याचिकाएं)।",
        "keywords": ["inherent powers", "quashing", "482 crpc", "528 bnss", "fir quash"]
    },
    {
        "bnss_section": "187",
        "crpc_section": "167",
        "act": "BNSS",
        "title_en": "Procedure When Investigation Cannot Be Completed in 24 Hours (Police Custody Remand)",
        "title_hi": "२४ घंटे में विवेचना पूरी न होने पर रिमांड प्रक्रिया (पुलिस अभिरक्षा)",
        "description_en": "Permits 15 days police custody remand to be taken in parts or whole within the first 40 or 60 days of the total 60/90 day detention period.",
        "description_hi": "पुलिस रिमांड की १५ दिनों की अवधि को पहले ४० अथवा ६० दिनों के दौरान टुकड़ों में लिए जाने का नया प्रावधान।",
        "keywords": ["police custody", "remand", "167", "187", "default bail"]
    }
]

BSA_EVIDENCE_MAPPINGS: List[Dict[str, Any]] = [
    {
        "bsa_section": "61",
        "iea_section": "65B",
        "act": "BSA",
        "title_en": "Admissibility of Electronic Records",
        "title_hi": "इलेक्ट्रॉनिक अभिलेखों की ग्राह्यता एवं प्रमाण-पत्र",
        "description_en": "Governs admissibility of electronic evidence, emails, server logs, mobile chats, digital hashes. Replaces Section 65B certificate with Schedule format declaration signed by person managing device or qualified expert.",
        "description_hi": "डिजिटल साक्ष्य, ईमेल, चैट तथा सर्वर डेटा की न्यायालय में ग्राह्यता। पूर्ववर्ती ६५-ख (65B) के स्थान पर अनुसूची प्रारूप का प्रमाण-पत्र अनिवार्य।",
        "keywords": ["65b", "61", "electronic evidence", "digital records", "hash validation", "praman patra"]
    },
    {
        "bsa_section": "24",
        "iea_section": "27",
        "act": "BSA",
        "title_en": "How Much of Information Received from Accused May Be Proved (Discovery / Recovery)",
        "title_hi": "अभियुक्त से प्राप्त कितनी सूचना सिद्ध की जा सकेगी (बरामदगी मेमो)",
        "description_en": "Confession leading to discovery of fact, weapon, stolen article or dead body admissible to that distinct extent.",
        "description_hi": "पुलिस हिरासत में अभियुक्त के बयान के आधार पर बरामद हथियार या वस्तु की सीमा तक साक्ष्य ग्राह्य।",
        "keywords": ["section 27", "recovery", "discovery memo", "24 bsa", "baramadgi"]
    },
    {
        "bsa_section": "119",
        "iea_section": "113B",
        "act": "BSA",
        "title_en": "Presumption as to Dowry Death",
        "title_hi": "दहेज मृत्यु के बारे में वैधानिक उपधारणा",
        "description_en": "Court shall presume dowry death if shown that soon before death the woman was subjected to cruelty by husband or relatives for dowry.",
        "description_hi": "मृत्यु से ठीक पूर्व दहेज उत्पीड़न सिद्ध होने पर न्यायालय द्वारा दहेज मृत्यु की अनिवार्य उपधारणा।",
        "keywords": ["presumption", "dowry presumption", "113b", "119 bsa"]
    }
]

ALL_CRIMINAL_MAPPINGS = BNS_IPC_MAPPINGS + BNSS_CRPC_MAPPINGS + BSA_EVIDENCE_MAPPINGS


def resolve_citation(query: str) -> Dict[str, Any]:
    """
    Given an input citation like 'IPC 302', '376', '498A', 'BNS 103', 'CrPC 41A', '65B',
    resolves the modern statute equivalent, title, explanation, and reciprocal mapping.
    """
    clean_q = query.strip().upper().replace("SECTION", "").replace("SEC.", "").replace("SEC", "").strip()
    
    # Try exact match on IPC or CrPC or IEA section
    for item in ALL_CRIMINAL_MAPPINGS:
        ipc_sec = item.get("ipc_section", "").upper().replace("IPC", "").strip()
        crpc_sec = item.get("crpc_section", "").upper().replace("CRPC", "").strip()
        iea_sec = item.get("iea_section", "").upper().replace("IEA", "").strip()
        bns_sec = item.get("bns_section", "").upper().replace("BNS", "").strip()
        bnss_sec = item.get("bnss_section", "").upper().replace("BNSS", "").strip()
        bsa_sec = item.get("bsa_section", "").upper().replace("BSA", "").strip()
        
        # Match against user query
        if clean_q in [ipc_sec, f"IPC {ipc_sec}", f"IPC{ipc_sec}"]:
            return {
                "matched": True,
                "input": query,
                "target_act": item["act"],
                "target_section": item.get("bns_section") or item.get("bnss_section") or item.get("bsa_section"),
                "source_act": "IPC",
                "source_section": item.get("ipc_section"),
                "details": item
            }
        if clean_q in [crpc_sec, f"CRPC {crpc_sec}", f"CRPC{crpc_sec}"]:
            return {
                "matched": True,
                "input": query,
                "target_act": "BNSS",
                "target_section": item.get("bnss_section"),
                "source_act": "CrPC",
                "source_section": item.get("crpc_section"),
                "details": item
            }
        if clean_q in [iea_sec, f"IEA {iea_sec}", f"65B"]:
            return {
                "matched": True,
                "input": query,
                "target_act": "BSA",
                "target_section": item.get("bsa_section"),
                "source_act": "IEA",
                "source_section": item.get("iea_section"),
                "details": item
            }
        if clean_q in [bns_sec, f"BNS {bns_sec}", f"BNS{bns_sec}"]:
            return {
                "matched": True,
                "input": query,
                "target_act": "BNS",
                "target_section": bns_sec,
                "source_act": "IPC",
                "source_section": item.get("ipc_section"),
                "details": item
            }
        if clean_q in [bnss_sec, f"BNSS {bnss_sec}", f"BNSS{bnss_sec}"]:
            return {
                "matched": True,
                "input": query,
                "target_act": "BNSS",
                "target_section": bnss_sec,
                "source_act": "CrPC",
                "source_section": item.get("crpc_section"),
                "details": item
            }
            
    # Fuzzy keyword search across list
    lower_q = query.lower()
    for item in ALL_CRIMINAL_MAPPINGS:
        if any(kw in lower_q for kw in item.get("keywords", [])) or lower_q in item["title_en"].lower() or lower_q in item["title_hi"]:
            target_sec = item.get("bns_section") or item.get("bnss_section") or item.get("bsa_section")
            src_sec = item.get("ipc_section") or item.get("crpc_section") or item.get("iea_section")
            return {
                "matched": True,
                "input": query,
                "target_act": item["act"],
                "target_section": target_sec,
                "source_section": src_sec,
                "details": item
            }

    return {
        "matched": False,
        "input": query,
        "message": f"No direct statutory mapping found for '{query}'. Ensure citation format like 'IPC 302', 'BNS 103', '498A', 'CrPC 41A', or '65B'."
    }
