import type { ReactNode } from "react";

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" width={12} height={12}>
      <path
        d="M2 6l3 3 5-5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Feat({
  children,
  dark,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="pitch-feat">
      <span
        className="pitch-feat-dot"
        style={dark ? { background: "#0a0a0a" } : undefined}
      >
        <CheckIcon />
      </span>
      {children}
    </div>
  );
}
