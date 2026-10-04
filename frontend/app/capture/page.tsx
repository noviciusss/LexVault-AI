"use client";

import React, { useState, useRef, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Mic,
  UploadCloud,
  ArrowRight,
  Shield,
  Loader2,
  Sparkles,
  StopCircle,
  Play,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Scale,
  Building2,
  Gavel,
  Download,
  Volume2,
  Zap,
  FileCheck2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { INDIAN_LEGAL_TEMPLATES, IndianLegalTemplate } from "./indian_cases_data";

function CaptureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") || "text";

  const { setActiveJobId } = useAppStore();

  const [mode, setMode] = useState<"text" | "voice" | "ocr">(
    initialMode as any
  );
  const [title, setTitle] = useState(INDIAN_LEGAL_TEMPLATES[0].title);
  const [practiceArea, setPracticeArea] = useState(INDIAN_LEGAL_TEMPLATES[0].practice_area);
  const [language, setLanguage] = useState(INDIAN_LEGAL_TEMPLATES[0].language); // "eng" | "hin"
  const [textContent, setTextContent] = useState(INDIAN_LEGAL_TEMPLATES[0].content);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // 15 Case Templates Showcase State
  const [activeTemplateId, setActiveTemplateId] = useState<string>(INDIAN_LEGAL_TEMPLATES[0].id);
  const [templateCategory, setTemplateCategory] = useState<string>("All");
  const [templateSearch, setTemplateSearch] = useState<string>("");
  const [showTemplateLibrary, setShowTemplateLibrary] = useState<boolean>(true);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  // Dynamic Audio Preview URL
  const audioPreviewUrl = useMemo(() => {
    if (!audioBlob) return null;
    return URL.createObjectURL(audioBlob);
  }, [audioBlob]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone access not available. You can test using Text or OCR mode.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleSelectTemplate = (tpl: IndianLegalTemplate) => {
    setActiveTemplateId(tpl.id);
    setTitle(tpl.title);
    setPracticeArea(tpl.practice_area);
    setLanguage(tpl.language);
    setTextContent(tpl.content);
    setMode("text");

    // Scroll to the form
    const formElement = document.getElementById("capture-intake-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 1-Click Demo Asset Loaders
  const handleLoadDemoVoice = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch("/demo-assets/sample_voice_briefing.wav");
      if (!res.ok) throw new Error("Failed to load sample voice asset");
      const blob = await res.blob();
      const wavFile = new File([blob], "sample_voice_briefing.wav", { type: "audio/wav" });
      setFile(wavFile);
      setAudioBlob(blob);
      setMode("voice");
      setTitle("Client Dictation: Bombay High Court Interim Injunction & S.27 Defense");
      setPracticeArea("Arbitration & ADR");
      setLanguage("eng");

      const formElement = document.getElementById("capture-intake-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err: any) {
      alert("Error loading demo audio: " + err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleLoadDemoPdf = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch("/demo-assets/sample_commercial_contract.pdf");
      if (!res.ok) throw new Error("Failed to load sample PDF contract");
      const blob = await res.blob();
      const pdfFile = new File([blob], "sample_commercial_contract.pdf", { type: "application/pdf" });
      setFile(pdfFile);
      setMode("ocr");
      setTitle("Commercial Asset Transfer & IP Assignment Agreement (TCS v. Bharat Infotech)");
      setPracticeArea("Indian Contract Act & Commercial");
      setLanguage("eng");

      const formElement = document.getElementById("capture-intake-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err: any) {
      alert("Error loading demo PDF: " + err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  // Categories list
  const categories = ["All", ...Array.from(new Set(INDIAN_LEGAL_TEMPLATES.map((t) => t.category)))];

  // Filtered templates
  const filteredTemplates = INDIAN_LEGAL_TEMPLATES.filter((t) => {
    const matchesCat = templateCategory === "All" || t.category === templateCategory;
    const matchesSearch =
      !templateSearch.trim() ||
      t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.badge.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.summary.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.practice_area.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("input_type", mode);
      formData.append("title", title || "Attorney Working Matter Note");
      formData.append("practice_area", practiceArea);
      formData.append("language", language);

      if (mode === "text") {
        formData.append("text_content", textContent);
      } else if (mode === "voice") {
        if (audioBlob) {
          formData.append("file", audioBlob, "voice_memo.webm");
        } else if (file) {
          formData.append("file", file);
        } else {
          formData.append("text_content", textContent);
        }
      } else if (mode === "ocr") {
        if (file) {
          formData.append("file", file);
        } else {
          formData.append("text_content", textContent);
        }
      }

      const res = await api.capture.submit(formData);
      if (res && res.job_id) {
        setActiveJobId(res.job_id);
        router.push(`/pipeline/${res.job_id}`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit capture to pipeline");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>Stage 1: On-Device Capture Intake</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">
          Capture Attorney Working Knowledge
        </h1>
        <p className="text-xs text-content-secondary mt-1">
          Select from 15 ready-to-use Indian case templates, or test on-device Voice transcription and Document OCR using one-click demo presets.
        </p>
      </div>

      {/* ---------------- CAPSTONE EVALUATOR 1-CLICK DEMO PRESETS ---------------- */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-accent/15 via-surface to-surface-elevated border border-accent/40 shadow-gold/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent text-background flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-background" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-content-primary flex items-center gap-2">
                <span>Capstone Jury & Evaluator Demo Launchers</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/20 text-accent font-semibold">Live Testing Assets</span>
              </h2>
              <p className="text-[11px] text-content-secondary">
                Click below to instantly attach pre-generated Indian legal assets to prove Voice & OCR extraction without hunting for files.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preset 1: Voice Recording Memo */}
          <div className="p-4 rounded-xl bg-surface border border-surface-border hover:border-accent/50 transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  <span>VOICE TRANSCRIPTION</span>
                </span>
                <span className="text-[10px] text-content-muted">16kHz PCM WAV Audio</span>
              </div>
              <h3 className="text-xs font-bold text-content-primary">
                Bombay HC Interim Injunction & Section 27 Defense Briefing
              </h3>
              <p className="text-[11px] text-content-secondary mt-1">
                Audio dictation regarding Bombay High Court Commercial Suit No. 412/2024 and invalidity of post-service restrictive covenants.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-border text-xs gap-2">
              <button
                type="button"
                onClick={handleLoadDemoVoice}
                disabled={demoLoading}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-background text-xs font-bold hover:bg-accent-hover active:scale-95 transition-all shadow-sm"
              >
                {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-background" />}
                <span>1-Click Load Voice Demo</span>
              </button>

              <a
                href="/demo-assets/sample_voice_briefing.wav"
                download="sample_voice_briefing.wav"
                title="Download local WAV audio file"
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface border border-surface-border text-content-secondary hover:text-content-primary text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WAV</span>
              </a>
            </div>
          </div>

          {/* Preset 2: Document OCR PDF */}
          <div className="p-4 rounded-xl bg-surface border border-surface-border hover:border-accent/50 transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                  <UploadCloud className="w-3 h-3" />
                  <span>DOCUMENT OCR / PDF</span>
                </span>
                <span className="text-[10px] text-content-muted">2-Page Formal Contract PDF</span>
              </div>
              <h3 className="text-xs font-bold text-content-primary">
                Commercial Asset Transfer Agreement (TCS v. Bharat Infotech)
              </h3>
              <p className="text-[11px] text-content-secondary mt-1">
                Formal legal contract with arbitration seat in Mumbai (Perkins Eastman) and confidential counsel notices.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-border text-xs gap-2">
              <button
                type="button"
                onClick={handleLoadDemoPdf}
                disabled={demoLoading}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-background text-xs font-bold hover:bg-accent-hover active:scale-95 transition-all shadow-sm"
              >
                {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>1-Click Load Contract PDF</span>
              </button>

              <a
                href="/demo-assets/sample_commercial_contract.pdf"
                download="sample_commercial_contract.pdf"
                title="Download local PDF contract"
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface border border-surface-border text-content-secondary hover:text-content-primary text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- 15 READY-TO-SHOW INDIAN CASE TEMPLATES ---------------- */}
      <div className="rounded-2xl bg-surface border border-surface-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-content-primary">
                  Ready-to-Test Indian Legal Cases & Scenarios (15 Pre-Loaded Templates)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-status-success/15 text-status-success border border-status-success/30 font-semibold">
                  15 Scenarios
                </span>
              </div>
              <p className="text-xs text-content-secondary mt-0.5">
                Click any case to populate Title, Practice Area, and factual legal notes ready to run through the 8-stage pipeline.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-content-secondary hover:text-content-primary transition-colors self-start sm:self-auto"
          >
            <span>{showTemplateLibrary ? "Collapse Library" : "Show All 15 Templates"}</span>
            {showTemplateLibrary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showTemplateLibrary && (
          <div className="p-5 space-y-4">
            {/* Category Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTemplateCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs transition-all ${
                      templateCategory === cat
                        ? "bg-accent/20 text-accent font-semibold border border-accent/40 shadow-sm"
                        : "bg-surface-elevated text-content-secondary hover:text-content-primary border border-surface-border"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter 15 cases..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* 15 Cases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredTemplates.map((tpl) => {
                const isSelected = activeTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2.5 ${
                      isSelected
                        ? "bg-accent/10 border-accent/50 shadow-md ring-1 ring-accent/30"
                        : "bg-surface-elevated hover:bg-surface border-surface-border hover:border-accent/30 shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface border border-surface-border text-accent">
                          {tpl.badge}
                        </span>
                        <span className="text-[10px] text-content-muted">
                          {tpl.language === "hin" ? "हिन्दी / Eng" : "English"}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-content-primary line-clamp-2 leading-snug">
                        {tpl.title}
                      </h4>
                      <p className="text-[11px] text-content-secondary line-clamp-2 mt-1 leading-relaxed">
                        {tpl.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-surface-border/60 text-[11px]">
                      <span className="text-content-muted truncate max-w-[150px]">
                        {tpl.category}
                      </span>
                      <button
                        type="button"
                        className={`font-semibold flex items-center gap-1 ${
                          isSelected ? "text-accent" : "text-content-secondary hover:text-accent"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                            <span>Loaded</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Load Case</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-3 p-1 rounded-xl bg-surface-elevated border border-surface-border">
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-medium transition-all ${
            mode === "text"
              ? "bg-accent/20 text-accent border border-accent/40 font-semibold shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Dictated / Typed Notes</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("voice")}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-medium transition-all ${
            mode === "voice"
              ? "bg-accent/20 text-accent border border-accent/40 font-semibold shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Voice Audio Memo</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("ocr")}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-medium transition-all ${
            mode === "ocr"
              ? "bg-accent/20 text-accent border border-accent/40 font-semibold shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Document / PDF OCR</span>
        </button>
      </div>

      {/* Capture Form */}
      <form
        id="capture-intake-form"
        onSubmit={handleSubmit}
        className="p-6 rounded-2xl bg-surface border border-surface-border space-y-6 shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1.5">
              Matter or Topic Working Title
            </label>
            <input
              type="text"
              placeholder="e.g., Bombay High Court Injunction Precedent / BNS 64 Defense"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1.5">
              Practice Area
            </label>
            <select
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent"
            >
              <option value="Constitutional Law & Fundamental Rights">Constitutional Law & Fundamental Rights</option>
              <option value="Criminal Law & BNS/IPC">Criminal Law & BNS/IPC</option>
              <option value="Civil Procedure (CPC)">Civil Procedure (CPC)</option>
              <option value="Indian Contract Act & Commercial">Indian Contract Act & Commercial</option>
              <option value="Corporate Insolvency & IBC">Corporate Insolvency & IBC</option>
              <option value="SEBI & Securities Law">SEBI & Securities Law</option>
              <option value="Transfer of Property & Real Estate">Transfer of Property & Real Estate</option>
              <option value="Family Law & Personal Law">Family Law & Personal Law</option>
              <option value="Commercial Litigation & Civil">Commercial Litigation & Civil</option>
              <option value="Arbitration & ADR">Arbitration & ADR</option>
            </select>
          </div>
        </div>

        {/* Dynamic Mode Inputs */}
        {mode === "text" && (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-medium text-content-secondary">
                Raw Attorney Notes (Indian case context — PII will be sanitized automatically in Stage 3)
              </label>
              <div className="flex items-center gap-1 text-[11px] text-content-muted">
                <span>Active Template:</span>
                <span className="font-semibold text-accent truncate max-w-[220px]">{title}</span>
              </div>
            </div>

            <textarea
              rows={9}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full p-4 rounded-xl bg-surface-elevated border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent leading-relaxed font-mono"
            />
          </div>
        )}

        {mode === "voice" && (
          <div className="space-y-4 p-6 rounded-xl bg-surface-elevated border border-surface-border text-center">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border transition-all shadow-md bg-accent/15 border-accent/30 text-accent">
              <Mic className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-content-primary">Voice Dictation & Audio Memo</h3>
              <p className="text-xs text-content-secondary max-w-sm mx-auto mt-1">
                Audio is transcribed via on-device faster-whisper. Record live or load the pre-recorded Bombay HC briefing.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-status-danger text-white text-xs font-semibold hover:bg-status-danger/90 transition-all shadow-sm"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Record Live Microphone</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-background text-xs font-semibold animate-pulse transition-all"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop Recording ({recordingSeconds}s)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLoadDemoVoice}
                disabled={demoLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-accent/40 text-accent text-xs font-semibold hover:bg-accent/10 transition-all shadow-sm"
              >
                {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>Attach Pre-Recorded Legal Memo</span>
              </button>
            </div>

            {/* Audio Preview & Confirmation */}
            {audioPreviewUrl && (
              <div className="p-4 rounded-xl bg-surface border border-accent/30 max-w-md mx-auto space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-accent flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4" />
                    <span>Attached Audio Stream</span>
                  </span>
                  <span className="text-[10px] font-mono text-content-muted">
                    {file?.name || "voice_memo.webm"} ({audioBlob ? `${(audioBlob.size / 1024).toFixed(1)} KB` : ""})
                  </span>
                </div>
                <audio controls src={audioPreviewUrl} className="w-full h-8 rounded" />
                <div className="text-[11px] text-status-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready for faster-whisper transcription & PII sanitization.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "ocr" && (
          <div className="p-8 rounded-xl bg-surface-elevated border-2 border-dashed border-surface-border hover:border-accent/50 transition-colors text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent mx-auto flex items-center justify-center border border-accent/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-content-primary">Upload Contract, Brief, or Hindi Case Sheet</h4>
              <p className="text-xs text-content-secondary mt-1">
                Supports English & Devanagari Hindi (हिन्दी) legal documents, agreements, and pleadings.
              </p>
            </div>

            {/* OCR Language Selector */}
            <div className="flex items-center justify-center gap-3 text-xs pt-1">
              <span className="text-content-secondary text-[11px] font-medium">OCR Recognition Script:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "eng" | "hin")}
                className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-accent font-semibold focus:outline-none focus:border-accent"
              >
                <option value="eng">English (Default)</option>
                <option value="hin">हिन्दी / Hindi Devanagari (Indian Court Sheets)</option>
              </select>
            </div>

            <div className="flex flex-col items-center justify-center gap-3">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-xs text-content-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30 cursor-pointer"
              />

              {/* File Selected Badge */}
              {file && (
                <div className="p-3 rounded-lg bg-surface border border-accent/30 flex items-center justify-between gap-3 text-xs max-w-sm w-full">
                  <div className="flex items-center gap-2 text-content-primary truncate">
                    <FileCheck2 className="w-4 h-4 text-status-success shrink-0" />
                    <span className="font-mono text-[11px] font-semibold truncate">{file.name}</span>
                    <span className="text-[10px] text-content-muted shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-[10px] text-status-danger hover:underline shrink-0"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Quick Demo Sheet & Contract Loaders */}
            <div className="pt-3 border-t border-surface-border/50 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleLoadDemoPdf}
                disabled={demoLoading}
                className="px-3 py-1.5 rounded-lg bg-surface border border-accent/30 text-xs text-accent hover:bg-accent/10 flex items-center gap-1.5 font-semibold transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Commercial Contract PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const hindiTpl = INDIAN_LEGAL_TEMPLATES.find((t) => t.language === "hin") || INDIAN_LEGAL_TEMPLATES[0];
                  handleSelectTemplate(hindiTpl);
                  alert("Hindi Legal Test Sheet loaded into OCR buffer! Click 'Launch Pipeline' below.");
                }}
                className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-status-success hover:bg-status-success/10 flex items-center gap-1.5 font-semibold transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pre-Loaded Hindi Devanagari Sheet</span>
              </button>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-border">
          <div className="text-[11px] text-content-muted flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span>Encrypted on-device intake • Privilege-protected</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-background font-semibold text-xs transition-all shadow-gold disabled:opacity-50 active:scale-95"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching 8-Stage Pipeline...</span>
              </>
            ) : (
              <>
                <span>Launch Pipeline</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CapturePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-content-muted">Loading Capture Intake...</div>}>
      <CaptureContent />
    </Suspense>
  );
}
