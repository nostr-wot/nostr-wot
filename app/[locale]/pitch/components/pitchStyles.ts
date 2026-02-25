export const pitchStyles = `
  .pitch-deck {
    position: fixed;
    inset: 0;
    z-index: 100;
    width: 100vw;
    height: 100vh;
    background: #ffffff;
    color: #0a0a0a;
    font-family: var(--font-pitch-sans, 'Syne', sans-serif);
    overflow: hidden;
  }

  .pitch-deck-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  /* Slide */
  .pitch-slide {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 16vh 5vw 5vw;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
    isolation: isolate;
  }
  .pitch-slide.active {
    opacity: 1;
    pointer-events: all;
  }
  .pitch-slide-center {
    text-align: center;
    justify-content: center;
    padding-top: 5vw;
  }

  /* Counter */
  .pitch-counter {
    position: fixed;
    top: 1.5rem;
    right: 2rem;
    font-family: var(--font-pitch-mono, 'Space Mono', monospace);
    font-size: 0.7rem;
    color: #a5b4fc;
    z-index: 101;
    letter-spacing: 0.1em;
  }

  /* Grid bg — behind all content */
  .pitch-grid-bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image:
      linear-gradient(#e0deff 1px, transparent 1px),
      linear-gradient(90deg, #e0deff 1px, transparent 1px);
    background-size: 56px 56px;
    pointer-events: none;
  }

  /* Labels */
  .pitch-label {
    font-family: var(--font-pitch-mono, 'Space Mono', monospace);
    font-size: 0.68rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #818cf8;
    margin-bottom: 1.2rem;
  }
  .pitch-label-v { color: #6366f1; }
  .pitch-label-k { color: #0a0a0a; }

  /* Links */
  .pitch-link {
    text-decoration: none;
    color: inherit;
    transition: opacity 0.2s;
    cursor: pointer;
  }
  .pitch-link:hover {
    opacity: 0.7;
    text-decoration: underline;
  }
  .pitch-link-inline {
    color: #6366f1 !important;
    font-weight: 700;
  }

  /* Typography */
  .pitch-h1 {
    font-size: clamp(3rem, 8vw, 6.5rem);
    font-weight: 800;
    line-height: 0.92;
    letter-spacing: -0.03em;
    color: #0a0a0a;
    font-family: var(--font-pitch-sans, 'Syne', sans-serif);
    text-align: center;
    margin: 0;
  }
  .pitch-h2 {
    font-size: clamp(1.9rem, 4.5vw, 4rem);
    font-weight: 800;
    line-height: 0.96;
    letter-spacing: -0.025em;
    color: #0a0a0a;
    font-family: var(--font-pitch-sans, 'Syne', sans-serif);
    margin: 0;
  }
  .pitch-deck p {
    font-size: clamp(0.9rem, 1.6vw, 1.15rem);
    color: #4b5563;
    line-height: 1.7;
    max-width: 54ch;
    margin: 0;
    font-family: var(--font-pitch-sans, 'Syne', sans-serif);
  }
  .pitch-v { color: #6366f1; }
  .pitch-red { color: #ef4444; }
  .pitch-black-strip {
    display: inline-block;
    background: #0a0a0a;
    color: #fff;
    padding: 0.04em 0.22em;
    border-radius: 4px;
    line-height: 1;
  }

  /* Divider */
  .pitch-divider {
    width: 44px;
    height: 3px;
    background: #6366f1;
    margin: 1.4rem 0;
    border-radius: 2px;
  }
  .pitch-divider-red { background: #ef4444; }
  .pitch-divider-black { background: #0a0a0a; }

  /* SVG icon */
  .pitch-svg-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 1.4rem;
    display: block;
  }

  /* Big number */
  .pitch-big-num {
    font-family: var(--font-pitch-mono, 'Space Mono', monospace);
    font-weight: 700;
    font-size: clamp(6rem, 18vw, 16rem);
    color: #e0e7ff;
    line-height: 1;
    position: absolute;
    right: 4vw;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    user-select: none;
    letter-spacing: -0.05em;
  }

  /* Card */
  .pitch-card {
    max-width: 680px;
    text-align: left;
    position: relative;
    z-index: 1;
  }

  /* Features */
  .pitch-feat {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-top: 1rem;
    font-size: clamp(0.85rem, 1.4vw, 1rem);
    color: #1e1b4b;
    font-weight: 600;
    font-family: var(--font-pitch-sans, 'Syne', sans-serif);
  }
  .pitch-feat-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #6366f1;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Title slide */
  .pitch-title-logo {
    margin-bottom: 2rem;
    display: block;
  }
  .pitch-subtitle {
    margin-top: 1.4rem !important;
    text-align: center;
  }
  .pitch-nav-hint {
    margin-top: 1.8rem !important;
    font-family: var(--font-pitch-mono, 'Space Mono', monospace) !important;
    font-size: 0.7rem !important;
    color: #a5b4fc !important;
    text-align: center;
    letter-spacing: 0.15em;
  }

  /* Demo */
  .pitch-demo-box {
    margin-top: 2rem;
    border: 2px solid #0a0a0a;
    border-radius: 14px;
    padding: 1.6rem 3rem;
    background: #f5f4ff;
    font-family: var(--font-pitch-mono, 'Space Mono', monospace);
    font-size: clamp(0.75rem, 1.3vw, 0.9rem);
    color: #1e1b4b;
    letter-spacing: 0.06em;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  .pitch-pulse {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #6366f1;
    flex-shrink: 0;
    animation: pitch-pu 1.6s ease-in-out infinite;
  }
  @keyframes pitch-pu {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(0.6); }
  }

  /* Contact */
  .pitch-contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    background: #e0deff;
    border: 2px solid #0a0a0a;
    border-radius: 14px;
    overflow: hidden;
    margin-top: 2rem;
    max-width: 520px;
    width: 100%;
  }
  .pitch-contact-cell {
    background: #ffffff;
    padding: 1.3rem 1.8rem;
    text-align: left;
  }
  .pitch-cc-label {
    font-family: var(--font-pitch-mono, 'Space Mono', monospace);
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #a5b4fc;
    margin-bottom: 0.4rem;
  }
  .pitch-cc-value {
    font-family: var(--font-pitch-mono, 'Space Mono', monospace);
    font-size: clamp(0.75rem, 1.1vw, 0.9rem);
    color: #0a0a0a;
    font-weight: 700;
  }
  .pitch-contact-info {
    margin-top: 1.6rem !important;
    text-align: center;
    font-family: var(--font-pitch-mono, 'Space Mono', monospace) !important;
    font-size: 0.72rem !important;
    color: #a5b4fc !important;
  }

  /* Joke punchline */
  .pitch-joke {
    font-family: var(--font-pitch-mono, 'Space Mono', monospace) !important;
    font-size: clamp(0.8rem, 1.3vw, 0.95rem) !important;
    color: #a5b4fc !important;
    font-style: italic;
    letter-spacing: 0.04em;
  }

  /* Tints */
  .pitch-tint-red {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 85% 50%, rgba(239,68,68,.06), transparent 65%);
    pointer-events: none;
  }
  .pitch-tint-purple {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 15% 50%, rgba(99,102,241,.07), transparent 65%);
    pointer-events: none;
  }

  /* Dots */
  .pitch-dots {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.45rem;
    z-index: 101;
  }
  .pitch-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #e0deff;
    cursor: pointer;
    transition: background 0.3s, transform 0.3s;
    border: none;
    padding: 0;
  }
  .pitch-dot.active {
    background: #6366f1;
    transform: scale(1.5);
  }

  /* Arrows */
  .pitch-arrows {
    position: fixed;
    bottom: 1.8rem;
    right: 2rem;
    display: flex;
    gap: 0.6rem;
    z-index: 101;
  }
  .pitch-arrow-btn {
    background: #0a0a0a;
    border: none;
    color: #fff;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    font-family: var(--font-pitch-mono, 'Space Mono', monospace);
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pitch-arrow-btn:hover {
    background: #6366f1;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .pitch-slide {
      padding: 12vh 5vw 5vw;
    }
    .pitch-slide-center {
      padding-top: 4vw;
    }
    .pitch-big-num {
      font-size: clamp(4rem, 20vw, 8rem);
      right: 3vw;
      opacity: 0.5;
    }
    .pitch-card {
      max-width: 100%;
    }
    .pitch-demo-box {
      padding: 1.2rem 1.4rem;
      flex-direction: column;
      text-align: center;
    }
    .pitch-contact-grid {
      grid-template-columns: 1fr;
    }
    .pitch-arrows {
      right: 1rem;
      bottom: 1.2rem;
    }
    .pitch-dots {
      bottom: 1.2rem;
    }
    .pitch-counter {
      top: 1rem;
      right: 1rem;
    }
    .pitch-contact-cell {
      padding: 1rem 1.2rem;
    }
  }

  @media (max-width: 480px) {
    .pitch-h1 {
      font-size: clamp(2.2rem, 10vw, 3.5rem);
    }
    .pitch-h2 {
      font-size: clamp(1.6rem, 6vw, 2.2rem);
    }
    .pitch-svg-icon {
      width: 40px;
      height: 40px;
    }
  }
`;
