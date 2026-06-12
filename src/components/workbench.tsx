"use client";

import { useEffect, useRef, useState } from "react";
import {
  PROVIDER_META,
  type DemoData,
  type DemoDocument,
  type DemoProviderId,
  type DemoProviderResult,
} from "@/lib/demo";

const PROVIDERS: DemoProviderId[] = ["rules", "local", "groq"];

function bytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function usd(n: number): string {
  if (n === 0) return "$0";
  return n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`;
}
function latency(ms: number): string {
  if (ms < 1) return `${ms.toFixed(2)} ms`;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}
function cents(c: number): string {
  return `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <g
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 19V14a6 6 0 0 1 6-6h5" />
        <path d="M45 8h5a6 6 0 0 1 6 6v5" />
        <path d="M56 45v5a6 6 0 0 1-6 6h-5" />
        <path d="M19 56h-5a6 6 0 0 1-6-6v-5" />
      </g>
      <rect x="24" y="24" width="16" height="16" rx="4.5" fill="currentColor" />
    </svg>
  );
}

type Phase = "idle" | "working" | "result";

export function Workbench({
  demo,
  commit,
}: {
  demo: DemoData | null;
  commit: string | null;
}) {
  const docs = demo?.documents ?? [];
  const [docId, setDocId] = useState(docs[0]?.id ?? "");
  const [provider, setProvider] = useState<DemoProviderId>("groq");
  const [phase, setPhase] = useState<Phase>("idle");
  const [egressShown, setEgressShown] = useState(0);
  const runRef = useRef(0);

  const doc: DemoDocument | undefined = docs.find((d) => d.id === docId);
  const result: DemoProviderResult | undefined = doc?.providers[provider];
  const hosted = PROVIDER_META[provider].hosted;

  // Selecting a different specimen or extractor resets the bench.
  useEffect(() => {
    runRef.current++;
    setPhase("idle");
    setEgressShown(0);
  }, [docId, provider]);

  function run() {
    if (!result) return;
    const token = ++runRef.current;
    setPhase("working");
    setEgressShown(0);
    const transmitting = hosted && result.egressBytes > 0;
    const workMs = transmitting ? 1300 : 750;
    if (transmitting) {
      const start = performance.now();
      const tick = () => {
        if (runRef.current !== token) return;
        const t = Math.min(1, (performance.now() - start) / workMs);
        setEgressShown(Math.round(result.egressBytes * t));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    window.setTimeout(() => {
      if (runRef.current !== token) return;
      setPhase("result");
    }, workMs);
  }

  if (!demo || !doc) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-2xl flex-1 items-center px-6 py-16">
        <div className="font-mono text-sm text-muted-foreground">
          No specimens on disk. Run{" "}
          <code className="text-foreground">pnpm generate</code>,{" "}
          <code className="text-foreground">pnpm measure</code>, then{" "}
          <code className="text-foreground">tsx scripts/export-demo.ts</code>.
        </div>
      </main>
    );
  }

  const correct = result?.fields.filter((f) => f.ok).length ?? 0;
  const totalFields = result?.fields.length ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Mark className="size-9 shrink-0 text-primary" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Enclave</h1>
            <p className="text-xs text-muted-foreground">
              Clinical document AI that never phones home.
            </p>
          </div>
        </div>
        <div className="eyebrow hidden text-ink-faint sm:block">
          intake workbench{commit ? ` · #${commit}` : ""}
        </div>
      </header>

      {/* Control bar */}
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-ink-faint">Specimen</span>
          <select
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            className="w-full rounded-md border border-input bg-card px-3 py-2 font-mono text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-80"
          >
            {docs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id} · {d.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="eyebrow text-ink-faint">Extract with</span>
          <div className="flex gap-1.5">
            {PROVIDERS.map((p) => {
              const active = p === provider;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  className={`rounded-md border px-3 py-1.5 text-left transition-colors ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-ink-faint"
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}
                  >
                    {PROVIDER_META[p].label}
                  </span>
                  <span className="block font-mono text-[10px] text-muted-foreground">
                    {PROVIDER_META[p].sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={run}
          disabled={phase === "working" || !result}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {phase === "working" ? "Running…" : "▶  Run extraction"}
        </button>
      </section>

      {/* Workspace: specimen ↔ extraction */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SpecimenPanel
          doc={doc}
          provider={provider}
          phase={phase}
          egressShown={egressShown}
          result={result}
        />
        <ExtractionPanel phase={phase} provider={provider} result={result} />
      </div>

      {/* Result summary */}
      {phase === "result" && result && (
        <section className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
          {result.error ? (
            <span className="text-destructive">
              extraction failed — {result.error}
            </span>
          ) : (
            <>
              <Stat
                label="fields correct"
                value={`${correct}/${totalFields}`}
                tone={correct === totalFields ? "good" : "warn"}
              />
              <Stat
                label="anomaly"
                value={anomalySummary(doc, result)}
                tone={anomalyTone(doc, result)}
              />
              <Stat
                label="egress"
                value={bytes(result.egressBytes)}
                tone={result.egressBytes === 0 ? "good" : "egress"}
              />
              <Stat label="latency" value={latency(result.latencyMs)} />
              <Stat label="cost" value={usd(result.costUsd)} />
            </>
          )}
        </section>
      )}

      <footer className="mt-2 flex flex-col gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
        <p className="font-mono">
          Real measured runs played back · rules → deterministic · local →
          qwen2.5:3b · groq → gpt-oss-120b
        </p>
        <p>
          Synthetic specimens, no real PHI. The egress gauge is the bytes of
          document content each extractor sent off-machine — measured, not
          asserted.
        </p>
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "warn" | "egress";
}) {
  const color =
    tone === "good"
      ? "text-primary"
      : tone === "egress"
        ? "text-egress"
        : tone === "warn"
          ? "text-muted-foreground"
          : "text-foreground";
  return (
    <span className="flex items-baseline gap-2">
      <span className="eyebrow text-ink-faint">{label}</span>
      <span className={`tabular font-mono ${color}`}>{value}</span>
    </span>
  );
}

function anomalySummary(doc: DemoDocument, r: DemoProviderResult): string {
  const expected = doc.injectedAnomalies;
  if (expected.length === 0) {
    return r.anomaliesFound.length === 0
      ? "clean — none"
      : `clean — ${r.anomaliesFound.length} false flag`;
  }
  const kind = expected[0].replace(/_/g, " ");
  return r.anomaliesFound.includes(expected[0])
    ? `${kind} — caught`
    : `${kind} — missed`;
}
function anomalyTone(
  doc: DemoDocument,
  r: DemoProviderResult,
): "good" | "warn" | "egress" {
  const expected = doc.injectedAnomalies;
  if (expected.length === 0)
    return r.anomaliesFound.length === 0 ? "good" : "egress";
  return r.anomaliesFound.includes(expected[0]) ? "good" : "egress";
}

function SpecimenPanel({
  doc,
  provider,
  phase,
  egressShown,
  result,
}: {
  doc: DemoDocument;
  provider: DemoProviderId;
  phase: Phase;
  egressShown: number;
  result: DemoProviderResult | undefined;
}) {
  const hosted = PROVIDER_META[provider].hosted;
  const transmitting = hosted && phase === "working" && (result?.egressBytes ?? 0) > 0;
  const sentBytes =
    phase === "working" ? egressShown : (result?.egressBytes ?? 0);

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="eyebrow text-ink-faint">Specimen · {doc.id}</span>
        <TransmissionGauge
          hosted={hosted}
          transmitting={transmitting}
          phase={phase}
          sentBytes={sentBytes}
          finalBytes={result?.egressBytes ?? 0}
        />
      </div>
      <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap px-4 py-3 font-mono text-[12.5px] leading-relaxed text-foreground/90">
        {doc.text}
      </pre>
    </section>
  );
}

function TransmissionGauge({
  hosted,
  transmitting,
  phase,
  sentBytes,
  finalBytes,
}: {
  hosted: boolean;
  transmitting: boolean;
  phase: Phase;
  sentBytes: number;
  finalBytes: number;
}) {
  if (!hosted) {
    return (
      <span className="flex items-center gap-1.5 text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="eyebrow">on-device · 0 B</span>
      </span>
    );
  }
  // Hosted: device → cloud track with a travelling packet while transmitting.
  const live = transmitting || (phase === "result" && finalBytes > 0);
  return (
    <span className="flex items-center gap-2 text-egress">
      <span className="eyebrow">device</span>
      <span className="relative h-px w-12 bg-egress/35">
        {transmitting && (
          <span className="packet absolute -top-[2px] size-[5px] rounded-full bg-egress" />
        )}
      </span>
      <span className="eyebrow">cloud</span>
      <span className="tabular font-mono text-[11px]">
        {live ? bytes(sentBytes) : "—"}
      </span>
    </span>
  );
}

function ExtractionPanel({
  phase,
  provider,
  result,
}: {
  phase: Phase;
  provider: DemoProviderId;
  result: DemoProviderResult | undefined;
}) {
  const hosted = PROVIDER_META[provider].hosted;
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="eyebrow text-ink-faint">
          Extraction · {PROVIDER_META[provider].label}
        </span>
        {phase === "result" && result && !result.error && (
          <span className="eyebrow text-primary">structured</span>
        )}
      </div>
      <div className="max-h-[28rem] overflow-auto px-4 py-3">
        {phase === "idle" && (
          <p className="font-mono text-sm text-muted-foreground">
            Select an extractor and run — the structured record appears here.
          </p>
        )}
        {phase === "working" && (
          <p className="font-mono text-sm text-muted-foreground">
            {hosted ? "Awaiting cloud response" : "Processing on-device"}
            <span className="blink">▍</span>
          </p>
        )}
        {phase === "result" &&
          result &&
          (result.error ? (
            <p className="font-mono text-sm text-destructive">
              Could not parse this specimen — {result.error}
            </p>
          ) : (
            <Extracted result={result} />
          ))}
      </div>
    </section>
  );
}

function Extracted({ result }: { result: DemoProviderResult }) {
  let i = 0;
  const delay = () => ({ animationDelay: `${i++ * 45}ms` });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {result.fields.map((f) => (
          <div
            key={f.label}
            style={delay()}
            className="field-in flex items-center justify-between gap-3 border-b border-border/60 py-1"
          >
            <span className="font-mono text-xs text-muted-foreground">
              {f.label}
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`tabular truncate font-mono text-xs ${f.ok ? "text-foreground" : "text-destructive line-through"}`}
              >
                {f.got || "—"}
              </span>
              <span
                className={`text-xs ${f.ok ? "text-primary" : "text-destructive"}`}
                aria-hidden
              >
                {f.ok ? "✓" : "✗"}
              </span>
            </span>
          </div>
        ))}
      </div>

      {result.diagnoses.length > 0 && (
        <div style={delay()} className="field-in">
          <span className="eyebrow text-ink-faint">Diagnoses</span>
          <ul className="mt-1 space-y-0.5">
            {result.diagnoses.map((d, k) => (
              <li key={k} className="font-mono text-xs text-foreground">
                <span className="text-primary">{d.icd10 ?? "—"}</span>{" "}
                {d.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.lines.length > 0 && (
        <div style={delay()} className="field-in">
          <span className="eyebrow text-ink-faint">Service lines</span>
          <ul className="mt-1 space-y-0.5">
            {result.lines.map((l, k) => (
              <li
                key={k}
                className="tabular flex items-baseline gap-2 font-mono text-xs text-foreground"
              >
                <span className="text-primary">{l.cpt ?? "—"}</span>
                <span className="flex-1 truncate text-muted-foreground">
                  {l.description}
                </span>
                <span>×{l.units}</span>
                <span>{cents(l.chargeCents)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
