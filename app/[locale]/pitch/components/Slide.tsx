import type { ReactNode } from "react";

function GridBg() {
  return <div className="pitch-grid-bg" />;
}

function TintRed() {
  return <div className="pitch-tint-red" />;
}

function TintPurple() {
  return <div className="pitch-tint-purple" />;
}

export function Slide({
  active,
  center,
  children,
}: {
  active: boolean;
  center?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`pitch-slide ${center ? "pitch-slide-center" : ""} ${active ? "active" : ""}`}
    >
      <GridBg />
      {children}
    </div>
  );
}

export function ProblemSlide({
  active,
  num,
  children,
}: {
  active: boolean;
  num: string;
  children: ReactNode;
}) {
  return (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <GridBg />
      <TintRed />
      <div className="pitch-big-num">{num}</div>
      <div className="pitch-card">{children}</div>
    </div>
  );
}

export function SolutionSlide({
  active,
  num,
  children,
}: {
  active: boolean;
  num: string;
  children: ReactNode;
}) {
  return (
    <div className={`pitch-slide ${active ? "active" : ""}`}>
      <GridBg />
      <TintPurple />
      <div className="pitch-big-num">{num}</div>
      <div className="pitch-card">{children}</div>
    </div>
  );
}
