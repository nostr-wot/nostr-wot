import type { CSSProperties } from "react";

interface PitchIconProps {
  className?: string;
  style?: CSSProperties;
}

export function PitchNetworkGraph({ className, style }: PitchIconProps) {
  return (
    <svg
      className={className || "w-28 h-28"}
      viewBox="0 0 110 110"
      fill="none"
      style={style}
    >
      <style>
        {`
          @keyframes pitch-node-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .pnf { animation: pitch-node-float 3s ease-in-out infinite; }
          .pnf:nth-child(3) { animation-delay: 0.4s; }
          .pnf:nth-child(4) { animation-delay: 0.8s; }
          .pnf:nth-child(5) { animation-delay: 1.2s; }
          .pnf:nth-child(6) { animation-delay: 1.6s; }
        `}
      </style>
      <line x1="55" y1="55" x2="22" y2="30" stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1="55" y1="55" x2="88" y2="30" stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1="55" y1="55" x2="85" y2="78" stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1="55" y1="55" x2="25" y2="80" stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1="22" y1="30" x2="8" y2="14" stroke="#e0e7ff" strokeWidth="1" />
      <line x1="88" y1="30" x2="102" y2="14" stroke="#e0e7ff" strokeWidth="1" />
      <circle className="pnf" cx="55" cy="55" r="14" fill="#6366f1" />
      <circle className="pnf" cx="22" cy="30" r="9" fill="#6366f1" opacity=".8" />
      <circle className="pnf" cx="88" cy="30" r="7" fill="#a5b4fc" />
      <circle className="pnf" cx="85" cy="78" r="8" fill="#6366f1" opacity=".7" />
      <circle className="pnf" cx="25" cy="80" r="6" fill="#a5b4fc" opacity=".8" />
      <circle cx="8" cy="14" r="4" fill="#e0e7ff" />
      <circle cx="102" cy="14" r="4" fill="#e0e7ff" />
    </svg>
  );
}

export function PitchCentralizeIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      {/* Central hub */}
      <circle cx="28" cy="28" r="10" fill="#ef4444" />
      <circle cx="28" cy="28" r="6" fill="#fff" opacity=".3" />
      {/* Spokes to isolated clients */}
      <line x1="28" y1="18" x2="28" y2="6" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="37" y1="22" x2="46" y2="13" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="38" y1="28" x2="50" y2="28" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="37" y1="34" x2="46" y2="43" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="28" y1="38" x2="28" y2="50" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="19" y1="34" x2="10" y2="43" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="18" y1="28" x2="6" y2="28" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="19" y1="22" x2="10" y2="13" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Client nodes — isolated */}
      <rect x="23" y="1" width="10" height="8" rx="2" fill="#0a0a0a" />
      <rect x="41" y="8" width="10" height="8" rx="2" fill="#0a0a0a" />
      <rect x="45" y="24" width="10" height="8" rx="2" fill="#0a0a0a" />
      <rect x="41" y="40" width="10" height="8" rx="2" fill="#0a0a0a" />
      <rect x="23" y="47" width="10" height="8" rx="2" fill="#0a0a0a" />
      <rect x="5" y="40" width="10" height="8" rx="2" fill="#0a0a0a" />
      <rect x="1" y="24" width="10" height="8" rx="2" fill="#0a0a0a" />
      <rect x="5" y="8" width="10" height="8" rx="2" fill="#0a0a0a" />
    </svg>
  );
}

export function PitchBrokenUXIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      {/* Browser window frame */}
      <rect x="4" y="6" width="48" height="44" rx="5" fill="#0a0a0a" stroke="#ef4444" strokeWidth="1.5" />
      {/* Title bar */}
      <rect x="4" y="6" width="48" height="10" rx="5" fill="#1a1a1a" />
      <circle cx="12" cy="11" r="2" fill="#ef4444" />
      <circle cx="19" cy="11" r="2" fill="#ef4444" opacity=".4" />
      <circle cx="26" cy="11" r="2" fill="#ef4444" opacity=".2" />
      {/* Crack lines */}
      <path d="M28 18l-4 8 6 3-8 9" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 26l-6 2" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" opacity=".6" />
      <path d="M34 21l3 5" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" opacity=".6" />
      {/* Error fragments */}
      <rect x="36" y="22" width="8" height="2" rx="1" fill="#ef4444" opacity=".3" />
      <rect x="10" y="34" width="10" height="2" rx="1" fill="#ef4444" opacity=".3" />
      <rect x="34" y="38" width="12" height="2" rx="1" fill="#ef4444" opacity=".2" />
    </svg>
  );
}

export function PitchNetworkGraphSmall({ className, style }: PitchIconProps) {
  return (
    <svg
      className={className || "w-14 h-14"}
      viewBox="0 0 54 54"
      fill="none"
      style={style}
    >
      <line x1="27" y1="27" x2="10" y2="14" stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1="27" y1="27" x2="44" y2="14" stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1="27" y1="27" x2="42" y2="42" stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1="27" y1="27" x2="12" y2="42" stroke="#a5b4fc" strokeWidth="1.5" />
      <circle cx="27" cy="27" r="9" fill="#6366f1" />
      <circle cx="10" cy="14" r="5" fill="#6366f1" opacity=".75" />
      <circle cx="44" cy="14" r="4" fill="#a5b4fc" />
      <circle cx="42" cy="42" r="5" fill="#6366f1" opacity=".6" />
      <circle cx="12" cy="42" r="4" fill="#a5b4fc" opacity=".8" />
    </svg>
  );
}

export function PitchVerifyPinIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      {/* Map pin */}
      <path d="M28 4C19.16 4 12 11.16 12 20c0 13 16 32 16 32s16-19 16-32C44 11.16 36.84 4 28 4z" fill="#6366f1" />
      {/* Star inside pin */}
      <path d="M28 12l2.4 4.8 5.3.8-3.8 3.7.9 5.3L28 24l-4.8 2.6.9-5.3-3.8-3.7 5.3-.8z" fill="#fff" />
      {/* Verification badge */}
      <circle cx="42" cy="10" r="8" fill="#22c55e" />
      <path d="M38.5 10l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PitchMapPinIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      <path d="M28 4C19.16 4 12 11.16 12 20c0 13 16 32 16 32s16-19 16-32C44 11.16 36.84 4 28 4z" fill="#6366f1" />
      <circle cx="28" cy="20" r="6" fill="#fff" />
      <ellipse cx="28" cy="52" rx="8" ry="2.5" fill="#0a0a0a" opacity=".1" />
    </svg>
  );
}

export function PitchSpamIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      <rect x="4" y="10" width="48" height="30" rx="6" fill="#f5f4ff" stroke="#6366f1" strokeWidth="2" />
      <rect x="10" y="18" width="18" height="3" rx="1.5" fill="#a5b4fc" />
      <rect x="10" y="24" width="28" height="3" rx="1.5" fill="#a5b4fc" opacity=".5" />
      <rect x="10" y="30" width="14" height="3" rx="1.5" fill="#a5b4fc" opacity=".3" />
      <path d="M14 40l6 6h22" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="44" cy="12" r="10" fill="#ef4444" />
      <rect x="42.5" y="7" width="3" height="7" rx="1.5" fill="#fff" />
      <circle cx="44" cy="17" r="1.5" fill="#fff" />
    </svg>
  );
}

export function PitchLockIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      <rect x="10" y="26" width="36" height="24" rx="5" fill="#6366f1" />
      <path d="M18 26v-8a10 10 0 0 1 20 0v8" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="28" cy="38" r="4" fill="#fff" />
      <rect x="26.5" y="38" width="3" height="6" rx="1.5" fill="#fff" />
    </svg>
  );
}

export function PitchServerIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      <rect x="6" y="8" width="44" height="12" rx="4" fill="#0a0a0a" />
      <rect x="6" y="24" width="44" height="12" rx="4" fill="#0a0a0a" />
      <rect x="6" y="40" width="44" height="12" rx="4" fill="#0a0a0a" />
      <circle cx="43" cy="14" r="3" fill="#6366f1" />
      <circle cx="43" cy="30" r="3" fill="#a5b4fc" />
      <circle cx="43" cy="46" r="3" fill="#6366f1" opacity=".5" />
      <rect x="12" y="12" width="16" height="2.5" rx="1.25" fill="#6366f1" />
      <rect x="12" y="28" width="20" height="2.5" rx="1.25" fill="#a5b4fc" />
      <rect x="12" y="44" width="12" height="2.5" rx="1.25" fill="#6366f1" opacity=".5" />
    </svg>
  );
}

export function PitchCodeIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      <rect x="4" y="8" width="48" height="40" rx="6" fill="#0a0a0a" />
      <circle cx="13" cy="16" r="2.5" fill="#ef4444" />
      <circle cx="21" cy="16" r="2.5" fill="#f59e0b" />
      <circle cx="29" cy="16" r="2.5" fill="#22c55e" />
      <path d="M10 26l7 5-7 5" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 26l-7 5 7 5" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="24" y="29" width="8" height="3" rx="1.5" fill="#6366f1" />
    </svg>
  );
}

export function PitchShieldIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      <path d="M28 4L8 12v18c0 12 9.5 21 20 24 10.5-3 20-12 20-24V12L28 4z" fill="#6366f1" />
      <path d="M28 4L8 12v18c0 12 9.5 21 20 24 10.5-3 20-12 20-24V12L28 4z" fill="white" opacity=".1" />
      <path d="M17 28l7 7 15-15" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PitchPlayIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-16 h-16"} viewBox="0 0 64 64" fill="none" style={style}>
      <circle cx="32" cy="32" r="30" fill="#0a0a0a" />
      <path d="M25 20l20 12-20 12V20z" fill="#6366f1" />
    </svg>
  );
}

export function PitchIdentityIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      {/* Main user */}
      <circle cx="28" cy="18" r="8" fill="#6366f1" />
      <path d="M14 44c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Key */}
      <circle cx="42" cy="14" r="5" fill="none" stroke="#a5b4fc" strokeWidth="2" />
      <line x1="46" y1="17" x2="52" y2="23" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="21" x2="52" y2="19" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
      {/* Second account dot */}
      <circle cx="10" cy="36" r="4" fill="#a5b4fc" opacity=".6" />
      <circle cx="10" cy="28" r="3" fill="#a5b4fc" opacity=".4" />
    </svg>
  );
}

export function PitchDocsIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      {/* Book / open document */}
      <rect x="8" y="6" width="40" height="44" rx="4" fill="#0a0a0a" stroke="#6366f1" strokeWidth="2" />
      {/* Spine */}
      <line x1="20" y1="6" x2="20" y2="50" stroke="#6366f1" strokeWidth="1.5" />
      {/* Text lines */}
      <rect x="25" y="14" width="16" height="2.5" rx="1.25" fill="#a5b4fc" />
      <rect x="25" y="20" width="12" height="2.5" rx="1.25" fill="#a5b4fc" opacity=".6" />
      <rect x="25" y="26" width="14" height="2.5" rx="1.25" fill="#a5b4fc" opacity=".4" />
      <rect x="25" y="32" width="10" height="2.5" rx="1.25" fill="#a5b4fc" opacity=".3" />
      {/* Bookmark tab */}
      <path d="M12 6v12l4-3 4 3V6" fill="#6366f1" />
    </svg>
  );
}

export function PitchNipsIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      {/* Document base */}
      <rect x="10" y="4" width="36" height="48" rx="4" fill="#0a0a0a" stroke="#6366f1" strokeWidth="2" />
      {/* "NIP" header badge */}
      <rect x="16" y="10" width="24" height="10" rx="3" fill="#6366f1" />
      <text x="28" y="18" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="monospace">NIP</text>
      {/* Spec lines */}
      <rect x="16" y="26" width="20" height="2" rx="1" fill="#a5b4fc" />
      <rect x="16" y="31" width="16" height="2" rx="1" fill="#a5b4fc" opacity=".6" />
      <rect x="16" y="36" width="18" height="2" rx="1" fill="#a5b4fc" opacity=".4" />
      {/* Checkmark seal */}
      <circle cx="40" cy="42" r="8" fill="#6366f1" />
      <path d="M36 42l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PitchAskIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      {/* Open hands / receiving */}
      <path d="M8 32c4-8 12-10 20-10s16 2 20 10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Upward arrow — the ask */}
      <path d="M28 36V14" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 22l8-8 8 8" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots — community */}
      <circle cx="10" cy="44" r="4" fill="#6366f1" opacity=".6" />
      <circle cx="22" cy="48" r="3" fill="#a5b4fc" opacity=".5" />
      <circle cx="34" cy="48" r="3" fill="#a5b4fc" opacity=".5" />
      <circle cx="46" cy="44" r="4" fill="#6366f1" opacity=".6" />
      <circle cx="28" cy="46" r="2" fill="#e0e7ff" opacity=".4" />
    </svg>
  );
}

export function PitchTrustScoreIcon({ className, style }: PitchIconProps) {
  return (
    <svg className={className || "w-14 h-14"} viewBox="0 0 56 56" fill="none" style={style}>
      {/* Shield outline */}
      <path d="M28 4L8 12v16c0 12 9.5 21 20 24 10.5-3 20-12 20-24V12L28 4z" fill="none" stroke="#6366f1" strokeWidth="2" />
      {/* Trust graph inside shield */}
      <circle cx="28" cy="24" r="4" fill="#6366f1" />
      <circle cx="20" cy="32" r="3" fill="#a5b4fc" />
      <circle cx="36" cy="32" r="3" fill="#a5b4fc" />
      <circle cx="28" cy="38" r="2.5" fill="#e0e7ff" />
      <line x1="28" y1="28" x2="20" y2="29" stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1="28" y1="28" x2="36" y2="29" stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1="20" y1="35" x2="28" y2="36" stroke="#e0e7ff" strokeWidth="1" />
      <line x1="36" y1="35" x2="28" y2="36" stroke="#e0e7ff" strokeWidth="1" />
      {/* Score badge */}
      <circle cx="44" cy="10" r="7" fill="#6366f1" />
      <text x="44" y="13" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="monospace">9</text>
    </svg>
  );
}
