"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { DeckMessages } from "./types";
const targets = [".info-button", "nav", ".slide-selector"];
export default function Tour({
  onClose,
  ui,
}: {
  onClose: () => void;
  ui: DeckMessages["ui"];
}) {
  const [step, setStep] = useState(0),
    [box, setBox] = useState<{
      x: number;
      y: number;
      w: number;
      h: number;
    } | null>(null),
    [viewport, setViewport] = useState({ w: 0, h: 0 });
  const card = useRef<HTMLElement>(null),
    previous = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const update = () => {
      const r = document
        .querySelector(".nostr-deck " + targets[step])
        ?.getBoundingClientRect();
      if (r) setBox({ x: r.x, y: r.y, w: r.width, h: r.height });
      setViewport({ w: innerWidth, h: innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [step]);
  useEffect(() => {
    previous.current = document.activeElement as HTMLElement;
    return () => previous.current?.focus();
  }, []);
  useEffect(() => {
    card.current?.querySelector("button")?.focus();
  }, [step]);
  const width = Math.min(360, viewport.w - 32),
    left = box
      ? Math.max(
          16,
          Math.min(box.x + box.w / 2 - width / 2, viewport.w - width - 16),
        )
      : 16;
  const top = box && box.y < viewport.h / 2 ? box.y + box.h + 20 : undefined;
  const bottom = top === undefined && box ? viewport.h - box.y + 20 : undefined;
  return (
    <div
      className="tour-layer"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
        if (e.key === "Tab") {
          const buttons = Array.from(card.current!.querySelectorAll("button"));
          if (e.shiftKey && document.activeElement === buttons[0]) {
            e.preventDefault();
            buttons[buttons.length - 1].focus();
          } else if (
            !e.shiftKey &&
            document.activeElement === buttons[buttons.length - 1]
          ) {
            e.preventDefault();
            buttons[0].focus();
          }
        }
      }}
    >
      {box && (
        <div
          className="tour-spotlight"
          style={{
            left: box.x - 5,
            top: box.y - 5,
            width: box.w + 10,
            height: box.h + 10,
          }}
        />
      )}
      <section
        ref={card}
        className="tour-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        style={{ width: Math.max(0, width), left, top, bottom }}
      >
        <div className="tour-top">
          <span>
            {step + 1} / {targets.length}
          </span>
          <button onClick={onClose} aria-label={ui.tourButtons[0]}>
            ×
          </button>
        </div>
        <h2 id="tour-title">{ui.tour[step][0]}</h2>
        <p>{ui.tour[step][1]}</p>
        <div className="tour-actions">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)}>
              {ui.tourButtons[2]}
            </button>
          ) : (
            <button onClick={onClose}>{ui.tourButtons[1]}</button>
          )}
          <button
            className="tour-next"
            onClick={() =>
              step === targets.length - 1 ? onClose() : setStep(step + 1)
            }
          >
            {ui.tourButtons[step === targets.length - 1 ? 4 : 3]}
          </button>
        </div>
      </section>
    </div>
  );
}
