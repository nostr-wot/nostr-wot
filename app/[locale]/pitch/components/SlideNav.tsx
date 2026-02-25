export function SlideCounter({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const text = `${String(current + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  return <div className="pitch-counter">{text}</div>;
}

export function SlideDots({
  total,
  current,
  onSelect,
}: {
  total: number;
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="pitch-dots">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          className={`pitch-dot ${i === current ? "active" : ""}`}
          onClick={() => onSelect(i)}
          aria-label={`Slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

export function SlideArrows({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="pitch-arrows">
      <button
        className="pitch-arrow-btn"
        onClick={onPrev}
        aria-label="Previous slide"
      >
        &larr;
      </button>
      <button
        className="pitch-arrow-btn"
        onClick={onNext}
        aria-label="Next slide"
      >
        &rarr;
      </button>
    </div>
  );
}
