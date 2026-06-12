import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PROVIDERS,
  PROVIDER_LABELS,
  type EvalMetrics,
  type Provider,
} from "@/lib/contract";
import { cn } from "@/lib/utils";
import { bytes, f1, latency, pct, usd } from "./format";
import { PanelHeading } from "./panel-heading";

// Per-column "winner": the best value among measured providers. The comparison
// is the product — accent the leader in each column so it reads at a glance.
const COLS = [
  { key: "parseRate", better: "max", value: (m: EvalMetrics) => m.parseRate },
  { key: "fieldAccuracy", better: "max", value: (m: EvalMetrics) => m.fieldAccuracy },
  { key: "exactMatchRate", better: "max", value: (m: EvalMetrics) => m.exactMatchRate },
  { key: "codeF1", better: "max", value: (m: EvalMetrics) => m.codeMatch.f1 },
  { key: "anomalyF1", better: "max", value: (m: EvalMetrics) => m.anomalyDetection.f1 },
  { key: "latency", better: "min", value: (m: EvalMetrics) => m.latencyMsP50 },
  { key: "cost", better: "min", value: (m: EvalMetrics) => m.costPerDocUsd },
] as const;

function bestValues(results: EvalMetrics[]): Record<string, number> {
  const best: Record<string, number> = {};
  for (const c of COLS) {
    const vals = results.map(c.value);
    best[c.key] = c.better === "max" ? Math.max(...vals) : Math.min(...vals);
  }
  return best;
}

const NUM = "tabular text-right font-mono";

/** Accent the winning cell; ties (e.g. two $0 rows) all win. */
function cell(isBest: boolean): string {
  return cn(NUM, isBest ? "text-primary" : "text-foreground");
}

function EgressBadge({ n }: { n: number }) {
  if (n === 0) {
    return (
      <Badge className="tabular rounded-sm border-primary/25 bg-primary/15 font-mono font-normal text-primary">
        0 B
      </Badge>
    );
  }
  return (
    <Badge className="tabular rounded-sm border-egress/30 bg-egress/15 font-mono font-normal text-egress">
      {bytes(n)}
    </Badge>
  );
}

function MeasuredRow({
  m,
  best,
}: {
  m: EvalMetrics;
  best: Record<string, number>;
}) {
  const EPS = 1e-9;
  const is = (key: string, v: number) => Math.abs(v - best[key]) < EPS;
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-foreground">
          {PROVIDER_LABELS[m.provider]}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {m.provider}
        </div>
      </TableCell>
      <TableCell className={cell(is("parseRate", m.parseRate))}>
        {pct(m.parseRate)}
      </TableCell>
      <TableCell className={cell(is("fieldAccuracy", m.fieldAccuracy))}>
        {pct(m.fieldAccuracy)}
      </TableCell>
      <TableCell className={cell(is("exactMatchRate", m.exactMatchRate))}>
        {pct(m.exactMatchRate)}
      </TableCell>
      <TableCell className={cell(is("codeF1", m.codeMatch.f1))}>
        {f1(m.codeMatch.f1)}
      </TableCell>
      <TableCell className={cell(is("anomalyF1", m.anomalyDetection.f1))}>
        {f1(m.anomalyDetection.f1)}
      </TableCell>
      <TableCell className={cell(is("latency", m.latencyMsP50))}>
        {latency(m.latencyMsP50)} / {latency(m.latencyMsP95)}
      </TableCell>
      <TableCell className={cell(is("cost", m.costPerDocUsd))}>
        {usd(m.costPerDocUsd)}
      </TableCell>
      <TableCell className="text-right">
        <EgressBadge n={m.egressBytesTotal} />
      </TableCell>
    </TableRow>
  );
}

function UnmeasuredRow({ provider }: { provider: Provider }) {
  return (
    <TableRow className="text-muted-foreground">
      <TableCell>
        <div>{PROVIDER_LABELS[provider]}</div>
        <div className="font-mono text-xs text-muted-foreground/60">
          {provider}
        </div>
      </TableCell>
      <TableCell colSpan={8} className="text-muted-foreground/60">
        not yet measured —{" "}
        <code className="font-mono text-muted-foreground">
          pnpm measure --provider {provider}
        </code>
      </TableCell>
    </TableRow>
  );
}

export function MoneyTable({ results }: { results: EvalMetrics[] }) {
  const byProvider = new Map(results.map((r) => [r.provider, r]));
  const best = bestValues(results);
  return (
    <section>
      <PanelHeading
        index="01"
        title="Provider comparison"
        note="Same documents, same prompts, same scoring — held-out eval split."
      />
      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Provider</TableHead>
              <TableHead className="text-right">Parse rate</TableHead>
              <TableHead className="text-right">Field accuracy</TableHead>
              <TableHead className="text-right">Exact match</TableHead>
              <TableHead className="text-right">Code F1</TableHead>
              <TableHead className="text-right">Anomaly F1</TableHead>
              <TableHead className="text-right">Latency p50 / p95</TableHead>
              <TableHead className="text-right">$/doc</TableHead>
              <TableHead className="text-right">PHI egress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PROVIDERS.map((p) => {
              const m = byProvider.get(p);
              return m ? (
                <MeasuredRow key={p} m={m} best={best} />
              ) : (
                <UnmeasuredRow key={p} provider={p} />
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-primary">Accent</span> marks the best
        in each column. <span className="text-primary">PHI egress</span> is the
        bytes of document content sent off-machine —{" "}
        <span className="text-primary">0 B</span> means the model ran on-device
        and nothing left it.
      </p>
    </section>
  );
}
