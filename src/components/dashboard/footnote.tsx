import { Separator } from "@/components/ui/separator";
import type { EvalMetrics } from "@/lib/contract";

export function FootnoteStrip({ results }: { results: EvalMetrics[] }) {
  return (
    <footer className="space-y-4">
      <Separator />
      <dl className="grid gap-x-10 gap-y-3 text-xs sm:grid-cols-[auto_1fr]">
        <dt className="text-muted-foreground/70">models</dt>
        <dd className="font-mono text-muted-foreground">
          {results.map((r) => `${r.provider} → ${r.model}`).join("   ·   ")}
        </dd>
        <dt className="text-muted-foreground/70">repro</dt>
        <dd className="font-mono text-muted-foreground">
          pnpm generate · pnpm measure --provider rules|local|bedrock
        </dd>
        <dt className="text-muted-foreground/70">docs</dt>
        <dd>
          <a
            href="docs/BRIEF.md"
            className="font-mono text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            docs/BRIEF.md
          </a>
        </dd>
      </dl>
    </footer>
  );
}
