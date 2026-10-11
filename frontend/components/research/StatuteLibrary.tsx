"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRightLeft, Search } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
} from "@/components/ui/primitives";

interface Section {
  act_code: string;
  act_name: string;
  section: string;
  title_en: string;
  title_hi: string;
  text_en: string;
  text_hi: string;
  landmark_cases: string;
}
interface Resolution {
  matched: boolean;
  target_act?: string;
  target_section?: string;
  message?: string;
  details?: { title_en?: string };
}
export default function StatuteLibrary() {
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [act, setAct] = useState("ALL");
  const [cite, setCite] = useState("IPC 302");
  const [active, setActive] = useState<Section | null>(null);
  const [hindi, setHindi] = useState(false);
  const acts = useQuery<{ code: string; name_en: string }[]>({
    queryKey: ["statute-acts"],
    queryFn: () => api.statutes.listActs(),
    staleTime: Infinity,
  });
  const sections = useQuery<Section[]>({
    queryKey: ["statutes", act, submitted],
    queryFn: () => api.statutes.listLibrary({ act: act === "ALL" ? undefined : act, q: submitted }),
    staleTime: 300000,
  });
  const resolver = useMutation<Resolution, Error, string>({
    mutationFn: (value) => api.statutes.resolveCitation(value),
    onError: (error) => toast.error(errorMessage(error)),
  });
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold">
          <ArrowRightLeft className="h-4 w-4 text-accent" />
          Legacy to current code reference
        </h2>
        <p className="mb-4 text-xs text-content-secondary">
          Resolve IPC / CrPC / IEA references against the curated BNS / BNSS / BSA mapping.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            resolver.mutate(cite);
          }}
          className="flex flex-wrap gap-3"
        >
          <Input
            className="min-w-0 flex-1"
            aria-label="Citation to resolve"
            value={cite}
            onChange={(event) => setCite(event.target.value)}
          />
          <Button disabled={resolver.isPending || !cite.trim()}>Resolve citation</Button>
        </form>
        {resolver.data && (
          <div className="mt-4 rounded-xl bg-surface-elevated p-4 text-sm">
            {resolver.data.matched ? (
              <>
                <span className="font-medium text-accent">
                  {resolver.data.target_act} §{resolver.data.target_section}
                </span>
                <p className="mt-2 text-content-secondary">{resolver.data.details?.title_en}</p>
              </>
            ) : (
              resolver.data.message
            )}
          </div>
        )}
      </Card>
      <form
        className="flex flex-wrap gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(search);
        }}
      >
        <select
          aria-label="Filter statute act"
          className="min-h-11 max-w-full rounded-xl border border-surface-border bg-surface px-3 text-xs"
          value={act}
          onChange={(event) => setAct(event.target.value)}
        >
          <option value="ALL">All acts</option>
          {acts.data?.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name_en}
            </option>
          ))}
        </select>
        <Input
          aria-label="Search statutory sections"
          className="min-w-0 flex-1"
          placeholder="Search sections or doctrine…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button variant="secondary">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </form>
      {sections.isError ? (
        <ErrorState message={errorMessage(sections.error)} retry={() => sections.refetch()} />
      ) : sections.isPending ? (
        <Skeleton className="h-60" />
      ) : !sections.data?.length ? (
        <EmptyState
          title="No sections match"
          description="Try another act or a broader search term."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.data.map((section) => (
            <button
              key={`${section.act_code}-${section.section}`}
              onClick={() => setActive(section)}
              className="rounded-2xl border border-surface-border bg-surface p-5 text-left hover:border-accent/40"
            >
              <Badge>{section.act_name}</Badge>
              <h3 className="mt-4 text-sm font-semibold">{section.title_en}</h3>
              <p className="mt-2 text-xs text-content-muted">Section {section.section}</p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-content-secondary">
                {section.text_en}
              </p>
            </button>
          ))}
        </div>
      )}
      <Drawer
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        title={active?.title_en || "Statutory reference"}
      >
        <Button variant="secondary" onClick={() => setHindi(!hindi)}>
          {hindi ? "Read English" : "हिन्दी में पढ़ें"}
        </Button>
        <p lang={hindi ? "hi" : "en"} className="mt-5 whitespace-pre-wrap text-sm leading-loose">
          {hindi ? active?.text_hi : active?.text_en}
        </p>
        <p className="mt-5 border-t border-surface-border pt-4 text-xs leading-relaxed text-content-muted">
          Related case references: {active?.landmark_cases}
        </p>
      </Drawer>
    </div>
  );
}
