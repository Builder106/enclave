export function EnclaveMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect
        x="7"
        y="7"
        width="50"
        height="50"
        rx="14"
        stroke="#4FD1A5"
        strokeWidth="5"
      />
      <path
        d="M23 18h11l8 8v19H23Z"
        stroke="#8B98A5"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M34 18v8h8"
        stroke="#8B98A5"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M27.5 33h10M27.5 39h6.5"
        stroke="#4FD1A5"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M47 50v-2.5a4 4 0 0 1 8 0V50"
        stroke="#4FD1A5"
        strokeWidth="2.6"
      />
      <rect x="44.5" y="50" width="13" height="10" rx="2.5" fill="#4FD1A5" />
    </svg>
  );
}
