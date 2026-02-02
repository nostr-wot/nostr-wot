"use client";

export function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M32 4L8 14v18c0 14.4 10.4 27.2 24 30 13.6-2.8 24-15.6 24-30V14L32 4z"
        fill="url(#shieldGrad)"
        className="animate-shield-pulse"
      />
      <path
        d="M26 32l6 6 12-12"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-checkmark"
      />
    </svg>
  );
}

export function NetworkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <g className="animate-network-pulse">
        <circle cx="32" cy="32" r="6" fill="#6366f1" />
        <circle cx="16" cy="16" r="4" fill="#8b5cf6" />
        <circle cx="48" cy="16" r="4" fill="#8b5cf6" />
        <circle cx="16" cy="48" r="4" fill="#8b5cf6" />
        <circle cx="48" cy="48" r="4" fill="#8b5cf6" />
        <line x1="32" y1="32" x2="16" y2="16" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.5" />
        <line x1="32" y1="32" x2="48" y2="16" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.5" />
        <line x1="32" y1="32" x2="16" y2="48" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.5" />
        <line x1="32" y1="32" x2="48" y2="48" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.5" />
      </g>
      <circle cx="8" cy="32" r="3" fill="#a5b4fc" className="animate-node-appear" style={{ animationDelay: "0.2s" }} />
      <circle cx="56" cy="32" r="3" fill="#a5b4fc" className="animate-node-appear" style={{ animationDelay: "0.4s" }} />
      <circle cx="32" cy="8" r="3" fill="#a5b4fc" className="animate-node-appear" style={{ animationDelay: "0.6s" }} />
      <circle cx="32" cy="56" r="3" fill="#a5b4fc" className="animate-node-appear" style={{ animationDelay: "0.8s" }} />
    </svg>
  );
}

export function SpeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <circle cx="32" cy="32" r="26" stroke="#6366f1" strokeWidth="3" strokeOpacity="0.3" />
      <path
        d="M32 6a26 26 0 0 1 0 52"
        stroke="url(#speedGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        className="animate-speed-arc"
      />
      <defs>
        <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path
        d="M32 32l8-14"
        stroke="#6366f1"
        strokeWidth="3"
        strokeLinecap="round"
        className="animate-needle"
        style={{ transformOrigin: "32px 32px" }}
      />
      <circle cx="32" cy="32" r="4" fill="#6366f1" />
    </svg>
  );
}

export function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <rect
        x="14"
        y="28"
        width="36"
        height="28"
        rx="4"
        fill="#6366f1"
        className="animate-lock-body"
      />
      <path
        d="M22 28V20a10 10 0 0 1 20 0v8"
        stroke="#8b5cf6"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        className="animate-lock-shackle"
      />
      <circle cx="32" cy="42" r="4" fill="white" />
      <rect x="30" y="44" width="4" height="6" rx="2" fill="white" />
    </svg>
  );
}

export function CodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <rect x="8" y="8" width="48" height="48" rx="8" fill="#1f2937" />
      <path
        d="M24 24l-8 8 8 8"
        stroke="#6366f1"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-code-left"
      />
      <path
        d="M40 24l8 8-8 8"
        stroke="#8b5cf6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-code-right"
      />
      <line
        x1="36"
        y1="20"
        x2="28"
        y2="44"
        stroke="#22c55e"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-code-slash"
      />
    </svg>
  );
}

export function PuzzleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path
        d="M28 8h8v4a4 4 0 0 0 8 0V8h12v12h-4a4 4 0 0 0 0 8h4v12H44v-4a4 4 0 0 0-8 0v4H24v-4a4 4 0 0 0-8 0v4H8V36h4a4 4 0 0 0 0-8H8V16h12v4a4 4 0 0 0 8 0V8z"
        fill="#6366f1"
        className="animate-puzzle-float"
      />
    </svg>
  );
}

export function ServerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <rect x="12" y="8" width="40" height="16" rx="3" fill="#6366f1" className="animate-server-pulse" />
      <rect x="12" y="28" width="40" height="16" rx="3" fill="#8b5cf6" className="animate-server-pulse" style={{ animationDelay: "0.3s" }} />
      <rect x="12" y="48" width="40" height="16" rx="3" fill="#a5b4fc" className="animate-server-pulse" style={{ animationDelay: "0.6s" }} />
      <circle cx="20" cy="16" r="2" fill="#22c55e" className="animate-blink" />
      <circle cx="20" cy="36" r="2" fill="#22c55e" className="animate-blink" style={{ animationDelay: "0.5s" }} />
      <circle cx="20" cy="56" r="2" fill="#22c55e" className="animate-blink" style={{ animationDelay: "1s" }} />
      <rect x="28" y="14" width="16" height="4" rx="1" fill="white" fillOpacity="0.3" />
      <rect x="28" y="34" width="16" height="4" rx="1" fill="white" fillOpacity="0.3" />
      <rect x="28" y="54" width="16" height="4" rx="1" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

export function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path
        d="M32 8c-10 0-18 8-18 18v12l-4 4v4h44v-4l-4-4V26c0-10-8-18-18-18z"
        fill="#6366f1"
        className="animate-bell-ring"
        style={{ transformOrigin: "32px 8px" }}
      />
      <circle cx="32" cy="54" r="6" fill="#8b5cf6" />
    </svg>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <circle
        cx="28"
        cy="28"
        r="16"
        stroke="#6366f1"
        strokeWidth="4"
        fill="none"
        className="animate-search-pulse"
      />
      <line
        x1="40"
        y1="40"
        x2="54"
        y2="54"
        stroke="#8b5cf6"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="28" cy="28" r="8" fill="#6366f1" fillOpacity="0.2" />
    </svg>
  );
}

export function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path
        d="M32 4l8 16 18 3-13 13 3 18-16-8-16 8 3-18L6 23l18-3 8-16z"
        fill="#6366f1"
        className="animate-star-shine"
      />
    </svg>
  );
}

export function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="10" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2" />
      <path d="M8 12l3 3 5-6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
