import { PROVIDER_LABELS, type EvalMetrics } from "@/lib/contract";
import { bytes } from "./format";

// The thesis, stated before the table: local/rules keep PHI on-device (0 bytes);
// hosted accuracy is bought with bytes leaving the machine.
export function EgressHeadline({ results }: { results: EvalMetrics[] }) {
  if (results.length === 0) return null;
  const onDevice = results.filter((r) => r.egressBytesTotal === 0);
  const offDevice = results.filter((r) => r.egressBytesTotal > 0);
  const maxOff = offDevice.length
    ? Math.max(...offDevice.map((r) => r.egressBytesTotal))
    : 0;

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-5">
        <div className="font-mono text-3xl font-semibold tabular-nums text-primary">
          0 bytes
        </div>
        <div className="mt-1.5 text-sm font-medium text-foreground">
          never left the machine
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {onDevice.length
            ? onDevice.map((r) => PROVIDER_LABELS[r.provider]).join(" · ")
            : "—"}{" "}
          — PHI stays on-device
        </div>
      </div>
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-5">
        <div className="font-mono text-3xl font-semibold tabular-nums text-amber-300">
          {offDevice.length ? bytes(maxOff) : "—"}
        </div>
        <div className="mt-1.5 text-sm font-medium text-foreground">
          sent to the cloud
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {offDevice.length
            ? `${offDevice.map((r) => PROVIDER_LABELS[r.provider]).join(" · ")} — accuracy paid in bytes`
            : "no hosted provider measured yet"}
        </div>
      </div>
    </section>
  );
}
