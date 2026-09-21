"""
Indian Constitution Articles and Landmark Provisions Dataset
Contains Articles in English and Hindi (Devanagari) along with Parts, Summaries, and Core Doctrines.
"""

CONSTITUTION_PARTS = [
    {"id": "preamble", "name_en": "Preamble", "name_hi": "प्रस्तावना", "description": "Guiding principles, Sovereign Socialist Secular Democratic Republic"},
    {"id": "part3", "name_en": "Part III: Fundamental Rights", "name_hi": "भाग ३: मौलिक अधिकार", "description": "Articles 12-35 (Equality, Freedom, Life & Liberty, Constitutional Remedies)"},
    {"id": "part4", "name_en": "Part IV: Directive Principles of State Policy", "name_hi": "भाग ४: राज्य के नीति निदेशक तत्व", "description": "Articles 36-51 (Socio-economic welfare, Uniform Civil Code, Separation of powers)"},
    {"id": "part4a", "name_en": "Part IV-A: Fundamental Duties", "name_hi": "भाग ४-क: मौलिक कर्तव्य", "description": "Article 51A (Duties of citizens towards sovereignty and constitution)"},
    {"id": "part5", "name_en": "Part V: The Union Judiciary & Executive", "name_hi": "भाग ५: संघ न्यायपालिका व कार्यपालिका", "description": "Supreme Court jurisdiction, Presidential powers"},
    {"id": "part6", "name_en": "Part VI: The High Courts", "name_hi": "भाग ६: उच्च न्यायालय (High Courts)", "description": "High Court writ jurisdiction (Article 226)"},
    {"id": "part18", "name_en": "Part XVIII: Emergency Provisions", "name_hi": "भाग १८: आपातकालीन उपबंध", "description": "Articles 352-360 (National emergency, President's rule)"},
    {"id": "part20", "name_en": "Part XX: Amendment of the Constitution", "name_hi": "भाग २०: संविधान संशोधन", "description": "Article 368 (Power of Parliament & Basic Structure Doctrine)"}
]

CONSTITUTION_ARTICLES = [
    {
        "article_number": "Preamble",
        "part_id": "preamble",
        "part_label": "Preamble",
        "title_en": "The Preamble to the Constitution of India",
        "title_hi": "भारत के संविधान की उद्देशिका (प्रस्तावना)",
        "full_text_en": "WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens: JUSTICE, social, economic and political; LIBERTY of thought, expression, belief, faith and worship; EQUALITY of status and of opportunity; and to promote among them all FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation.",
        "full_text_hi": "हम, भारत के लोग, भारत को एक सम्पूर्ण प्रभुत्व-सम्पन्न, समाजवादी, पंथनिरपेक्ष, लोकतंत्रात्मक गणराज्य बनाने के लिए तथा उसके समस्त नागरिकों को: सामाजिक, आर्थिक और राजनीतिक न्याय; विचार, अभिव्यक्ति, विश्वास, धर्म और उपासना की स्वतंत्रता; प्रतिष्ठा और अवसर की समता प्राप्त कराने के लिए तथा उन सब में व्यक्ति की गरिमा और राष्ट्र की एकता और अखंडता सुनिश्चित करने वाली बंधुता बढ़ाने के लिए दृढ़संकल्प होकर अपनी इस संविधान सभा में आज एतद्द्वारा इस संविधान को अंगीकृत, अधिनियमित और आत्मार्पित करते हैं।",
        "landmark_cases": "Kesavananda Bharati v. State of Kerala (1973), Minerva Mills (1980)",
        "key_doctrines": ["Basic Structure Doctrine", "Secularism", "Constitutional Supremacy"],
        "tags": ["preamble", "sovereign", "secular", "democracy", "justice", "liberty", "equality"]
    },
    {
        "article_number": "14",
        "part_id": "part3",
        "part_label": "Part III: Fundamental Rights",
        "title_en": "Article 14: Equality before Law and Equal Protection of the Laws",
        "title_hi": "अनुच्छेद १४: विधि के समक्ष समता और विधियों का समान संरक्षण",
        "full_text_en": "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India. Prohibits arbitrariness in state action and mandates reasonable classification based on an intelligible differentia having a rational nexus to the object sought to be achieved.",
        "full_text_hi": "राज्य, भारत के राज्यक्षेत्र में किसी व्यक्ति को विधि के समक्ष समता से या विधियों के समान संरक्षण से वंचित नहीं करेगा। यह प्रशासनिक एवं विधायी मनमानेपन पर रोक लगाता है तथा बौद्धिक विभेदक (Intelligible Differentia) पर आधारित युक्तियुक्त वर्गीकरण की अनुमति देता है।",
        "landmark_cases": "E.P. Royappa v. State of Tamil Nadu (1974), Maneka Gandhi v. Union of India (1978)",
        "key_doctrines": ["Non-Arbitrariness Doctrine", "Reasonable Classification", "Rule of Law"],
        "tags": ["equality", "rule_of_law", "non_arbitrariness", "article14"]
    },
    {
        "article_number": "19",
        "part_id": "part3",
        "part_label": "Part III: Fundamental Rights",
        "title_en": "Article 19: Protection of Six Freedoms (Speech, Assembly, Association, Movement, Residence, Profession)",
        "title_hi": "अनुच्छेद १९: वाक्-स्वातंत्र्य आदि छह स्वतंत्रताओं का संरक्षण",
        "full_text_en": "All citizens shall have the right: (a) to freedom of speech and expression; (b) to assemble peaceably and without arms; (c) to form associations or unions; (d) to move freely throughout the territory of India; (e) to reside and settle in any part of the territory of India; and (g) to practise any profession, or to carry on any occupation, trade or business. Subject to reasonable restrictions under clauses (2) to (6).",
        "full_text_hi": "सभी नागरिकों को अधिकार होगा: (क) वाक्-स्वातंत्र्य और अभिव्यक्ति-स्वातंत्र्य का; (ख) शांतिपूर्वक और निरायुध सम्मेलन का; (ग) संगम या संघ बनाने का; (घ) भारत के राज्यक्षेत्र में सर्वत्र अबाध संचरण का; (ङ) भारत के किसी भी भाग में निवास करने और बस जाने का; और (छ) कोई वृत्ति, उपजीविका, व्यापार या कारबार करने का। ये अधिकार युक्तियुक्त निर्बंधनों (Reasonable Restrictions) के अधीन हैं।",
        "landmark_cases": "Romesh Thappar v. State of Madras (1950), Shreya Singhal v. Union of India (2015)",
        "key_doctrines": ["Freedom of Press", "Proportionality Test", "Reasonable Restrictions"],
        "tags": ["free_speech", "expression", "assembly", "trade", "article19"]
    },
    {
        "article_number": "21",
        "part_id": "part3",
        "part_label": "Part III: Fundamental Rights",
        "title_en": "Article 21: Protection of Life and Personal Liberty",
        "title_hi": "अनुच्छेद २१: प्राण और दैहिक स्वतंत्रता का संरक्षण",
        "full_text_en": "No person shall be deprived of his life or personal liberty except according to procedure established by law. Expansively interpreted to encompass right to live with human dignity, right to privacy, speedy trial, clean environment, free legal aid, and health.",
        "full_text_hi": "किसी व्यक्ति को उसके प्राण या दैहिक स्वतंत्रता से विधि द्वारा स्थापित प्रक्रिया के अनुसार ही वंचित किया जाएगा, अन्यथा नहीं। सर्वोच्च न्यायालय ने इसमें गरिमापूर्ण जीवन, निजता का अधिकार (Right to Privacy), त्वरित विचारण, स्वच्छ पर्यावरण और निःशुल्क विधिक सहायता को शामिल माना है।",
        "landmark_cases": "Maneka Gandhi v. Union of India (1978), K.S. Puttaswamy v. Union of India (2017)",
        "key_doctrines": ["Due Process of Law", "Right to Privacy", "Substantive Fairness", "Golden Triangle (14, 19, 21)"],
        "tags": ["life", "liberty", "privacy", "due_process", "human_dignity", "article21"]
    },
    {
        "article_number": "21A",
        "part_id": "part3",
        "part_label": "Part III: Fundamental Rights",
        "title_en": "Article 21A: Right to Free and Compulsory Education",
        "title_hi": "अनुच्छेद २१-क: निःशुल्क और अनिवार्य शिक्षा का अधिकार",
        "full_text_en": "The State shall provide free and compulsory education to all children of the age of six to fourteen years in such manner as the State may, by law, determine. Enacted via 86th Constitutional Amendment Act, 2002.",
        "full_text_hi": "राज्य छह से चौदह वर्ष तक की आयु वाले सभी बालकों के लिए निःशुल्क और अनिवार्य शिक्षा उपलब्ध कराने की व्यवस्था करेगा जैसा कि राज्य, विधि द्वारा, अवधारित करे। (८६वां संविधान संशोधन अधिनियम, २००२)।",
        "landmark_cases": "Mohini Jain v. State of Karnataka (1992), Unni Krishnan v. State of Andhra Pradesh (1993)",
        "key_doctrines": ["Universal Elementary Education", "Child Welfare"],
        "tags": ["education", "children", "fundamental_rights", "article21a"]
    },
    {
        "article_number": "25",
        "part_id": "part3",
        "part_label": "Part III: Fundamental Rights",
        "title_en": "Article 25: Freedom of Conscience and Free Profession, Practice and Propagation of Religion",
        "title_hi": "अनुच्छेद २५: अंतःकरण की और धर्म के अबाध रूप से मानने, आचरण और प्रचार करने की स्वतंत्रता",
        "full_text_en": "Subject to public order, morality and health and to the other provisions of this Part, all persons are equally entitled to freedom of conscience and the right freely to profess, practise and propagate religion.",
        "full_text_hi": "लोक व्यवस्था, सदाचार और स्वास्थ्य तथा इस भाग के अन्य उपबंधों के अधीन रहते हुए, सभी व्यक्तियों को अंतःकरण की स्वतंत्रता का और धर्म के अबाध रूप से मानने, आचरण करने और प्रचार करने का समान हक होगा।",
        "landmark_cases": "Commissioner, Hindu Religious Endowments v. Sri Lakshmindra Thirtha Swamiar (Shirur Mutt Case, 1954), Indian Young Lawyers Association (Sabarimala Case, 2018)",
        "key_doctrines": ["Essential Religious Practices Test", "Secular Constitutionalism"],
        "tags": ["religion", "conscience", "faith", "article25"]
    },
    {
        "article_number": "32",
        "part_id": "part3",
        "part_label": "Part III: Fundamental Rights",
        "title_en": "Article 32: Remedies for Enforcement of Fundamental Rights (Constitutional Writs)",
        "title_hi": "अनुच्छेद ३२: मौलिक अधिकारों के प्रवर्तन हेतु उपचार (संवैधानिक रिट)",
        "full_text_en": "The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed. The Supreme Court shall have power to issue directions, orders or writs, including writs in the nature of Habeas Corpus, Mandamus, Prohibition, Quo Warranto, and Certiorari.",
        "full_text_hi": "इस भाग द्वारा प्रदत्त अधिकारों को प्रवर्तित कराने के लिए समुचित कार्यवाहियों द्वारा उच्चतम न्यायालय में समावेदन करने का अधिकार प्रत्याभूत किया जाता है। उच्चतम न्यायालय को बंदी प्रत्यक्षीकरण, परमादेश, प्रतिषेध, अधिकार-पृच्छा और उत्प्रेषण रिट निकालने की शक्ति होगी। इसे डॉ. बी. आर. आंबेडकर ने संविधान का हृदय और आत्मा कहा था।",
        "landmark_cases": "A.K. Gopalan (1950), Bandhua Mukti Morcha (1984), Sunil Batra (1980)",
        "key_doctrines": ["Heart and Soul of the Constitution", "Public Interest Litigation (PIL)", "Writ Jurisdiction"],
        "tags": ["writs", "habeas_corpus", "mandamus", "supreme_court", "pil", "article32"]
    },
    {
        "article_number": "39A",
        "part_id": "part4",
        "part_label": "Part IV: Directive Principles",
        "title_en": "Article 39A: Equal Justice and Free Legal Aid",
        "title_hi": "अनुच्छेद ३९-क: समान न्याय और निःशुल्क विधिक सहायता",
        "full_text_en": "The State shall secure that the operation of the legal system promotes justice, on a basis of equal opportunity, and shall, in particular, provide free legal aid, by suitable legislation or schemes or in any other way, to ensure that opportunities for securing justice are not denied to any citizen by reason of economic or other disabilities.",
        "full_text_hi": "राज्य यह सुनिश्चित करेगा कि विधिक तंत्र इस प्रकार काम करे कि समान अवसर के आधार पर न्याय सुलभ हो और वह विशेषतया निःशुल्क विधिक सहायता की व्यवस्था करेगा ताकि कोई भी नागरिक आर्थिक या अन्य निरर्हताओं के कारण न्याय पाने से वंचित न रहे।",
        "landmark_cases": "Hussainara Khatoon v. Home Secretary, State of Bihar (1979), Khatri (II) v. State of Bihar (1981)",
        "key_doctrines": ["Access to Justice", "State-Funded Legal Aid", "Legal Services Authorities Act"],
        "tags": ["legal_aid", "equal_justice", "dpsp", "article39a"]
    },
    {
        "article_number": "44",
        "part_id": "part4",
        "part_label": "Part IV: Directive Principles",
        "title_en": "Article 44: Uniform Civil Code for the Citizens",
        "title_hi": "अनुच्छेद ४४: नागरिकों के लिए एक समान नागरिक संहिता (UCC)",
        "full_text_en": "The State shall endeavour to secure for the citizens a uniform civil code throughout the territory of India.",
        "full_text_hi": "राज्य, भारत के समस्त राज्यक्षेत्र में नागरिकों के लिए एक समान नागरिक संहिता (Uniform Civil Code) प्राप्त कराने का प्रयास करेगा।",
        "landmark_cases": "Mohd. Ahmed Khan v. Shah Bano Begum (1985), Sarla Mudgal v. Union of India (1995), Shayara Bano v. Union of India (2017)",
        "key_doctrines": ["Uniform Civil Code", "Gender Justice in Personal Laws", "Secular Civil Laws"],
        "tags": ["ucc", "civil_code", "family_law", "personal_law", "article44"]
    },
    {
        "article_number": "50",
        "part_id": "part4",
        "part_label": "Part IV: Directive Principles",
        "title_en": "Article 50: Separation of Judiciary from Executive",
        "title_hi": "अनुच्छेद ५०: कार्यपालिका से न्यायपालिका का पृथक्करण",
        "full_text_en": "The State shall take steps to separate the judiciary from the executive in the public services of the State.",
        "full_text_hi": "राज्य की लोक सेवाओं में, न्यायपालिका को कार्यपालिका से पृथक करने के लिए राज्य कदम उठाएगा।",
        "landmark_cases": "Supreme Court Advocates-on-Record Association v. Union of India (Second Judges Case, 1993), NJAC Judgment (2015)",
        "key_doctrines": ["Judicial Independence", "Separation of Powers"],
        "tags": ["judiciary", "executive", "separation_of_powers", "article50"]
    },
    {
        "article_number": "51A",
        "part_id": "part4a",
        "part_label": "Part IV-A: Fundamental Duties",
        "title_en": "Article 51A: Fundamental Duties of Every Indian Citizen",
        "title_hi": "अनुच्छेद ५१-क: प्रत्येक भारतीय नागरिक के मौलिक कर्तव्य",
        "full_text_en": "It shall be the duty of every citizen of India to abide by the Constitution, cherish noble ideals of freedom struggle, protect sovereignty and integrity, defend the nation, promote harmony and renounce practices derogatory to women, safeguard public property, and develop scientific temper.",
        "full_text_hi": "भारत के प्रत्येक नागरिक का यह कर्तव्य होगा कि वह संविधान का पालन करे, स्वतंत्रता के राष्ट्रीय आंदोलन को प्रेरित करने वाले उच्च आदर्शों को संजोए रखे, भारत की संप्रभुता, एकता और अखंडता की रक्षा करे, महिलाओं के सम्मान के विरुद्ध प्रथाओं का त्याग करे और वैज्ञानिक दृष्टिकोण अपनाए।",
        "landmark_cases": "AIIMS Students Union v. AIIMS (2002), M.C. Mehta v. Union of India (1988)",
        "key_doctrines": ["Civic Responsibility", "Environmental Stewardship"],
        "tags": ["duties", "citizenship", "integrity", "article51a"]
    },
    {
        "article_number": "136",
        "part_id": "part5",
        "part_label": "Part V: Union Judiciary",
        "title_en": "Article 136: Special Leave to Appeal by the Supreme Court (SLP)",
        "title_hi": "अनुच्छेद १३६: अपील के लिए उच्चतम न्यायालय की विशेष इजाजत (विशेष अनुमति याचिका - SLP)",
        "full_text_en": "Notwithstanding anything in this Chapter, the Supreme Court may, in its discretion, grant special leave to appeal from any judgment, decree, determination, sentence or order in any cause or matter passed or made by any court or tribunal in the territory of India.",
        "full_text_hi": "उच्चतम न्यायालय अपने विवेकानुसार, भारत के राज्यक्षेत्र में किसी न्यायालय या अधिकरण द्वारा किसी वाद या मामले में पारित किए गए किसी निर्णय, डिक्री, अवधारण, दंडादेश या आदेश के विरुद्ध अपील के लिए विशेष इजाजत दे सकेगा।",
        "landmark_cases": "Dhakeswari Cotton Mills (1955), Kunhayammed v. State of Kerala (2000)",
        "key_doctrines": ["Extraordinary Plenary Jurisdiction", "Substantial Injustice Rectification"],
        "tags": ["slp", "supreme_court", "appeal", "tribunals", "article136"]
    },
    {
        "article_number": "142",
        "part_id": "part5",
        "part_label": "Part V: Union Judiciary",
        "title_en": "Article 142: Enforcement of Decrees and Orders of Supreme Court and Doing Complete Justice",
        "title_hi": "अनुच्छेद १४२: उच्चतम न्यायालय की डिक्रियों और आदेशों का प्रवर्तन तथा पूर्ण न्याय की शक्ति",
        "full_text_en": "The Supreme Court in the exercise of its jurisdiction may pass such decree or make such order as is necessary for doing complete justice in any cause or matter pending before it, and any decree so passed or order so made shall be enforceable throughout the territory of India.",
        "full_text_hi": "उच्चतम न्यायालय अपनी अधिकारिता का प्रयोग करते हुए ऐसा आदेश या डिक्री पारित कर सकेगा जो उसके समक्ष लंबित किसी वाद या विषय में 'पूर्ण न्याय' (Complete Justice) करने के लिए आवश्यक हो, और वह आदेश पूरे भारत में लागू होगा।",
        "landmark_cases": "Union Carbide Corporation v. Union of India (Bhopal Gas Tragedy, 1991), Ayodhya Dispute (2019), Shilpa Sailesh (2023)",
        "key_doctrines": ["Complete Justice Doctrine", "Inherent Constitutional Equity"],
        "tags": ["complete_justice", "supreme_court", "decree", "article142"]
    },
    {
        "article_number": "226",
        "part_id": "part6",
        "part_label": "Part VI: High Courts",
        "title_en": "Article 226: Power of High Courts to Issue Certain Writs",
        "title_hi": "अनुच्छेद २२६: कुछ रिट निकालने की उच्च न्यायालयों (High Courts) की शक्ति",
        "full_text_en": "Notwithstanding anything in Article 32, every High Court shall have powers to issue to any person or authority directions, orders or writs for the enforcement of any of the rights conferred by Part III and for any other purpose. Wider in scope than Article 32 as it covers non-fundamental legal rights.",
        "full_text_hi": "अनुच्छेद ३२ में किसी बात के होते हुए भी, प्रत्येक उच्च न्यायालय को उस राज्यक्षेत्र में किसी भी व्यक्ति या प्राधिकारी को मौलिक अधिकारों के प्रवर्तन हेतु तथा 'किसी अन्य प्रयोजन' (Any Other Purpose) के लिए रिट जारी करने की शक्ति होगी। इसका दायरा अनुच्छेद ३२ से भी अधिक व्यापक है।",
        "landmark_cases": "L. Chandra Kumar v. Union of India (1997), Whirlpool Corporation v. Registrar of Trade Marks (1998)",
        "key_doctrines": ["Judicial Review as Basic Structure", "Alternative Remedy Doctrine", "Extraordinary Writ Jurisdiction"],
        "tags": ["high_court", "writs", "judicial_review", "stay_order", "article226"]
    },
    {
        "article_number": "300A",
        "part_id": "part3",
        "part_label": "Part XII: Property Rights",
        "title_en": "Article 300A: Persons not to be deprived of property save by authority of law",
        "title_hi": "अनुच्छेद ३००-क: विधि के प्राधिकार के बिना व्यक्तियों को संपत्ति से वंचित न किया जाना",
        "full_text_en": "No person shall be deprived of his property save by authority of law. Substituted from Fundamental Right (Article 31) to Constitutional/Human Right via 44th Constitutional Amendment Act, 1978.",
        "full_text_hi": "किसी व्यक्ति को उसकी संपत्ति से विधि के प्राधिकार के बिना वंचित नहीं किया जाएगा। ४४वें संशोधन (१९७८) द्वारा इसे मौलिक अधिकार से बदलकर एक विधिक व मानवाधिकार का दर्जा दिया गया।",
        "landmark_cases": "K.T. Plantation Pvt. Ltd. v. State of Karnataka (2011), Vidya Devi v. State of Himachal Pradesh (2020)",
        "key_doctrines": ["Eminent Domain", "Right to Compensation", "Rule Against Illegal Expropriation"],
        "tags": ["property", "compensation", "land_acquisition", "article300a"]
    },
    {
        "article_number": "368",
        "part_id": "part20",
        "part_label": "Part XX: Amendment",
        "title_en": "Article 368: Power of Parliament to Amend the Constitution and Procedure Therefor",
        "title_hi": "अनुच्छेद ३६८: संविधान का संशोधन करने की संसद की शक्ति और उसके लिए प्रक्रिया",
        "full_text_en": "Parliament may in exercise of its constituent power amend by way of addition, variation or repeal any provision of this Constitution in accordance with the procedure laid down in this article. However, Parliament cannot alter the Basic Structure of the Constitution.",
        "full_text_hi": "संसद अपनी संविधायी शक्ति का प्रयोग करते हुए इस अनुच्छेद में अधिकथित प्रक्रिया के अनुसार इस संविधान के किसी उपबंध का परिवर्तन, परिवर्धन या निरसन कर सकेगी। किंतु संसद संविधान के 'मूल ढांचे' (Basic Structure) को नष्ट या संशोधित नहीं कर सकती।",
        "landmark_cases": "Shankari Prasad (1951), Golak Nath (1967), Kesavananda Bharati (1973), Indira Nehru Gandhi (1975)",
        "key_doctrines": ["Constituent Power vs Legislative Power", "Basic Structure Limitation"],
        "tags": ["amendment", "parliament", "basic_structure", "article368"]
    }
]
