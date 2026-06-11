import { Card, CardContent } from "@/components/ui/card";
import { EnclaveMark } from "./mark";

export function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-7 py-16 text-center">
        <EnclaveMark className="size-12 opacity-50" />
        <div className="space-y-1.5">
          <h2 className="text-base font-medium">No measurements yet</h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            This panel renders{" "}
            <code className="font-mono text-foreground/80">
              data/measurements/seed-1.json
            </code>
            . Generate the synthetic corpus, then run the eval against at
            least one provider:
          </p>
        </div>
        <pre className="w-full max-w-md rounded-lg bg-muted/60 px-5 py-4 text-left font-mono text-sm leading-7 ring-1 ring-border">
          <code>
            <span className="select-none text-primary">$ </span>pnpm generate
            {"\n"}
            <span className="select-none text-primary">$ </span>pnpm measure
            --provider rules
          </code>
        </pre>
        <p className="text-xs text-muted-foreground/70">
          The rules baseline is deterministic and fully offline — no model
          required.
        </p>
      </CardContent>
    </Card>
  );
}
