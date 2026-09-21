"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Zap,
  ArrowRight,
  CheckCircle2,
  Database,
  Cpu,
  Share2,
  FileCheck,
  Scale,
  Users,
  EyeOff,
  Sparkles,
} from "lucide-react";
import PipelineDiagram from "@/components/pipeline/PipelineDiagram";
import Logo from "@/components/Logo";

export default function LandingPage() {
  const [demoStage, setDemoStage] = useState(3);

  const sampleStages = [
    { stage: 1, name: "Raw Capture", status: "done" as const },
    { stage: 2, name: "Local AI Processing", status: "done" as const },
    { stage: 3, name: "PII Sanitization", status: "running" as const },
    { stage: 4, name: "Strategy Abstraction", status: "pending" as const },
    { stage: 5, name: "Lawyer Approval Gate", status: "pending" as const },
    { stage: 6, name: "Vector & Graph DB", status: "pending" as const },
    { stage: 7, name: "RAG Retrieval", status: "pending" as const },
    { stage: 8, name: "Safe Response", status: "pending" as const },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-20 py-6 pb-20">
      {/* Slide 1: Hero */}
      <section className="text-center space-y-6 pt-4">
        <div className="flex justify-center mb-2">
          <Logo size="lg" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider shadow-gold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Institutional Legal AI Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-content-primary max-w-4xl mx-auto leading-tight">
          Unlock decades of hidden legal expertise <span className="text-accent underline decoration-accent/40 underline-offset-8">without breaching privilege.</span>
        </h1>

        <p className="text-base sm:text-lg text-content-secondary max-w-2xl mx-auto leading-relaxed">
          LexVault AI turns undocumented attorney notes, recordings, and case filings into a searchable, firm-wide institutional intelligence asset—sanitized by local AI and audited at every step.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-background font-semibold text-sm transition-all shadow-gold hover:scale-105 active:scale-95"
          >
            <span>Launch Live Prototype</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/capture"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border text-content-primary font-medium text-sm transition-all hover:border-accent/40"
          >
            <span>Test Capture Intake</span>
          </Link>
        </div>
      </section>

      {/* Slide 2: The Core Problem */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-status-danger/10 text-status-danger flex items-center justify-center border border-status-danger/20">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-content-primary">Unrecorded Senior Wisdom</h3>
          <p className="text-xs text-content-secondary leading-relaxed">
            Partners resolve intricate multi-million dollar regulatory hurdles, but billing pressures prevent formal documentation. When partners retire, their strategic playbooks vanish.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-status-warning/10 text-status-warning flex items-center justify-center border border-status-warning/20">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-content-primary">The Privilege Deadlock</h3>
          <p className="text-xs text-content-secondary leading-relaxed">
            Attorneys cannot paste raw client facts into public AI models (ChatGPT) without risking ethical malpractice and attorney-client privilege forfeiture.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center border border-accent/30">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-content-primary">Reinventing the Wheel</h3>
          <p className="text-xs text-content-secondary leading-relaxed">
            Firms waste hundreds of associate hours redrafting arguments and restructuring indemnity terms that another practice group already perfected 6 months earlier.
          </p>
        </div>
      </section>

      {/* Slide 3: The 8-Stage Solution Pipeline (Live Interactive Flow) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-accent tracking-wider">The Architectural Spine</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight mt-1">
              The 8-Stage Guardrailed Knowledge Pipeline
            </h2>
          </div>
          <p className="text-xs text-content-secondary max-w-md">
            Every screen in LexVault maps directly to these 8 stages. Traceability from raw client intake to guardrailed firm retrieval is 100% visible.
          </p>
        </div>

        {/* Render Interactive Pipeline */}
        <PipelineDiagram stages={sampleStages} selectedStage={demoStage} onSelectStage={setDemoStage} />
      </section>

      {/* Slide 4: The 4 Capabilities */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold text-accent tracking-wider">Product Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
            Institutional Memory, Defended by Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3 hover:border-accent/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-content-primary">1. Personal Knowledge Vault</h4>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              Capture rough voice memos, quick shorthand bullet points, or document scans. Local models structure the text without uploading raw client data to public clouds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3 hover:border-accent/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-status-success/10 text-status-success border border-status-success/20">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-content-primary">2. Secure Knowledge Publishing</h4>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              Microsoft Presidio strips PII (client names, case numbers, corporations). High-parameter models generalize facts into reusable legal principles, submitted to human partners for gatekeeping sign-off.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3 hover:border-accent/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-content-primary">3. Firm Intelligence Hub</h4>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              Approved strategies are dual-indexed: dense semantic vectors in Qdrant and relational doctrine links in Neo4j (Practice Area, Concepts, Authors).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3 hover:border-accent/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-status-info/10 text-status-info border border-status-info/20">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-content-primary">4. Safe AI Assistant</h4>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              Attorneys query the vault in natural language. Answers are strictly constrained to cite internal Knowledge Item IDs, with automatic refusal if firm precedent does not exist.
            </p>
          </div>
        </div>
      </section>

      {/* Slide 5: Tech Stack & Verification */}
      <section className="p-8 rounded-2xl bg-surface border border-surface-border space-y-6">
        <h3 className="text-lg font-semibold text-content-primary flex items-center gap-2">
          <Database className="w-5 h-5 text-accent" />
          <span>Real, Running Production-Grade Tech Stack</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
            <div className="font-semibold text-content-primary">Vector DB</div>
            <div className="text-accent font-mono mt-1">Qdrant (BGE-Small)</div>
            <div className="text-[11px] text-content-muted mt-1">Cosine Semantic Index</div>
          </div>
          <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
            <div className="font-semibold text-content-primary">Knowledge Graph</div>
            <div className="text-accent font-mono mt-1">Neo4j Cypher</div>
            <div className="text-[11px] text-content-muted mt-1">Concepts & Relational Edges</div>
          </div>
          <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
            <div className="font-semibold text-content-primary">PII Redaction</div>
            <div className="text-accent font-mono mt-1">Microsoft Presidio</div>
            <div className="text-[11px] text-content-muted mt-1">Analyzer & Anonymizer</div>
          </div>
          <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
            <div className="font-semibold text-content-primary">Fast Inference</div>
            <div className="text-accent font-mono mt-1">Groq Llama-3.3-70B</div>
            <div className="text-[11px] text-content-muted mt-1">Ultra-Low Latency Legal AI</div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="text-center p-10 rounded-2xl bg-gradient-to-b from-surface-elevated to-surface border border-accent/30 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">
          Ready to experience the 8-stage pipeline live?
        </h2>
        <p className="text-xs sm:text-sm text-content-secondary max-w-lg mx-auto">
          Capture a mock case note, watch client names get redacted in real time, review it in the partner approvals queue, and query the assistant.
        </p>
        <div className="pt-2">
          <Link
            href="/capture"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-background font-semibold text-sm transition-all shadow-gold"
          >
            <span>Start End-to-End Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
