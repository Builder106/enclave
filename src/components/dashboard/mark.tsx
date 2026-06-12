// The Enclave mark: four corner brackets sealing a contained core — the same
// on-device containment boundary that frames the dashboard. One mark, reused
// as favicon (app/icon.svg) and apple-touch-icon (scripts/make-icons.ts).
export function EnclaveMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none">
      <g
        stroke="#3dbe8b"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 19V14a6 6 0 0 1 6-6h5" />
        <path d="M45 8h5a6 6 0 0 1 6 6v5" />
        <path d="M56 45v5a6 6 0 0 1-6 6h-5" />
        <path d="M19 56h-5a6 6 0 0 1-6-6v-5" />
      </g>
      <rect x="24" y="24" width="16" height="16" rx="4.5" fill="#3dbe8b" />
    </svg>
  );
}
