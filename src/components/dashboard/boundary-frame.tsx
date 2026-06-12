import type { ReactNode } from "react";

// The signature element: the measured readout is a sealed territory. A
// labelled, fortified perimeter (the geographic-enclave border) wraps a
// lifted secure interior (the security-enclave isolated region); the page
// around it is foreign space. The whole "never phones home" thesis lives
// inside this wall.
function Corner({ position }: { position: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute size-3 border-primary/55 ${position}`}
    />
  );
}

export function BoundaryFrame({ children }: { children: ReactNode }) {
  return (
    <div className="enclave-interior relative rounded-md border border-primary/30 px-4 py-8 sm:px-7">
      <span className="eyebrow absolute -top-[8px] left-5 bg-background px-2 text-primary/75">
        Enclave · on-device boundary
      </span>
      <span className="eyebrow absolute -top-[8px] right-5 flex items-center gap-1.5 bg-background px-2 text-primary/75">
        <span className="size-1.5 rounded-full bg-primary" />
        sealed
      </span>
      <Corner position="left-[-1px] top-[-1px] border-l border-t" />
      <Corner position="right-[-1px] top-[-1px] border-r border-t" />
      <Corner position="bottom-[-1px] left-[-1px] border-b border-l" />
      <Corner position="right-[-1px] bottom-[-1px] border-r border-b" />
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  );
}
