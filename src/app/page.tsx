import { readFileSync } from "node:fs";
import path from "node:path";
import { BoundaryFrame } from "@/components/dashboard/boundary-frame";
import { EmptyState } from "@/components/dashboard/empty-state";
import { EgressHeadline } from "@/components/dashboard/egress-headline";
import { FieldAccuracy } from "@/components/dashboard/field-accuracy";
import { FootnoteStrip } from "@/components/dashboard/footnote";
import { DashboardHeader } from "@/components/dashboard/header";
import { MoneyTable } from "@/components/dashboard/money-table";
import type { MeasurementFile } from "@/lib/contract";

export const dynamic = "force-dynamic";

function loadMeasurement(): MeasurementFile | null {
  try {
    const raw = readFileSync(
      path.join(process.cwd(), "data/measurements/seed-1.json"),
      "utf8",
    );
    const parsed = JSON.parse(raw) as MeasurementFile;
    if (parsed.version !== 1 || !Array.isArray(parsed.results)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function Page() {
  const file = loadMeasurement();
  // Vercel injects the build commit; proves the readout is a real artifact.
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null;
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-9 px-5 py-12 sm:px-8">
      <div className="rise" style={{ "--i": 0 } as React.CSSProperties}>
        <DashboardHeader file={file} commit={commit} />
      </div>
      {file ? (
        <BoundaryFrame>
          <div className="rise" style={{ "--i": 1 } as React.CSSProperties}>
            <EgressHeadline results={file.results} />
          </div>
          <div className="rise" style={{ "--i": 2 } as React.CSSProperties}>
            <MoneyTable results={file.results} />
          </div>
          <div className="rise" style={{ "--i": 3 } as React.CSSProperties}>
            <FieldAccuracy results={file.results} />
          </div>
          <div className="rise" style={{ "--i": 4 } as React.CSSProperties}>
            <FootnoteStrip results={file.results} />
          </div>
        </BoundaryFrame>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
