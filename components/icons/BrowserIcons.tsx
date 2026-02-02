export function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 8V2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 14L3 20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16.5 14L21 20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function BraveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.89v5.43c0 4.3-2.98 8.32-7 9.5-4.02-1.18-7-5.2-7-9.5V8.07l7-3.89z" />
      <path d="M12 6L8 8.5V12l4 3 4-3V8.5L12 6z" />
    </svg>
  );
}

export function EdgeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v2.02c-2.83.48-5 2.94-5 5.91s2.17 5.43 5 5.91v2.02zm2 0v-2.02c2.83-.48 5-2.94 5-5.91 0-2.97-2.17-5.43-5-5.91V4.07c3.94.49 7 3.85 7 7.93s-3.06 7.44-7 7.93z" />
    </svg>
  );
}

export function OperaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <ellipse cx="12" cy="12" rx="4" ry="6" />
    </svg>
  );
}
