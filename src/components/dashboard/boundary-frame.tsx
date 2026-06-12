import type { ReactNode } from "react";

// The report sheet: white clinical paper lifted off the desk, marked with
// faint corner crop-marks (a printed-document signal) and an issuance line.
// "Issued on-device" is the privacy thesis stated as report provenance.
function Crop({ position }: { position: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute size-2.5 border-ink-faint/40 ${position}`}
    />
  );
}

export function BoundaryFrame({ children }: { children: ReactNode }) {
  return (
    <div className="report-sheet relative rounded-sm px-5 py-7 sm:px-8">
      <Crop position="left-[-7px] top-[-7px] border-l border-t" />
      <Crop position="right-[-7px] top-[-7px] border-r border-t" />
      <Crop position="bottom-[-7px] left-[-7px] border-b border-l" />
      <Crop position="right-[-7px] bottom-[-7px] border-r border-b" />
      <div className="eyebrow mb-5 flex items-center gap-2 text-ink-faint">
        <span className="size-1.5 rounded-full bg-primary" />
        <span>Enclave · issued on-device</span>
      </div>
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  );
}
