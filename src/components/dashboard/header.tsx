import { Badge } from "@/components/ui/badge";
import type { MeasurementFile } from "@/lib/contract";
import { EnclaveMark } from "./mark";

export function DashboardHeader({ file }: { file: MeasurementFile | null }) {
  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-center gap-3.5">
        <EnclaveMark className="size-10 shrink-0" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Enclave</h1>
          <p className="text-sm text-muted-foreground">
            Clinical document AI that never phones home.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {file ? (
          <>
            <Badge variant="outline" className="font-mono tabular-nums">
              seed {file.seed}
            </Badge>
            <Badge variant="outline" className="font-mono tabular-nums">
              {file.docCount} docs · {file.split} split
            </Badge>
            <Badge variant="outline" className="font-mono tabular-nums">
              generated {file.generatedAt.slice(0, 10)}
            </Badge>
          </>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            no measurements on disk
          </Badge>
        )}
      </div>
    </header>
  );
}
