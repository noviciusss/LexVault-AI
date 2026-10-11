import asyncio
import io

class WhisperService:
    def __init__(self):
        self.model = None

    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        return await asyncio.to_thread(self._transcribe, audio_bytes)

    def _transcribe(self, content: bytes) -> str:
        try:
            from faster_whisper import WhisperModel
        except ImportError:
            raise ValueError("Voice transcription requires faster-whisper and a local model. Install the optional voice dependencies or use typed notes.")
        if self.model is None:
            self.model = WhisperModel("base", device="cpu", compute_type="int8")
        segments, _ = self.model.transcribe(io.BytesIO(content), beam_size=2)
        return " ".join(segment.text for segment in segments).strip()

whisper_service = WhisperService()
