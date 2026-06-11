import { readFileSync } from "node:fs";
import path from "node:path";
import { EmptyState } from "@/components/dashboard/empty-state";
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
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <DashboardHeader file={file} />
      {file ? (
        <>
          <MoneyTable results={file.results} />
          <FieldAccuracy results={file.results} />
          <FootnoteStrip results={file.results} />
        </>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
