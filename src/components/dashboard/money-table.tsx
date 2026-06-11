import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { bytes, f1, ms, pct, usd } from "./format";

function EgressBadge({ n }: { n: number }) {
  if (n === 0) {
    return (
      <Badge className="border-primary/25 bg-primary/15 text-primary">
        0 B — never left the machine
      </Badge>
    );
  }
  return (
    <Badge className="border-amber-400/25 bg-amber-400/15 font-mono tabular-nums text-amber-300">
      {bytes(n)}
    </Badge>
  );
}

const NUM = "text-right font-mono tabular-nums";

function MeasuredRow({ m }: { m: EvalMetrics }) {
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
      <TableCell className={NUM}>{pct(m.parseRate)}</TableCell>
      <TableCell className={NUM}>{pct(m.fieldAccuracy)}</TableCell>
      <TableCell className={NUM}>{pct(m.exactMatchRate)}</TableCell>
      <TableCell className={NUM}>{f1(m.codeMatch.f1)}</TableCell>
      <TableCell className={NUM}>{f1(m.anomalyDetection.f1)}</TableCell>
      <TableCell className={NUM}>
        {ms(m.latencyMsP50)} / {ms(m.latencyMsP95)} ms
      </TableCell>
      <TableCell className={NUM}>{usd(m.costPerDocUsd)}</TableCell>
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider comparison</CardTitle>
        <CardDescription>
          Same documents, same prompts, same scoring — held-out eval split.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Provider</TableHead>
              <TableHead className="text-right">Parse rate</TableHead>
              <TableHead className="text-right">Field accuracy</TableHead>
              <TableHead className="text-right">Exact match</TableHead>
              <TableHead className="text-right">Code F1</TableHead>
              <TableHead className="text-right">Anomaly F1</TableHead>
              <TableHead className="text-right">p50 / p95 latency</TableHead>
              <TableHead className="text-right">$/doc</TableHead>
              <TableHead className="text-right">PHI egress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PROVIDERS.map((p) => {
              const m = byProvider.get(p);
              return m ? (
                <MeasuredRow key={p} m={m} />
              ) : (
                <UnmeasuredRow key={p} provider={p} />
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
