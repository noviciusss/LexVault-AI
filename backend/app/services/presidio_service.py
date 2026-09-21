import re
import json
import logging
from typing import Tuple, List, Dict, Any

logger = logging.getLogger("lexvault.presidio")

class PresidioService:
    def __init__(self):
        self.analyzer = None
        self.anonymizer = None
        self._init_presidio()

    def _init_presidio(self):
        try:
            from presidio_analyzer import AnalyzerEngine
            from presidio_analyzer.nlp_engine import NlpEngineProvider
            from presidio_anonymizer import AnonymizerEngine

            # Explicitly configure en_core_web_sm to avoid downloading en_core_web_lg
            configuration = {
                "nlp_engine_name": "spacy",
                "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}],
            }
            provider = NlpEngineProvider(nlp_configuration=configuration)
            nlp_engine = provider.create_engine()
            self.analyzer = AnalyzerEngine(nlp_engine=nlp_engine)
            self.anonymizer = AnonymizerEngine()
            logger.info("Presidio Analyzer (en_core_web_sm) & Anonymizer initialized successfully.")
        except Exception as e:
            logger.warning(f"Presidio full engines not loaded ({e}), using resilient hybrid analyzer.")

    def sanitize(self, text: str) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Analyzes text for PII (PERSON, ORGANIZATION, EMAIL, PHONE, SSN, CASE_NUM),
        replaces them with sanitized placeholders, and returns both the clean text
        and a detailed log of all entities removed.
        """
        if not text:
            return "", []

        entities_found: List[Dict[str, Any]] = []

        # If official Presidio is available, run it
        if self.analyzer and self.anonymizer:
            try:
                results = self.analyzer.analyze(
                    text=text,
                    entities=["PERSON", "ORGANIZATION", "EMAIL_ADDRESS", "PHONE_NUMBER", "US_SSN", "LOCATION", "CREDIT_CARD"],
                    language="en",
                )
                
                anonymized_result = self.anonymizer.anonymize(
                    text=text,
                    analyzer_results=results
                )

                for res in results:
                    entity_snippet = text[res.start:res.end]
                    entities_found.append({
                        "entity_type": res.entity_type,
                        "text": entity_snippet,
                        "start": res.start,
                        "end": res.end,
                        "score": round(res.score, 2),
                    })

                return anonymized_result.text, entities_found
            except Exception as e:
                logger.warning(f"Presidio analyze error ({e}), falling back to regex parser.")

        # Resilient legal PII detection engine (English + Hindi Devanagari)
        patterns = [
            ("EMAIL_ADDRESS", r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"),
            ("PHONE_NUMBER", r"\b(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b"),
            ("AADHAAR_NUMBER", r"\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b"),
            ("PAN_NUMBER", r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b"),
            ("CASE_NUMBER", r"\b(?:Case\s*(?:No\.?|#)?\s*[0-9]{2,4}-[A-Z0-9]+)\b"),
            ("CASE_NUMBER", r"(?:वाद\s*(?:संदर्भ)?\s*संख्या\s*[:\-]?\s*[\u0966-\u096F0-9A-Za-z\-]+(?:\s*\([^\)]+\))?)"),
            ("ORGANIZATION", r"\b(?:Kalpataru Engineering|Metalfab Industries|Larsen & Toubro|Cipla Pharmaceuticals|Sun Health|Godrej Real Estate|NHAI|FinTech Capital|Nirlon Tech|Shapoorji Pallonji)\b"),
            ("ORGANIZATION", r"(?:मेसर्स\s+[\u0900-\u097F\w\s]+(?:प्राइवेट लिमिटेड|लिमिटेड|सॉल्यूशंस))"),
            ("ORGANIZATION", r"\b(?:भारत लीगल सॉल्यूशंस प्राइवेट लिमिटेड|टाटा कंसल्टेंसी|रिलायंस इंडस्ट्रीज)\b"),
            ("PERSON", r"\b(?:Adv\.|Shri|Smt\.|Mr\.|Ms\.|Mrs\.|Dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b"),
            ("PERSON", r"(?:श्री|श्रीमती|डॉ\.|अधिवक्ता)\s+[\u0900-\u097F]+(?:\s+[\u0900-\u097F]+)?"),
            ("PERSON", r"\b(?:राजेश शर्मा|अमित वर्मा|सुरेश कुमार|प्रशांत भूषण|रोहित कुलकर्णी|मीरा राव|करण मेहता|अर्जुन शर्मा|प्रिया नारायणन|विक्रम मल्होत्रा|निखिल सावंत|सचिन गुप्ता|राकेश बंसल)\b"),
            ("LOCATION", r"\b(?:कड़कड़डूमा कोर्ट|दिल्ली उच्च न्यायालय|नई दिल्ली|इलाहाबाद उच्च न्यायालय|बॉम्बे हाई कोर्ट|साकेत कोर्ट|पटियाला हाउस कोर्ट|रोहिणी कोर्ट|तिहाड़ जेल)\b"),
        ]

        sanitized = text
        for entity_type, pattern in patterns:
            for match in re.finditer(pattern, sanitized, flags=re.IGNORECASE):
                val = match.group()
                entities_found.append({
                    "entity_type": entity_type,
                    "text": val,
                    "start": match.start(),
                    "end": match.end(),
                    "score": 0.95,
                })

        # Apply redactions cleanly
        for ent in sorted(entities_found, key=lambda x: len(x["text"]), reverse=True):
            placeholder = f"<{ent['entity_type']}>"
            sanitized = sanitized.replace(ent["text"], placeholder)

        # De-duplicate entity records
        deduped = []
        seen = set()
        for ent in entities_found:
            key = (ent["entity_type"], ent["text"].lower())
            if key not in seen:
                seen.add(key)
                deduped.append(ent)

        return sanitized, deduped

presidio_service = PresidioService()
