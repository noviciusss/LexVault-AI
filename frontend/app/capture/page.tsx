"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Tabs from "@radix-ui/react-tabs";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Mic,
  UploadCloud,
  Play,
  Square,
  X,
  Loader2,
  Search,
  ShieldCheck,
  Volume2,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { errorMessage, cn } from "@/lib/utils";
import { INDIAN_LEGAL_TEMPLATES, type IndianLegalTemplate } from "./indian_cases_data";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Input,
  PageHeader,
  LoadingState,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";

const schema = z.object({
  title: z.string().trim().min(3, "Add a title with at least 3 characters."),
  practiceArea: z.string().min(1),
  language: z.enum(["eng", "hin"]),
  text: z.string(),
});
type CaptureForm = z.infer<typeof schema>;
type Mode = "text" | "voice" | "ocr";
function CaptureContent() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useAppStore((state) => state.currentUser);
  const setActiveJobId = useAppStore((state) => state.setActiveJobId);
  const requested = params.get("mode");
  const [mode, setMode] = useState<Mode>(
    requested === "voice" || requested === "ocr" ? requested : "text",
  );
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [voice, setVoice] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [library, setLibrary] = useState(false);
  const [filter, setFilter] = useState("");
  const [dragging, setDragging] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useForm<CaptureForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      practiceArea: "Constitutional Law & Fundamental Rights",
      language: "eng",
      text: "",
    },
  });
  const values = form.watch();
  const draftKey = `lexvault_capture_draft_${user.firm_id}_${user.id}`;
  const [draftLoaded, setDraftLoaded] = useState(false);
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(draftKey);
      if (stored) form.reset(JSON.parse(stored));
    } catch {
      /* Invalid drafts are ignored. */
    }
    setDraftLoaded(true);
  }, [draftKey, form]);
  useEffect(() => {
    if (!draftLoaded) return;
    const timer = setTimeout(() => sessionStorage.setItem(draftKey, JSON.stringify(values)), 700);
    return () => clearTimeout(timer);
  }, [values, draftKey, draftLoaded]);
  useEffect(() => {
    if (!voice) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(voice);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [voice]);
  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);
  useEffect(
    () => () => {
      if (recorder.current?.state === "recording") {
        recorder.current.onstop = null;
        recorder.current.stop();
      }
      stream.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );
  const chooseFile = (candidate?: File) => {
    if (!candidate) return;
    if (!/\.(pdf|png|jpe?g)$/i.test(candidate.name)) {
      toast.error("Choose a PDF, PNG, or JPG document.");
      return;
    }
    if (candidate.size > 25 * 1024 * 1024) {
      toast.error("Documents must be smaller than 25 MB.");
      return;
    }
    setFile(candidate);
  };
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined")
        throw new Error("Recording is unavailable in this browser. Upload an audio file instead.");
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm", "audio/mp4", "audio/ogg"].find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const instance = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined);
      recorder.current = instance;
      const chunks: BlobPart[] = [];
      instance.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      instance.onstop = () => {
        const type = instance.mimeType || "audio/webm";
        setVoice(
          new File(
            chunks,
            `voice_memo.${type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm"}`,
            { type },
          ),
        );
        stream.current?.getTracks().forEach((track) => track.stop());
        setRecording(false);
      };
      instance.start();
      setSeconds(0);
      setRecording(true);
    } catch (error) {
      toast.error(errorMessage(error));
      stream.current?.getTracks().forEach((track) => track.stop());
    }
  };
  const loadTemplate = (template: IndianLegalTemplate) => {
    form.reset({
      title: template.title,
      practiceArea: template.practice_area,
      language: template.language === "hin" ? "hin" : "eng",
      text: template.content,
    });
    setMode("text");
    setLibrary(false);
    setStep(1);
    toast.success("Case template loaded");
  };
  const demo = async (type: "voice" | "ocr") => {
    setDemoLoading(true);
    try {
      const path =
        type === "voice" ? "sample_voice_briefing.wav" : "sample_commercial_contract.pdf";
      const response = await fetch(`/demo-assets/${path}`);
      if (!response.ok) throw new Error("The demo attachment could not be loaded");
      const blob = await response.blob();
      const asset = new File([blob], path, { type: blob.type });
      if (type === "voice") setVoice(asset);
      else setFile(asset);
      setMode(type);
      form.setValue(
        "title",
        type === "voice" ? "Bombay High Court briefing" : "Commercial contract research",
      );
      setStep(1);
      toast.success("Demo attachment is ready");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDemoLoading(false);
    }
  };
  const ready =
    mode === "text" ? !!values.text.trim() : mode === "voice" ? !!voice && !recording : !!file;
  const submit = async (data: CaptureForm) => {
    if (!ready) {
      toast.error("Add content before launching the pipeline");
      return;
    }
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("input_type", mode);
      body.append("title", data.title);
      body.append("practice_area", data.practiceArea);
      body.append("language", data.language);
      if (mode === "text") body.append("text_content", data.text);
      else body.append("file", (mode === "voice" ? voice : file)!);
      const result = await api.capture.submit(body);
      sessionStorage.removeItem(draftKey);
      setActiveJobId(result.job_id);
      toast.success("Capture accepted. Follow its progress in the pipeline.");
      router.push(`/pipeline/${result.job_id}`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Reveal className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Stage 1 · Capture working knowledge"
        title="Preserve the insight behind the matter."
        description="Start with constitutional reasoning, a working note, voice memo, or document. Sanitization and partner review follow in the pipeline."
        action={
          <Button variant="secondary" onClick={() => setLibrary(true)}>
            <BookOpen className="h-4 w-4" />
            Case templates
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {["Capture", "Review", "Launch"].map((label, index) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2",
              step >= index + 1 ? "text-accent" : "text-content-muted",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border",
                step >= index + 1 ? "border-accent/40 bg-accent/10" : "border-surface-border",
              )}
            >
              {index + 1}
            </span>
            {label}
            {index < 2 && <span className="mx-2 text-surface-border">—</span>}
          </div>
        ))}
      </div>
      <form onSubmit={form.handleSubmit(submit)}>
        <Card className="overflow-hidden">
          <div className="p-5 sm:p-7">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="capture-title" className="mb-2 block text-sm font-medium">
                      Research or matter title
                    </label>
                    <Input
                      id="capture-title"
                      placeholder="Article 21 privacy research…"
                      {...form.register("title")}
                    />
                    {form.formState.errors.title && (
                      <p role="alert" className="mt-2 text-xs text-status-danger">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="capture-area" className="mb-2 block text-sm font-medium">
                      Practice area
                    </label>
                    <select
                      id="capture-area"
                      {...form.register("practiceArea")}
                      className="min-h-11 w-full rounded-xl border border-surface-border bg-surface-elevated px-3 text-sm"
                    >
                      {Array.from(
                        new Set([
                          "Constitutional Law & Fundamental Rights",
                          ...INDIAN_LEGAL_TEMPLATES.map((template) => template.practice_area),
                        ]),
                      ).map((area) => (
                        <option key={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Tabs.Root
                  value={mode}
                  onValueChange={(value) => {
                    if (recording) {
                      toast.info("Stop your recording before switching modes");
                      return;
                    }
                    setMode(value as Mode);
                  }}
                >
                  <Tabs.List
                    aria-label="Capture input mode"
                    className="mb-5 grid grid-cols-3 gap-1 rounded-xl border border-surface-border bg-surface-elevated p-1"
                  >
                    {[
                      { id: "text", label: "Typed notes", icon: FileText },
                      { id: "voice", label: "Voice memo", icon: Mic },
                      { id: "ocr", label: "Document", icon: UploadCloud },
                    ].map((tab) => (
                      <Tabs.Trigger
                        key={tab.id}
                        value={tab.id}
                        className="flex items-center justify-center gap-2 rounded-lg py-3 text-xs text-content-secondary data-[state=active]:bg-surface data-[state=active]:text-accent"
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                  <Tabs.Content value="text">
                    <label htmlFor="capture-text" className="mb-2 block text-sm font-medium">
                      Working notes
                    </label>
                    <textarea
                      id="capture-text"
                      rows={12}
                      {...form.register("text")}
                      placeholder="Record the legal issue, constitutional provision, court reasoning, and transferable insight…"
                      className="w-full rounded-xl border border-surface-border bg-surface-elevated p-4 text-sm leading-loose"
                    />
                    <div className="mt-2 flex justify-between text-xs text-content-muted">
                      <span>Draft saved for this browser session</span>
                      <span>{values.text.length.toLocaleString()} characters</span>
                    </div>
                  </Tabs.Content>
                  <Tabs.Content value="voice">
                    <div className="rounded-xl border border-surface-border bg-surface-elevated/50 p-7 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <Mic className={cn("h-7 w-7", recording && "animate-pulse")} />
                      </div>
                      <h3 className="text-base font-medium">Dictate your working insight</h3>
                      <p className="mx-auto mt-2 max-w-md text-sm text-content-secondary">
                        Record in the browser or attach audio for transcription.
                      </p>
                      <div className="mt-5 flex flex-wrap justify-center gap-3">
                        <Button
                          type="button"
                          onClick={recording ? () => recorder.current?.stop() : startRecording}
                        >
                          {recording ? (
                            <Square className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          {recording ? `Stop · ${seconds}s` : "Start recording"}
                        </Button>
                        <label className="inline-flex cursor-pointer items-center rounded-xl border border-surface-border px-4 py-2.5 text-sm">
                          Upload audio
                          <input
                            type="file"
                            accept="audio/*"
                            className="sr-only"
                            onChange={(event) => {
                              const candidate = event.target.files?.[0];
                              if (candidate && candidate.size <= 25 * 1024 * 1024)
                                setVoice(candidate);
                              else toast.error("Audio must be smaller than 25 MB");
                            }}
                          />
                        </label>
                      </div>
                      {preview && (
                        <div className="mx-auto mt-6 max-w-lg rounded-xl border border-surface-border bg-surface p-4">
                          <p className="mb-3 text-left text-xs text-accent">{voice?.name}</p>
                          <audio controls src={preview} className="w-full" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="small"
                            onClick={() => setVoice(null)}
                          >
                            Remove audio
                          </Button>
                        </div>
                      )}
                    </div>
                  </Tabs.Content>
                  <Tabs.Content value="ocr">
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        chooseFile(event.dataTransfer.files[0]);
                      }}
                      className={cn(
                        "rounded-xl border-2 border-dashed p-8 text-center",
                        dragging
                          ? "border-accent bg-accent/5"
                          : "border-surface-border bg-surface-elevated/40",
                      )}
                    >
                      <UploadCloud className="mx-auto mb-4 h-8 w-8 text-accent" />
                      <h3 className="text-base font-medium">Drop your document here</h3>
                      <p className="mt-2 text-xs text-content-muted">
                        PDF, PNG, or JPG · up to 25 MB · English & Hindi
                      </p>
                      <input
                        ref={inputRef}
                        aria-label="Upload document"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="sr-only"
                        onChange={(event) => chooseFile(event.target.files?.[0])}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-5"
                        onClick={() => inputRef.current?.click()}
                      >
                        Choose a document
                      </Button>
                      {file && (
                        <div className="mx-auto mt-5 flex max-w-md items-center gap-3 rounded-xl border border-accent/25 bg-surface p-3 text-left">
                          <CheckCircle2 className="h-4 w-4 text-status-success" />
                          <span className="min-w-0 flex-1 truncate text-xs">
                            {file.name} · {(file.size / 1024).toFixed(0)} KB
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Remove document"
                            onClick={() => setFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="capture-language"
                      className="mt-4 flex items-center gap-3 text-xs text-content-secondary"
                    >
                      Recognition language
                      <select
                        id="capture-language"
                        {...form.register("language")}
                        className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2"
                      >
                        <option value="eng">English</option>
                        <option value="hin">हिन्दी</option>
                      </select>
                    </label>
                  </Tabs.Content>
                </Tabs.Root>
              </div>
            ) : (
              <div className="space-y-5">
                <Badge>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Ready for the review pipeline
                </Badge>
                <h2 className="text-xl font-semibold">{values.title}</h2>
                <p className="text-sm text-content-secondary">
                  {values.practiceArea} · {mode.toUpperCase()} capture
                </p>
                <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl border border-surface-border bg-surface-elevated p-5 text-sm leading-relaxed">
                  {mode === "text" ? values.text : mode === "voice" ? voice?.name : file?.name}
                </div>
                <p className="text-sm leading-relaxed text-content-secondary">
                  The pipeline will process your input, remove detected identifiers, abstract a
                  reusable insight, and request partner review before publication.
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-surface-border bg-surface-subtle px-5 py-4 sm:px-7">
            <span className="text-xs text-content-muted">
              {step === 1
                ? "Private intake → sanitized insight → partner review"
                : "Every decision is traceable in the audit trail"}
            </span>
            {step === 1 ? (
              <Button
                type="button"
                disabled={!ready}
                onClick={async () => {
                  if (await form.trigger()) setStep(2);
                }}
              >
                Review capture <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={submitting}
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {submitting ? "Submitting capture…" : "Launch pipeline"}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </form>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-border p-4">
        <span className="mr-auto text-xs text-content-muted">Evaluator demo attachments</span>
        <Button variant="ghost" size="small" disabled={demoLoading} onClick={() => demo("voice")}>
          <Volume2 className="h-4 w-4" />
          Load voice demo
        </Button>
        <Button variant="ghost" size="small" disabled={demoLoading} onClick={() => demo("ocr")}>
          <FileText className="h-4 w-4" />
          Load contract PDF
        </Button>
      </div>
      <Dialog
        open={library}
        onOpenChange={setLibrary}
        title="Indian legal case templates"
        description="Start with a prepared scenario and adapt it to your research."
        className="max-w-4xl"
      >
        <Input
          aria-label="Search case templates"
          placeholder="Constitutional, Article 21, writs…"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        <div className="mt-4 grid max-h-[55dvh] gap-3 overflow-y-auto sm:grid-cols-2">
          {INDIAN_LEGAL_TEMPLATES.filter((template) =>
            `${template.title} ${template.practice_area} ${template.summary}`
              .toLowerCase()
              .includes(filter.toLowerCase()),
          )
            .sort(
              (a, b) =>
                Number(b.practice_area.includes("Constitution")) -
                Number(a.practice_area.includes("Constitution")),
            )
            .map((template) => (
              <button
                key={template.id}
                onClick={() => loadTemplate(template)}
                className="rounded-xl border border-surface-border p-4 text-left hover:border-accent/40"
              >
                <Badge>{template.badge}</Badge>
                <h3 className="mt-3 text-sm font-medium">{template.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-content-muted">
                  {template.summary}
                </p>
              </button>
            ))}
        </div>
      </Dialog>
    </Reveal>
  );
}
export default function CapturePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CaptureContent />
    </Suspense>
  );
}
