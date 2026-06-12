import type { ReactNode } from "react";

// The signature element: the measured readout sits *inside* a sealed
// on-device boundary. A labelled perimeter with accent corner-marks — the
// instrument cell that the whole "never phones home" thesis lives in.
function Corner({ position }: { position: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute size-3 border-primary/45 ${position}`}
    />
  );
}

export function BoundaryFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-md border border-border/70 px-4 py-8 sm:px-7">
      <span className="eyebrow absolute -top-[8px] left-5 bg-background px-2 text-primary/70">
        Enclave · on-device boundary
      </span>
      <Corner position="left-[-1px] top-[-1px] border-l border-t" />
      <Corner position="right-[-1px] top-[-1px] border-r border-t" />
      <Corner position="bottom-[-1px] left-[-1px] border-b border-l" />
      <Corner position="right-[-1px] bottom-[-1px] border-r border-b" />
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  );
}
