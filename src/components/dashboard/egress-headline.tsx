import { PROVIDER_LABELS, type EvalMetrics } from "@/lib/contract";
import { bytes } from "./format";

// The thesis, stated before the table: local/rules keep PHI on-device (seal
// intact, 0 bytes); hosted accuracy is bought with bytes crossing the wall.
// Solid border = contained; dashed = breached.
export function EgressHeadline({ results }: { results: EvalMetrics[] }) {
  if (results.length === 0) return null;
  const onDevice = results.filter((r) => r.egressBytesTotal === 0);
  const offDevice = results.filter((r) => r.egressBytesTotal > 0);
  const maxOff = offDevice.length
    ? Math.max(...offDevice.map((r) => r.egressBytesTotal))
    : 0;
  const names = (rs: EvalMetrics[]) =>
    rs.map((r) => PROVIDER_LABELS[r.provider]).join(" · ");

  return (
    <section className="space-y-3">
      <div className="eyebrow flex items-center gap-2 text-ink-faint">
        <span>Egress</span>
        <span className="text-border">/</span>
        <span>bytes that cross the border</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-primary/35 bg-primary/[0.06] p-5">
          <div className="flex items-center gap-2 text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="eyebrow">seal intact</span>
          </div>
          <div className="tabular mt-3 font-mono text-3xl font-medium text-primary">
            0 bytes
          </div>
          <div className="mt-1.5 text-sm font-medium text-foreground">
            never left the machine
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {onDevice.length ? `${names(onDevice)} — PHI stays on-device` : "—"}
          </div>
        </div>

        <div className="rounded-md border border-dashed border-egress/45 bg-egress/[0.05] p-5">
          <div className="flex items-center gap-2 text-egress">
            <span className="size-1.5 rounded-full bg-egress" />
            <span className="eyebrow">boundary crossed</span>
          </div>
          <div className="tabular mt-3 font-mono text-3xl font-medium text-egress">
            {offDevice.length ? bytes(maxOff) : "—"}
          </div>
          <div className="mt-1.5 text-sm font-medium text-foreground">
            sent to the cloud
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {offDevice.length
              ? `${names(offDevice)} — accuracy paid in bytes`
              : "no hosted provider measured yet"}
          </div>
        </div>
      </div>
    </section>
  );
}
