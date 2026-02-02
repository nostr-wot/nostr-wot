export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function ArrowDownIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className || "w-6 h-6"}
      style={style}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  );
}

export function LightningIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-7 h-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

export function LockOutlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-7 h-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

export function CodeOutlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-7 h-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

export function WotExtensionMiniIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" opacity="0.6">
        <line x1="24" y1="24" x2="24" y2="12" />
        <line x1="24" y1="24" x2="34" y2="17" />
        <line x1="24" y1="24" x2="12" y2="22" />
      </g>
    </svg>
  );
}
