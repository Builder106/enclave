import { PROVIDER_LABELS, type EvalMetrics } from "@/lib/contract";
import { bytes } from "./format";

// Chain of custody, in clinical-report terms: which providers kept the
// specimen contained on-device (0 bytes) vs released it off-site. The
// off-site card carries an abnormal-flag treatment (▲, dashed amber rule).
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
        <span>Chain of custody</span>
        <span className="text-border">·</span>
        <span>specimen bytes released off-site</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-sm border border-primary/30 bg-primary/[0.05] p-5">
          <div className="eyebrow flex items-center gap-2 text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>contained</span>
          </div>
          <div className="tabular mt-3 font-mono text-3xl font-medium text-primary">
            0 bytes
          </div>
          <div className="mt-1.5 text-sm font-medium text-foreground">
            never left the machine
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {onDevice.length
              ? `${names(onDevice)} — PHI processed on-device`
              : "—"}
          </div>
        </div>

        <div className="rounded-sm border border-dashed border-egress/55 bg-egress/[0.05] p-5">
          <div className="eyebrow flex items-center gap-2 text-egress">
            <span aria-hidden>&#9650;</span>
            <span>transmitted off-site</span>
          </div>
          <div className="tabular mt-3 font-mono text-3xl font-medium text-egress">
            {offDevice.length ? bytes(maxOff) : "—"}
          </div>
          <div className="mt-1.5 text-sm font-medium text-foreground">
            sent to the cloud
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {offDevice.length
              ? `${names(offDevice)} — released for processing`
              : "no hosted provider measured yet"}
          </div>
        </div>
      </div>
    </section>
  );
}
