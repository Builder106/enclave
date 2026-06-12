import { PROVIDERS, type MeasurementFile } from "@/lib/contract";
import { EnclaveMark } from "./mark";

// Metadata strip proves what was built before any prose: the methodology,
// the schema, the storage, and the build commit — all in mono.
function MetaStrip({ items }: { items: string[] }) {
  return (
    <div className="eyebrow flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-ink-faint">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-x-2.5">
          {i > 0 && <span className="text-border">/</span>}
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
}

export function DashboardHeader({
  file,
  commit,
}: {
  file: MeasurementFile | null;
  commit: string | null;
}) {
  const meta = file
    ? [
        `seed ${file.seed}`,
        `${file.docCount} docs`,
        `${file.split} split`,
        `${PROVIDERS.length} providers`,
        "ICD-10 + CPT",
        "libSQL",
        ...(commit ? [`#${commit}`] : []),
      ]
    : ["no measurements on disk"];

  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center gap-3.5">
        <EnclaveMark className="size-10 shrink-0" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Enclave</h1>
          <p className="text-sm text-muted-foreground">
            Clinical document AI that never phones home.
          </p>
        </div>
      </div>
      <MetaStrip items={meta} />
    </header>
  );
}
