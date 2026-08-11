"use client";

import { useEffect, useState } from "react";

/**
 * Illustrations for the post-quantum pages.
 *
 * Same idiom as WotGraphIllustration: inline SVG, `currentColor` and theme-aware classes
 * rather than baked hex, and a staged reveal driven by a mount flag so nothing animates
 * before it is on screen. Both drawings are of the actual mechanism — the derivation and
 * the three real layers — because a decorative diagram on a page arguing for a protocol
 * is worse than none.
 */

/** Respect a user who has asked the OS for less motion. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useStaged(steps: number, intervalMs: number, enabled: boolean): number {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setStep(steps);
      return;
    }
    const timer = setInterval(() => setStep(s => (s + 1) % (steps + 1)), intervalMs);
    return () => clearInterval(timer);
  }, [steps, intervalMs, enabled]);
  return step;
}

/**
 * One seed, two independent children.
 *
 * The whole argument in one picture: the Nostr key and the post-quantum keys both come
 * from the seed, and neither descends from the other — which is why breaking one tells
 * you nothing about the other.
 */
export type SiblingLabels = {
  alt: string;
  seed: string;
  classic: string;
  classicSub: string;
  pq: string;
  pqSub: string;
  severed: string;
  severedSub: string;
};

export function SiblingDerivationIllustration({
  className = "",
  labels,
}: {
  className?: string;
  /** Passed in rather than read here: this is a presentational component, and the copy
      is explanatory prose that has to be translated like everything else on the page. */
  labels: SiblingLabels;
}) {
  const reduced = useReducedMotion();
  const step = useStaged(3, 1400, !reduced);

  const on = (n: number) => (step >= n ? 1 : 0);
  const branch = (d: string, n: number, tone: string) => (
    <path
      d={d}
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      className={tone}
      style={{
        strokeDasharray: 120,
        strokeDashoffset: on(n) ? 0 : 120,
        transition: "stroke-dashoffset 700ms ease-out",
      }}
    />
  );

  return (
    <svg
      viewBox="0 0 360 240"
      className={`h-auto w-full ${className}`}
      role="img"
      aria-label={labels.alt}
    >
      {/* Seed */}
      <g style={{ opacity: on(0) ? 1 : 0.3, transition: "opacity 400ms" }}>
        <rect x="130" y="14" width="100" height="34" rx="8" className="fill-primary/10 stroke-primary" strokeWidth="1.5" />
        <text x="180" y="36" textAnchor="middle" className="fill-primary text-[13px] font-semibold">
          {labels.seed}
        </text>
      </g>

      {branch("M180 48 C180 80, 96 82, 96 116", 1, "stroke-violet-500")}
      {branch("M180 48 C180 80, 264 82, 264 116", 2, "stroke-teal-500")}

      {/* secp256k1 child */}
      <g style={{ opacity: on(1) ? 1 : 0.25, transition: "opacity 500ms" }}>
        <rect x="26" y="116" width="140" height="42" rx="8" className="fill-violet-500/10 stroke-violet-500" strokeWidth="1.5" />
        <text x="96" y="134" textAnchor="middle" className="fill-violet-600 text-[11px] font-semibold dark:fill-violet-300">
          {labels.classic}
        </text>
        <text x="96" y="149" textAnchor="middle" className="fill-gray-500 text-[10px] dark:fill-gray-400">
          {labels.classicSub}
        </text>
      </g>

      {/* post-quantum child */}
      <g style={{ opacity: on(2) ? 1 : 0.25, transition: "opacity 500ms" }}>
        <rect x="194" y="116" width="140" height="42" rx="8" className="fill-teal-500/10 stroke-teal-500" strokeWidth="1.5" />
        <text x="264" y="134" textAnchor="middle" className="fill-teal-600 text-[11px] font-semibold dark:fill-teal-300">
          {labels.pq}
        </text>
        <text x="264" y="149" textAnchor="middle" className="fill-gray-500 text-[10px] dark:fill-gray-400">
          {labels.pqSub}
        </text>
      </g>

      {/* The severed link is the point, so it is drawn and struck through. */}
      <g style={{ opacity: on(3) ? 1 : 0, transition: "opacity 600ms" }}>
        <path
          d="M166 137 L194 137"
          className="stroke-gray-300 dark:stroke-gray-600"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path d="M172 129 L188 145 M188 129 L172 145" className="stroke-red-500" strokeWidth="2" strokeLinecap="round" />
        <text x="180" y="196" textAnchor="middle" className="fill-gray-600 text-[11px] dark:fill-gray-300">
          {labels.severed}
        </text>
        <text x="180" y="214" textAnchor="middle" className="fill-gray-500 text-[10px] dark:fill-gray-400">
          {labels.severedSub}
        </text>
      </g>
    </svg>
  );
}

/**
 * The three layers of a gift wrap, closing one over the other.
 *
 * Sized to the truth: the ML-KEM ciphertext really is most of the envelope, so the
 * caption carries the real numbers rather than a vague "larger".
 */
export type GiftWrapLabels = {
  alt: string;
  rumor: string;
  rumorSub: string;
  seal: string;
  wrap: string;
  caption: string;
};

export function GiftWrapIllustration({
  className = "",
  labels,
}: {
  className?: string;
  labels: GiftWrapLabels;
}) {
  const reduced = useReducedMotion();
  const step = useStaged(3, 1300, !reduced);

  const layers = [
    { y: 96, w: 150, label: `${labels.rumor} · kind 14`, sub: labels.rumorSub, tone: "stroke-teal-500 fill-teal-500/10", text: "fill-teal-600 dark:fill-teal-300" },
    { y: 62, w: 210, label: `${labels.seal} · kind 13`, sub: "", tone: "stroke-violet-500 fill-violet-500/10", text: "fill-violet-600 dark:fill-violet-300" },
    { y: 28, w: 270, label: `${labels.wrap} · kind 1059`, sub: "", tone: "stroke-amber-500 fill-amber-500/10", text: "fill-amber-600 dark:fill-amber-300" },
  ];

  return (
    <svg
      viewBox="0 0 360 240"
      className={`h-auto w-full ${className}`}
      role="img"
      aria-label={labels.alt}
    >
      {layers.map((l, i) => {
        // Drawn outermost last so the nesting reads correctly.
        const order = layers.length - 1 - i;
        const visible = step >= order;
        return (
          <g
            key={l.label}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(6px)",
              transition: `opacity 500ms ease-out ${order * 60}ms, transform 500ms ease-out ${order * 60}ms`,
            }}
          >
            <rect x={(360 - l.w) / 2} y={l.y} width={l.w} height={l.y === 96 ? 48 : l.y === 62 ? 116 : 184} rx="10" className={l.tone} strokeWidth="1.5" />
            <text x="180" y={l.y + 18} textAnchor="middle" className={`${l.text} text-[11px] font-semibold`}>
              {l.label}
            </text>
            {l.y === 96 && (
              <text x="180" y={l.y + 34} textAnchor="middle" className="fill-gray-500 text-[9px] dark:fill-gray-400">
                {l.sub}
              </text>
            )}
          </g>
        );
      })}

      <text x="180" y="228" textAnchor="middle" className="fill-gray-500 text-[10px] dark:fill-gray-400">
        {labels.caption}
      </text>
    </svg>
  );
}
