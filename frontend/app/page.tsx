"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  ArrowRight,
  Landmark,
  Languages,
  BookOpen,
  ShieldCheck,
  Scale,
  GitFork,
} from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { Badge, Card, Skeleton } from "@/components/ui/primitives";
const PipelineDiagram = dynamic(() => import("@/components/pipeline/PipelineDiagram"), {
  ssr: false,
  loading: () => <Skeleton className="h-96" />,
});
export default function LandingPage() {
  const [stage, setStage] = useState(3);
  const names = [
    "Raw capture",
    "Local processing",
    "PII sanitization",
    "Strategy abstraction",
    "Partner review",
    "Knowledge indexing",
    "Source retrieval",
    "Grounded response",
  ];
  const stages = names.map((name, index) => ({
    stage: index + 1,
    name,
    status:
      index + 1 < stage
        ? ("done" as const)
        : index + 1 === stage
          ? ("running" as const)
          : ("pending" as const),
  }));
  return (
    <div className="mx-auto max-w-6xl space-y-16 py-8 sm:py-14">
      <Reveal className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Badge>
            <Landmark className="h-3.5 w-3.5" />
            Built around the Constitution of India
          </Badge>
          <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
            Clarity in the law.
            <br />
            <span className="text-accent">Confidence in the source.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-content-secondary">
            A focused workspace for Indian constitutional research. Connect articles, doctrines, and
            landmark case references with your firm’s reviewed institutional knowledge.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/constitution"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-hover"
            >
              Explore the Constitution <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-surface-border bg-surface px-5 py-3 text-sm font-medium hover:border-accent/40"
            >
              Open firm workspace
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-5 text-xs text-content-muted">
            <span className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-accent" />
              English & हिन्दी
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent" />
              Source-linked research
            </span>
          </div>
        </div>
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="mb-7 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[.18em] text-content-muted">
              A constitutional foundation
            </span>
            <Landmark className="h-5 w-5 text-accent" />
          </div>
          <Badge>Article 21 · Life & personal liberty</Badge>
          <blockquote className="my-7 font-serif text-2xl leading-relaxed">
            “No person shall be deprived of his life or personal liberty except according to
            procedure established by law.”
          </blockquote>
          <p
            lang="hi"
            className="border-t border-surface-border pt-5 text-sm leading-loose text-content-secondary"
          >
            किसी व्यक्ति को उसके प्राण या दैहिक स्वतंत्रता से विधि द्वारा स्थापित प्रक्रिया के
            अनुसार ही वंचित किया जाएगा, अन्यथा नहीं।
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Human dignity", "Privacy", "Substantive fairness"].map((theme) => (
              <span
                key={theme}
                className="rounded-lg bg-surface-elevated px-3 py-2 text-xs text-content-secondary"
              >
                {theme}
              </span>
            ))}
          </div>
          <Link
            href="/constitution?article=21"
            className="mt-6 inline-flex items-center gap-2 text-sm text-accent"
          >
            Read Article 21 <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </Reveal>
      <Reveal className="grid gap-5 md:grid-cols-3">
        {[
          {
            icon: Landmark,
            title: "Research the Constitution",
            description:
              "Navigate constitutional parts, compare articles, and explore the doctrines and related cases behind each provision.",
          },
          {
            icon: Languages,
            title: "Read in your language",
            description:
              "Switch between English, Hindi, and bilingual reading with bookmarks that keep your research close.",
          },
          {
            icon: ShieldCheck,
            title: "Build trusted firm knowledge",
            description:
              "Capture legal insights, sanitize identifying information, and publish only after partner review.",
          },
        ].map((feature) => (
          <Card key={feature.title} className="p-6">
            <feature.icon className="mb-5 h-6 w-6 text-accent" />
            <h2 className="text-base font-semibold">{feature.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-secondary">
              {feature.description}
            </p>
          </Card>
        ))}
      </Reveal>
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-accent">
              From experience to institutional memory
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold">
              Every insight follows a visible path.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-content-secondary">
            Eight traceable stages connect capture, privacy, review, and source-grounded retrieval.
            Select a stage to explore the architecture.
          </p>
        </div>
        <PipelineDiagram stages={stages} selectedStage={stage} onSelectStage={setStage} />
        <p className="text-xs text-content-muted">
          Interactive architecture preview · live jobs run in the firm workspace.
        </p>
      </section>
      <Card className="flex flex-col items-start justify-between gap-6 border-accent/25 p-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-semibold">
            Start with a constitutional question.
          </h2>
          <p className="mt-2 text-sm text-content-secondary">
            Equality, liberty, writ jurisdiction, or the basic structure—follow the article.
          </p>
        </div>
        <Link
          href="/constitution"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-background"
        >
          Begin research <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  );
}
