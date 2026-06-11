import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type EvalMetrics, type FieldScore } from "@/lib/contract";
import { pct } from "./format";

const GROUP_ORDER = ["patient", "encounter", "payer", "totals"] as const;
type Group = (typeof GROUP_ORDER)[number];

const GROUP_LABELS: Record<Group, string> = {
  patient: "Patient",
  encounter: "Encounter",
  payer: "Payer",
  totals: "Totals",
};

function groupOf(field: string): Group {
  const head = field.split(".")[0];
  return (GROUP_ORDER as readonly string[]).includes(head)
    ? (head as Group)
    : "totals";
}

function labelOf(field: string): string {
  if (field === "printedTotalCents") return "printed total";
  const dot = field.indexOf(".");
  return dot === -1 ? field : field.slice(dot + 1);
}

function FieldBar({ score }: { score: FieldScore }) {
  const acc = score.total === 0 ? 0 : score.correct / score.total;
  return (
    <Progress value={acc * 100} className="gap-x-3 gap-y-1.5">
      <ProgressLabel className="font-mono text-xs font-normal text-foreground/85">
        {labelOf(score.field)}
      </ProgressLabel>
      <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
        {score.correct}/{score.total} · {pct(acc)}
      </span>
    </Progress>
  );
}

function ProviderPanel({ m }: { m: EvalMetrics }) {
  const groups = new Map<Group, FieldScore[]>();
  for (const f of m.perField) {
    const g = groupOf(f.field);
    const list = groups.get(g) ?? [];
    list.push(f);
    groups.set(g, list);
  }
  return (
    <div className="grid gap-x-10 gap-y-7 pt-4 sm:grid-cols-2">
      {GROUP_ORDER.filter((g) => groups.has(g)).map((g) => (
        <section key={g} className="space-y-3.5">
          <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {GROUP_LABELS[g]}
          </h3>
          {groups.get(g)!.map((f) => (
            <FieldBar key={f.field} score={f} />
          ))}
        </section>
      ))}
    </div>
  );
}

export function FieldAccuracy({ results }: { results: EvalMetrics[] }) {
  if (results.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Per-field accuracy</CardTitle>
        <CardDescription>
          Scalar fields scored exact-match against generator ground truth.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={results[0].provider}>
          <TabsList>
            {results.map((m) => (
              <TabsTrigger key={m.provider} value={m.provider}>
                {m.provider}
              </TabsTrigger>
            ))}
          </TabsList>
          {results.map((m) => (
            <TabsContent key={m.provider} value={m.provider}>
              <ProviderPanel m={m} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
