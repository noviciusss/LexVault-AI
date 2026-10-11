import asyncio
import io

class OCRService:
    async def extract_text(self, file_bytes: bytes, filename: str = "doc.pdf", lang: str = "eng") -> str:
        return await asyncio.to_thread(self._extract, file_bytes, filename, lang)

    def _extract(self, content: bytes, filename: str, lang: str) -> str:
        if filename.lower().endswith(".pdf"):
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            text = "\n\n".join(page.extract_text() or "" for page in reader.pages)
            if text.strip():
                return text.strip()
            raise ValueError("This PDF has no text layer. Upload a page image for OCR or paste its text.")
        try:
            import pytesseract
            from PIL import Image
            return pytesseract.image_to_string(Image.open(io.BytesIO(content)), lang="hin+eng" if "hin" in lang else "eng").strip()
        except ImportError:
            raise ValueError("Image OCR requires pytesseract and the local Tesseract engine. PDF text extraction and typed notes are available.")

ocr_service = OCRService()
