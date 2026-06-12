import { PROVIDERS, type MeasurementFile } from "@/lib/contract";
import { EnclaveMark } from "./mark";

// The report masthead: a clinical document header. Serif title, a status
// stamp, and a specimen/accession banner in mono — the requisition metadata
// a lab report carries before any result.
export function DashboardHeader({
  file,
  commit,
}: {
  file: MeasurementFile | null;
  commit: string | null;
}) {
  const meta = file
    ? [
        `specimen seed-${file.seed}`,
        `${file.docCount} documents`,
        `${file.split} split`,
        `${PROVIDERS.length} providers`,
        "panel ICD-10 + CPT",
        "store libSQL",
        ...(commit ? [`accession #${commit}`] : []),
      ]
    : ["no specimen on file"];

  return (
    <header className="flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <EnclaveMark className="size-10 shrink-0 text-primary" />
          <div>
            <h1 className="serif text-2xl font-semibold tracking-tight text-foreground">
              Enclave
            </h1>
            <p className="text-sm text-muted-foreground">
              Clinical document AI that never phones home.
            </p>
          </div>
        </div>
        {file ? (
          <span className="eyebrow flex items-center gap-1.5 rounded-sm border border-primary/35 px-2 py-1 text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            final
          </span>
        ) : null}
      </div>
      <div className="h-px w-full bg-primary/30" />
      <div className="eyebrow flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-ink-faint">
        <span className="text-muted-foreground">
          Clinical document extraction report
        </span>
        {meta.map((item) => (
          <span key={item} className="flex items-center gap-x-2.5">
            <span className="text-border">·</span>
            <span>{item}</span>
          </span>
        ))}
      </div>
    </header>
  );
}
