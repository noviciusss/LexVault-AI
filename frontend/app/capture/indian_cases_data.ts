export interface IndianLegalTemplate {
  id: string;
  category: string;
  title: string;
  practice_area: string;
  language: "eng" | "hin";
  badge: string;
  summary: string;
  content: string;
}

export const INDIAN_LEGAL_TEMPLATES: IndianLegalTemplate[] = [
  {
    id: "bns_64",
    category: "Criminal Law & BNS",
    title: "दांडिक विचारण परामर्श — धारा ६४ बीएनएस (पूर्ववर्ती धारा ३७६ भा.दं.वि.)",
    practice_area: "Criminal Law & BNS/IPC",
    language: "hin",
    badge: "BNS 64 / IPC 376",
    summary: "Consent vs Deceitful Promise of Marriage defense in Sessions Court Thane with BSA 61 digital records.",
    content: `दांडिक विचारण परामर्श — धारा ६४ बीएनएस (पूर्ववर्ती धारा ३७६ भा.दं.वि.)
सत्र न्यायालय: मुंबई नगर दीवानी एवं सत्र न्यायालय | वाद संख्या: २०२५-एससी-११८
अभियुक्त: श्री निखिल सावंत
आरोप: भारतीय न्याय संहिता, २०२३ की धारा ६४ (बलात्कार) एवं धारा ६९ (विवाह के मिथ्या वादे पर संबंध)।

तथ्य एवं विधिक रणनीति: 
१. शिकायतकर्ता बालिग (२८ वर्ष) एवं बहुराष्ट्रीय कंपनी में कार्यरत वरिष्ठ प्रबंधक हैं।
२. दोनों पक्षकार विगत ३ वर्षों से स्वेच्छा से लिव-इन रिलेशनशिप में निवास कर रहे थे।
३. सर्वोच्च न्यायालय के ऐतिहासिक निर्णय 'अनुराग सोनी बनाम छत्तीसगढ़ राज्य (२०१९)' तथा 'प्रमोद सूर्यभान पवार (२०१९)' के अनुसार, विवाह का वादा आरंभ से ही कपटपूर्ण होने पर ही बीएनएस धारा ६९ लागू होती है; पश्चात्वर्ती परिस्थितियों के कारण विवाह न हो पाना बलात्कार नहीं है।

डिजिटल साक्ष्य: 
व्हाट्सएप संदेश, यात्रा आरक्षण एवं संयुक्त बैंक लेन-देन को भारतीय साक्ष्य अधिनियम, २०२३ (BSA) की धारा ६१ के प्रमाण-पत्र सहित दाखिल किया गया है।
अधिवक्ता: रोहित कुलकर्णी, एडवोकेट, बॉम्बे हाई कोर्ट।`,
  },
  {
    id: "ibc_sec9",
    category: "Insolvency & Corporate",
    title: "NCLT Mumbai Section 9 IBC Pre-Existing Dispute Defense",
    practice_area: "Corporate Insolvency & IBC",
    language: "eng",
    badge: "IBC Section 9",
    summary: "Pre-existing dispute defense against operational creditor CIRP under the Mobilox Innovations doctrine.",
    content: `NCLT Corporate Insolvency Note — Section 9 IBC 2016
Forum: National Company Law Tribunal (NCLT), Mumbai Bench IV
Matter: Kalpataru Engineering Ltd v. Metalfab Industries India Pvt Ltd
Claim Amount: ₹4,82,50,000 (Operational Debt)

Strategic Defense Summary:
1. Operational Creditor issued Section 8 Demand Notice on 12-08-2024 alleging unpaid invoices for structural TMT steel rebar supplies.
2. In defense, Corporate Debtor established pre-existing disputes documented via contemporaneous email correspondence dated 45 and 60 days prior to the Section 8 notice.
3. Third-party metallurgy laboratory test reports (National Test House, Mumbai) demonstrated tensile failure and severe grade deviations below IS 1786 specifications.
4. Mobilox Innovations Doctrine (SC): Supreme Court settled that NCLT exercising summary jurisdiction under Section 9 does not adjudicate the merits or quantum of dispute. Once a plausible, genuine pre-existing dispute is demonstrated, Section 9 CIRP petition must be dismissed in limine.
Lead Counsel: Adv. Meera Rao, Chandra & Rao Associates, Mumbai.`,
  },
  {
    id: "contract_sec27",
    category: "Commercial & Contracts",
    title: "Section 27 Indian Contract Act — IT Employee Post-Termination Non-Compete Injunction Defense",
    practice_area: "Indian Contract Act & Commercial",
    language: "eng",
    badge: "Contract Act Sec 27",
    summary: "Defense against ex-employer's post-employment 24-month non-compete restraint in software industry.",
    content: `High Court Commercial Dispute Note — Post-Employment Restrictive Covenants
Court: High Court of Judicature at Bombay (Commercial Division)
Suit: HexaTech Solutions Ltd v. Siddharth Deshmukh & FinNext Technologies

Core Legal Position:
1. Former employer filed commercial suit seeking permanent injunction restraining defendant senior cloud architect from joining competitor, citing Clause 14.2 of Employment Agreement (24-month pan-India non-compete).
2. Defense established under Section 27 of the Indian Contract Act, 1872: 'Every agreement by which anyone is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.'
3. Landmark Precedents:
   - Supreme Court in Percept D'Mark (India) (P) Ltd v. Zaheer Khan (2006): Held unequivocally that doctrine of restraint of trade applies to all post-contractual covenants; negative covenants operating after cessation of employment are void ab initio.
   - Niranjan Shankar Golikari (1967): Distinguishes restrictions during currency of employment from post-termination restraints.
4. Relief Granted: Injunction refused; defendant allowed to continue employment subject to confidentiality of proprietary source code.
Counsel: Adv. Rohit Kulkarni.`,
  },
  {
    id: "const_art226",
    category: "Constitutional & Writs",
    title: "Article 226 Writ Petition — Arbitrary State Tender Blacklisting (Audi Alteram Partem)",
    practice_area: "Constitutional Law & Fundamental Rights",
    language: "eng",
    badge: "Art. 226 / 14",
    summary: "High Court writ quashing state department blacklisting order passed without show-cause notice.",
    content: `Constitutional Writ Petition under Article 226 of the Constitution of India
Court: High Court of Delhi (Writ Jurisdiction)
Petitioner: Vikram Malhotra Infrastructure Pvt Ltd v. National Highway Authority of India & Union of India

Grounds of Challenge:
1. Arbitrary 3-year debarment/blacklisting order passed on 14-04-2024 without issuing prior show-cause notice or affording oral hearing.
2. Infringement of Article 14 (Equality & Non-Arbitrariness) and Article 19(1)(g) (Right to practice lawful trade/business).
3. Landmark Precedents:
   - Erusian Equipment & Chemicals v. State of West Bengal (1975 SC): Blacklisting has civil death consequences for a commercial enterprise; prior hearing is an inflexible constitutional requirement of natural justice.
   - UMC Technologies v. FCI (2021 SC): Show-cause notice must explicitly state the proposed penalty of blacklisting to enable an effective defense.
4. Prayer: Writ of Certiorari quashing blacklisting order; Mandamus restoring tender bidding eligibility.
Drafting Counsel: Adv. Priya Narayanan, Managing Partner, NyayaVault India.`,
  },
  {
    id: "cpc_order39",
    category: "Civil Litigation (CPC)",
    title: "Order 39 Rules 1 & 2 CPC — Ex-Parte Ad-Interim Trademark Infringement Injunction",
    practice_area: "Civil Procedure (CPC)",
    language: "eng",
    badge: "CPC Order 39",
    summary: "Urgent ex-parte interim injunction application in pharmaceutical trademark passing off suit.",
    content: `Commercial Court Interlocutory Application under Order XXXIX Rules 1 & 2 read with Section 151 CPC
Court: City Civil Court / Commercial Court, Ahmedabad
Matter: Zydus Healthcare Ltd v. Zenon Pharma Lifesciences

Case Strategy & Triple Test:
1. Plaintiff manufactures anti-diabetic formulation 'GLUCONORM' registered under Class 5 since 2004. Defendant launched identical drug under phonetically identical mark 'GLUKONORM-D'.
2. Satisfaction of Three-Pronged Legal Test:
   a. Strong Prima Facie Case: Registered trademark under Trade Marks Act 1999; likelihood of confusion among public.
   b. Balance of Convenience: Tilted heavily in favour of plaintiff who has invested ₹85 Cr in brand reputation.
   c. Irreparable Injury: Misbranding of schedule G pharmaceuticals endangers patient health and causes unquantifiable damage.
3. Relevant Authority: Cadila Health Care Ltd v. Cadila Pharmaceuticals (2001 SC) — stricter standards of phonetic and visual similarity apply to medicinal products.
4. Outcome: Ex-parte ad-interim injunction granted with Local Commissioner appointed under Order XXVI Rule 9 CPC to seize infringing packaging.`,
  },
  {
    id: "ni_sec138",
    category: "Banking & Negotiable Instruments",
    title: "Section 138 NI Act — Cheque Dishonour Statutory Notice & Rebuttal of Presumption",
    practice_area: "Commercial Litigation & Civil",
    language: "eng",
    badge: "NI Act Sec 138",
    summary: "Strategic rebuttal of Section 139 presumption by establishing cheques were issued as security.",
    content: `Criminal Complaint Strategy under Section 138 Negotiable Instruments Act, 1881
Forum: Metropolitan Magistrate (Special NI Court), Patiala House, New Delhi
Matter: Apex Finlease Ltd v. Rajesh Chawla & R.K. Exports

Factual Matrix & Defense Blueprint:
1. Complainant initiated proceedings upon dishonour of two cheques totaling ₹75,00,000 for reason 'Funds Insufficient'.
2. Defense establishes that cheques were undated security cheques handed over in 2021 at the time of executing loan sanction, which complainant fraudulently filled in 2024 after loan was unilaterally rescheduled.
3. Statutory Rebuttal Strategy under Section 139 NI Act:
   - Basalingappa v. Mudibasappa (2019 SC): Accused is not required to prove defense beyond reasonable doubt; preponderance of probabilities is sufficient to displace Section 139 statutory presumption.
   - Cross-examination focused on absence of balance confirmation letters and failure to produce audited ledgers.
4. Outcome: Accused discharged as complainant failed to establish legally enforceable debt subsisting on date of encashment.`,
  },
  {
    id: "bns_sec85_498a",
    category: "Matrimonial & Criminal",
    title: "BNS 85 / IPC 498A & BNSS 482 — Anticipatory Bail & Arnesh Kumar Safeguards",
    practice_area: "Criminal Law & BNS/IPC",
    language: "hin",
    badge: "BNS 85 / BNSS 482",
    summary: "Anticipatory bail memo in matrimonial cruelty dispute applying Arnesh Kumar mandatory guidelines.",
    content: `अग्रिम जमानत आवेदन — धारा ४८२ भारतीय नागरिक सुरक्षा संहिता, २०२३ (पूर्ववर्ती धारा ४३८ दंड प्रक्रिया संहिता)
न्यायालय: प्रधान जिला एवं सत्र न्यायाधीश, रोहिणी कोर्ट, नई दिल्ली।
आवेदक: श्रीमती सुमित्रा देवी एवं श्री सुरेश अग्रवाल (वृद्ध सास-ससुर)
प्राथमिकी संख्या: २०२५-एफआईआर-३४ (थाना मॉडल टाउन)
आरोप: भारतीय न्याय संहिता, २०२३ की धारा ८५ (पति या रिश्तेदार द्वारा क्रूरता) एवं धारा ११५ (स्वेच्छा से चोट पहुंचाना)।

विधिक आधार एवं बचाव रणनीति:
१. शिकायतकर्ता बहू द्वारा दर्ज प्राथमिकी में आवेदकों के विरुद्ध कोई विशिष्ट तारीख या भूमिका का उल्लेख नहीं है; आरोप सर्वसमावेशी एवं सामान्य (Omnibus) प्रकृति के हैं।
२. सर्वोच्च न्यायालय के मार्गदर्शक निर्णय 'अर्णेश कुमार बनाम बिहार राज्य (२०१४)' तथा 'गीता मेहरोत्रा (२०१२)' के अनुसार, ७ वर्ष से कम कारावास के मामलों में अनावश्यक गिरफ्तारी पर प्रतिबंध है तथा बीएनएसएस धारा ३५(३) का नोटिस तामील करना अनिवार्य है।
३. आवेदक ७२ वर्षीय वरिष्ठ नागरिक हैं तथा गंभीर हृदय रोग से पीड़ित हैं।
४. न्यायालय ने अंतरिम राहत प्रदान करते हुए जांच में सहयोग की शर्त पर अग्रिम जमानत स्वीकृत की।
अधिवक्ता: अर्जुन शर्मा, एडवोकेट, दिल्ली।`,
  },
  {
    id: "hma_sec13b",
    category: "Family & Personal Law",
    title: "Section 13B(2) Hindu Marriage Act — Waiver of 6-Month Cooling-Off Period",
    practice_area: "Family Law & Personal Law",
    language: "eng",
    badge: "HMA Sec 13B(2)",
    summary: "Joint petition waiving statutory 6-month cooling-off period under the Amardeep Singh ratio.",
    content: `Family Court Joint Application for Waiver of 6-Month Cooling-Off Period
Court: Principal Judge, Family Court, Bandra, Mumbai
Parties: Rohan Singhania and Ananya Singhania (nee Deshmukh)
Marriage Date: 12-02-2020 | Date of Separation: 15-08-2022 (Over 3.5 years separation)

Statutory Waiver Principles:
1. Parties filed First Motion petition under Section 13B(1) of Hindu Marriage Act, 1955 for dissolution by mutual consent.
2. Simultaneous application filed seeking waiver of the 6-month statutory waiting period prescribed under Section 13B(2).
3. Supreme Court Doctrine in Amardeep Singh v. Mukesh Kumar (2017 SC):
   - Held that the 6-month period is directory and not mandatory.
   - Family Courts possess discretion to waive the cooling period if:
     a. Parties have lived apart for over one year.
     b. All mediation and conciliation efforts have genuinely failed.
     c. All claims regarding permanent alimony, child custody, and Stridhan have been fully resolved.
4. Since ₹1.5 Cr permanent alimony was already deposited in escrow, Family Court waived the period and recorded Second Motion on Day 7.`,
  },
  {
    id: "tpa_sec54",
    category: "Real Estate & Property",
    title: "Section 54 Transfer of Property Act — GPA Sale Invalidation Defense (Suraj Lamp)",
    practice_area: "Transfer of Property & Real Estate",
    language: "eng",
    badge: "TPA Sec 54 / Suraj Lamp",
    summary: "Property title defense establishing that GPA / Agreement to Sell conveys no ownership rights.",
    content: `Civil Property Defense — Title Challenge under Section 54 Transfer of Property Act, 1882
Court: Civil Judge Senior Division, Pune
Matter: Kothari Builders LLP v. Chandrakant Gokhale

Substantive Defense Summary:
1. Plaintiff filed suit for declaration and possession asserting ownership over 4.2 acres of prime suburban land on the strength of an unregistered Agreement to Sell, General Power of Attorney (GPA), and Will dated 2011.
2. Defense demonstrated:
   - Section 54 TPA: 'A contract for the sale of immovable property does not, of itself, create any interest in or charge on such property.' Sale can only be effected by registered instrument.
   - Section 17 & 49 of Registration Act, 1908: Non-registration of conveyance renders title null in law.
3. Landmark Precedent: Supreme Court in Suraj Lamp & Industries (P) Ltd v. State of Haryana (2012 SC) explicitly held that SA/GPA/WILL transactions do not convey any title or constitute transfer of immovable property.
4. Outcome: Plaintiff's suit for title declaration dismissed; defendant's registered ownership protected.`,
  },
  {
    id: "bns_sec318_quash",
    category: "Criminal & Commercial",
    title: "BNS 318(4) / IPC 420 & BNSS 528 — Quashing Criminal FIR in Pure Commercial Breach",
    practice_area: "Criminal Law & BNS/IPC",
    language: "eng",
    badge: "BNS 318 / BNSS 528",
    summary: "Section 528 BNSS petition quashing criminal cheating FIR registered for supply contract delay.",
    content: `Criminal Miscellaneous Petition under Section 528 Bharatiya Nagarik Suraksha Sanhita, 2023 (formerly Section 482 CrPC)
Court: High Court of Judicature at Bombay
Petitioner: Arvind Global Logistics Pvt Ltd & Directors v. State of Maharashtra & Radiant Textiles Ltd

Core Propositions for Quashing:
1. Respondent filed FIR under Section 318(4) BNS (Cheating and dishonestly inducing delivery of property — legacy IPC 420) alleging failure to deliver export yarn consignments on agreed date.
2. Settled Jurisprudence:
   - Supreme Court in Indian Oil Corporation v. NEPC India Ltd (2006): Deprecated growing tendency in business circles to convert civil disputes into criminal complaints to exert undue pressure.
   - State of Haryana v. Bhajan Lal (1992): FIR must be quashed where allegations taken at face value do not disclose commission of any cognizable offense.
3. Crucial Element: In cheating, dishonest intention must exist at the inception of the contract. Subsequent failure to perform is a civil breach remediable in damages, not a criminal fraud.
4. Result: High Court allowed petition and quashed FIR No. 289/2024 in its entirety with ₹50,000 costs on complainant.`,
  },
  {
    id: "arb_sec9",
    category: "Arbitration & ADR",
    title: "Section 9 Arbitration Act — Interim Injunction Restraining Invocation of Bank Guarantee",
    practice_area: "Arbitration & ADR",
    language: "eng",
    badge: "Arbitration Sec 9",
    summary: "Commercial court injunction preventing encashment of unconditional performance bank guarantee.",
    content: `Commercial Arbitration Petition under Section 9 of Arbitration and Conciliation Act, 1996
Court: High Court of Delhi (Commercial Division)
Petitioner: Larsen & Toubro Heavy Engineering v. Solar Energy Corporation of India (SECI)

Legal Grounds for Restraining Encashment:
1. Respondent issued notice to encash unconditional Bank Guarantee of ₹32,00,000/- citing delay in commissioning phase.
2. Injunction granted on established exceptions to unconditional bank guarantees:
   a. Egregious Fraud: Proven that SECI had already granted 180-day extension of time due to force majeure grid availability.
   b. Irretrievable Injustice / Special Equities: Encashment would cause catastrophic bankruptcy and blacklisting before arbitral tribunal can be constituted under Section 11.
3. Precedent Cited:
   - UP State Sugar Corporation v. Sumac International (1997 SC): General rule of non-interference with bank guarantee yields when fraud or irretrievable injustice of the most exceptional kind is demonstrated.
4. Order: Status quo granted directing issuing bank not to remit funds pending constitution of 3-member arbitral panel.`,
  },
  {
    id: "consumer_rera",
    category: "Consumer & Real Estate",
    title: "Section 35 Consumer Protection Act 2019 — Real Estate Delayed Possession Refund Plaint",
    practice_area: "Commercial Litigation & Civil",
    language: "eng",
    badge: "Consumer Act Sec 35",
    summary: "Consumer complaint against builder for 5-year possession delay seeking full refund with 9% interest.",
    content: `Original Consumer Complaint under Section 35 Consumer Protection Act, 2019
Forum: National Consumer Disputes Redressal Commission (NCDRC), New Delhi
Complainants: Aniket Sengupta & Smita Sengupta v. Marvel MegaRealty Developers Ltd

Facts & Strategic Reliefs:
1. Complainants booked 3BHK flat in 'Imperial Heights', Gurugram in 2018 for total consideration of ₹1.85 Cr. Builder promised possession by June 2021 with 6-month grace period.
2. Till date (2026), occupation certificate has not been procured and site is only 65% complete.
3. Landmark Precedents:
   - Pioneer Urban Land & Infrastructure v. Govindan Raghavan (2019 SC): A flat buyer cannot be made to wait indefinitely for possession and is entitled to seek full refund with interest.
   - Wg. Cdr. Arifur Rahman Khan (2020 SC): Unilateral one-sided clauses in builder-buyer agreements constitute unfair trade practice under Section 2(47) CPA 2019.
4. Relieved Granted: NCDRC directed full refund of ₹1.68 Cr deposited amount along with 9% per annum interest and ₹1,50,000 litigation costs.`,
  },
  {
    id: "sarfaesi_sec17",
    category: "Banking & Recovery",
    title: "Section 17 SARFAESI Act Securitisation Application before DRT against Physical Possession",
    practice_area: "Commercial Litigation & Civil",
    language: "eng",
    badge: "SARFAESI Sec 17",
    summary: "Debts Recovery Tribunal SA challenging bank's Section 13(4) measures and Section 14 possession order.",
    content: `Securitisation Application under Section 17(1) of SARFAESI Act, 2002
Forum: Debts Recovery Tribunal (DRT-I), Mumbai
Applicant: Sharda Spinning Mills Ltd v. State Bank of India & Court Receiver

Statutory Grounds:
1. Respondent bank classified account as NPA on 31-03-2024 and issued Section 13(2) Demand Notice claiming ₹24.5 Cr.
2. Applicant submitted detailed representations and objections under Section 13(3A) pointing out calculation errors in interest compounding.
3. Bank failed to communicate reasoned reply within mandatory 15-day window under Section 13(3A), yet proceeded to obtain Section 14 Chief Metropolitan Magistrate order for taking physical possession.
4. Ratio in Mardia Chemicals v. Union of India (2004 SC): Consideration of borrower's objections under Section 13(3A) is a mandatory statutory safeguard. Failure to deal with objections renders subsequent Section 13(4) measures void.
5. DRT granted stay on physical taking of possession subject to deposit of 10% within 4 weeks.`,
  },
  {
    id: "bsa_sec61",
    category: "Evidence & Digital Forensics",
    title: "Section 61 Bharatiya Sakshya Adhiniyam (BSA) / Section 65B IEA — Electronic Record Certificate",
    practice_area: "Civil Procedure (CPC)",
    language: "eng",
    badge: "BSA 61 / IEA 65B",
    summary: "Statutory electronic certificate for admissibility of WhatsApp chats, server logs, and digital invoices.",
    content: `STATUTORY CERTIFICATE UNDER SECTION 61(2) OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023 (BSA)
(Formerly Section 65B of Indian Evidence Act, 1872)

Court: High Court of Delhi (Commercial Suit)
In the matter of: Infotech Logistics v. Dynamic E-Commerce Ltd

I, Adv. Karan Mehta, acting as Chief Compliance Officer & Digital Custodian, do hereby certify:
1. That the electronic records consisting of WhatsApp chat exports (Annexure P-4 to P-9), AWS server database logs, and digital PDF invoices dated 01-08-2024 to 30-10-2024 were produced by computer systems regularly operated by plaintiff during ordinary course of business.
2. That during said period, computers and database servers were operating properly without any interference or unauthorized data modification.
3. SHA-256 Hash Verification: The exported digital records have cryptographic hash 8f9b4a2c1e... ensuring zero bit tampering.
4. Ratio: Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020 SC) — compliance with statutory certificate is a condition precedent for admissibility of secondary digital evidence.`,
  },
  {
    id: "hindi_nda",
    category: "Bilingual / Hindi Corporate",
    title: "गैर-प्रकटीकरण एवं गोपनीयता समझौता (Non-Disclosure Agreement in Hindi)",
    practice_area: "Indian Contract Act & Commercial",
    language: "hin",
    badge: "हिन्दी NDA धारा २७",
    summary: "Devanagari Hindi legal agreement with trade secret protection and Section 27 validity parameters.",
    content: `गैर-प्रकटीकरण एवं गोपनीयता समझौता (NON-DISCLOSURE AGREEMENT)
यह विलेख श्री राजेश शर्मा ('प्रकटीकरणकर्ता') तथा मेसर्स भारत लीगल सॉल्यूशंस प्राइवेट लिमिटेड ('प्राप्तकर्ता') के मध्य निष्पादित हुआ।
वाद संदर्भ संख्या: २०२४-एचसी-४१२ (दिल्ली उच्च न्यायालय)

खंड ३.१ - व्यापारिक गोपनीयता एवं नॉन-कम्पीट प्रतिबंध:
१. प्राप्तकर्ता संस्था यह वचन देती है कि समझौते की समाप्ति के उपरांत २४ माह की अवधि तक समान प्रतिस्पर्धी व्यापार में संलग्न नहीं होगी।
२. भारतीय अनुबंध अधिनियम, १८७२ (Indian Contract Act, 1872) की धारा २७ के दृष्टिगत, उचित भौगोलिक सीमा के बिना पूर्ण व्यापार प्रतिबंध अमान्य माना जाएगा।
३. हर्जाना खंड: किसी भी अनाधिकृत प्रकटीकरण पर १०,००,००० रुपये का पूर्व-निर्धारित क्षतिपूर्ति हर्जाना (Liquidated Damages) देय होगा।
४. अधिकार क्षेत्र: इस समझौते से उत्पन्न किसी भी विवाद का निपटारा नई दिल्ली स्थित वाणिज्यिक न्यायालयों के अनन्य क्षेत्राधिकार में होगा।

हस्ताक्षरकर्ता एवं अधिवक्ता: श्री अमित वर्मा, एडवोकेट, कड़कड़डूमा कोर्ट, नई दिल्ली।`,
  },
];
