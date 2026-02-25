"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback, Fragment, type ReactNode } from "react";
import {
  AnimatedWotLogo,
  PitchNetworkGraphSmall,
  PitchMapPinIcon,
  PitchSpamIcon,
  PitchLockIcon,
  PitchCentralizeIcon,
  PitchBrokenUXIcon,
  PitchServerIcon,
  PitchCodeIcon,
  PitchShieldIcon,
  PitchPlayIcon,
  PitchIdentityIcon,
  PitchTrustScoreIcon,
  PitchDocsIcon,
  PitchNipsIcon,
  PitchVerifyPinIcon,
  PitchAskIcon,
} from "@/components/icons";
import {
  Slide,
  ProblemSlide,
  SolutionSlide,
  SlideCounter,
  SlideDots,
  SlideArrows,
  Feat,
  pitchStyles,
} from "./components";

const TOTAL_SLIDES = 16;

const richTags = {
  highlight: (chunks: ReactNode) => (
    <span className="pitch-v">{chunks}</span>
  ),
  brand: (chunks: ReactNode) => (
    <span className="pitch-black-strip">{chunks}</span>
  ),
  red: (chunks: ReactNode) => <span className="pitch-red">{chunks}</span>,
  mb: (chunks: ReactNode) => (
    <a href="https://MappingBitcoin.com" target="_blank" rel="noopener" className="pitch-link pitch-link-inline">{chunks}</a>
  ),
};

export default function PitchContent() {
  const t = useTranslations("pitch");
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const goTo = useCallback((n: number) => {
    setCurrent(((n % TOTAL_SLIDES) + TOTAL_SLIDES) % TOTAL_SLIDES);
  }, []);

  // Lock body scroll
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(current + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(current - 1);
      if (e.key === "Escape") goTo(0);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, goTo]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(current + 1);
      else goTo(current - 1);
    }
    setTouchStartX(null);
  };

  const subtitle = t("slide0.subtitle")
    .split("\n")
    .map((line: string, i: number, arr: string[]) => (
      <Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </Fragment>
    ));

  return (
    <div
      className="pitch-deck"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <style>{pitchStyles}</style>

      <SlideCounter current={current} total={TOTAL_SLIDES} />

      <div className="pitch-deck-container">
        {/* SLIDE 0 — TITLE */}
        <Slide active={current === 0} center>
          <AnimatedWotLogo size={140} className="pitch-title-logo" />
          <a href="https://nostr-wot.com" target="_blank" rel="noopener noreferrer" className="pitch-label pitch-label-v pitch-link">{t("slide0.label")}</a>
          <h1 className="pitch-h1">
            {t.rich("slide0.titleLine1", richTags)}
            <br />
            {t.rich("slide0.titleLine2", richTags)}
          </h1>
          <p className="pitch-subtitle">{subtitle}</p>
          <p className="pitch-nav-hint">{t("nav.hint")}</p>
        </Slide>

        {/* SLIDE 1 — BACKGROUND */}
        <Slide active={current === 1}>
          <div className="pitch-card">
            <div className="pitch-label pitch-label-v">{t("slide1.label")}</div>
            <PitchMapPinIcon className="pitch-svg-icon" />
            <h2 className="pitch-h2">
              {t.rich("slide1.titleLine1", richTags)}
              <br />
              {t.rich("slide1.titleLine2", richTags)}
            </h2>
            <div className="pitch-divider" />
            <p>{t.rich("slide1.description", richTags)}</p>
          </div>
        </Slide>

        {/* SLIDE 2 — BACKGROUND: Why Nostr */}
        <Slide active={current === 2}>
          <div className="pitch-card">
            <div className="pitch-label pitch-label-v">{t("slide16.label")}</div>
            <PitchVerifyPinIcon className="pitch-svg-icon" />
            <h2 className="pitch-h2">
              {t.rich("slide16.titleLine1", richTags)}
              <br />
              {t.rich("slide16.titleLine2", richTags)}
            </h2>
            <div className="pitch-divider" />
            <p>{t("slide16.description")}</p>
            <Feat>{t("slide16.feat1")}</Feat>
            <Feat>{t("slide16.feat2")}</Feat>
            <Feat>{t("slide16.feat3")}</Feat>
          </div>
        </Slide>

        {/* SLIDE 3 — PROBLEM 1 */}
        <ProblemSlide active={current === 3} num="01">
          <div className="pitch-label">{t("slide2.label")}</div>
          <PitchSpamIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide2.titleLine1", richTags)}
            <br />
            {t.rich("slide2.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider pitch-divider-red" />
          <p>{t("slide2.description")}</p>
        </ProblemSlide>

        {/* SLIDE 4 — PROBLEM 2 */}
        <ProblemSlide active={current === 4} num="02">
          <div className="pitch-label">{t("slide3.label")}</div>
          <PitchLockIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide3.titleLine1", richTags)}
            <br />
            {t.rich("slide3.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider pitch-divider-red" />
          <p>{t("slide3.description")}</p>
        </ProblemSlide>

        {/* SLIDE 5 — PROBLEM 3: Clients = Centralization */}
        <ProblemSlide active={current === 5} num="03">
          <div className="pitch-label">{t("slide4.label")}</div>
          <PitchCentralizeIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide4.titleLine1", richTags)}
            <br />
            {t.rich("slide4.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider pitch-divider-red" />
          <p>{t("slide4.description")}</p>
        </ProblemSlide>

        {/* HIDDEN — PROBLEM 4: UX is broken (uncomment to restore) */}
        {/*
        <ProblemSlide active={current === -1} num="04">
          <div className="pitch-label">{t("slide5.label")}</div>
          <PitchBrokenUXIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide5.titleLine1", richTags)}
            <br />
            {t.rich("slide5.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider pitch-divider-red" />
          <p>{t("slide5.description")}</p>
        </ProblemSlide>
        */}

        {/* HIDDEN — PROBLEM 4 again / the joke (uncomment to restore) */}
        {/*
        <ProblemSlide active={current === -1} num="04">
          <div className="pitch-label">{t("slide6.label")}</div>
          <PitchBrokenUXIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide6.titleLine1", richTags)}
            <br />
            {t.rich("slide6.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider pitch-divider-red" />
          <p className="pitch-joke">{t("slide6.description")}</p>
        </ProblemSlide>
        */}

        {/* SLIDE 6 — SOLUTION: Extension */}
        <SolutionSlide active={current === 6} num="03">
          <div className="pitch-label pitch-label-k">{t("slide9.label")}</div>
          <PitchShieldIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide9.titleLine1", richTags)}
            <br />
            {t.rich("slide9.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider pitch-divider-black" />
          <p>{t("slide9.description")}</p>
          <Feat dark>{t("slide9.feat1")}</Feat>
          <Feat dark>{t("slide9.feat2")}</Feat>
          <Feat dark>{t("slide9.feat3")}</Feat>
        </SolutionSlide>

        {/* SLIDE 7 — DEMO */}
        <Slide active={current === 7} center>
          <div className="pitch-label pitch-label-v">{t("slide10.label")}</div>
          <PitchPlayIcon className="pitch-svg-icon" style={{ width: 64, height: 64, marginBottom: "1.4rem" }} />
          <h2 className="pitch-h2">
            {t.rich("slide10.titleLine1", richTags)}
            <br />
            {t.rich("slide10.titleLine2", richTags)}
          </h2>
          <div className="pitch-demo-box">
            <span className="pitch-pulse" />
            {t("slide10.demoText")}
          </div>
          <p style={{ marginTop: "1.4rem", textAlign: "center", maxWidth: "42ch" }}>
            {t("slide10.description")}
          </p>
        </Slide>

        {/* SLIDE 8 — FEATURE: Identity Management */}
        <SolutionSlide active={current === 8} num="ID">
          <div className="pitch-label pitch-label-v">{t("slide11.label")}</div>
          <PitchIdentityIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide11.titleLine1", richTags)}
            <br />
            {t.rich("slide11.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider" />
          <p>{t("slide11.description")}</p>
          <Feat>{t("slide11.feat1")}</Feat>
          <Feat>{t("slide11.feat2")}</Feat>
          <Feat>{t("slide11.feat3")}</Feat>
          <Feat>{t("slide11.feat4")}</Feat>
          <Feat>{t("slide11.feat5")}</Feat>
        </SolutionSlide>

        {/* SLIDE 9 — FEATURE: Web of Trust */}
        <SolutionSlide active={current === 9} num="WT">
          <div className="pitch-label pitch-label-v">{t("slide12.label")}</div>
          <PitchTrustScoreIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide12.titleLine1", richTags)}
            <br />
            {t.rich("slide12.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider" />
          <p>{t("slide12.description")}</p>
          <Feat>{t("slide12.feat1")}</Feat>
          <Feat>{t("slide12.feat2")}</Feat>
          <Feat>{t("slide12.feat3")}</Feat>
          <Feat>{t("slide12.feat4")}</Feat>
          <Feat>{t("slide12.feat5")}</Feat>
        </SolutionSlide>

        {/* SLIDE 10 — SOLUTION: Oracle */}
        <SolutionSlide active={current === 10} num="01">
          <div className="pitch-label pitch-label-v">{t("slide7.label")}</div>
          <PitchServerIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide7.titleLine1", richTags)}
            <br />
            {t.rich("slide7.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider" />
          <p>{t("slide7.description")}</p>
          <Feat>{t("slide7.feat1")}</Feat>
          <Feat>{t("slide7.feat2")}</Feat>
          <Feat>{t("slide7.feat3")}</Feat>
        </SolutionSlide>

        {/* SLIDE 11 — SOLUTION: SDK */}
        <SolutionSlide active={current === 11} num="02">
          <div className="pitch-label pitch-label-v">{t("slide8.label")}</div>
          <PitchCodeIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide8.titleLine1", richTags)}
            <br />
            {t.rich("slide8.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider" />
          <p>{t("slide8.description")}</p>
          <Feat>{t("slide8.feat1")}</Feat>
          <Feat>{t("slide8.feat2")}</Feat>
          <Feat>{t("slide8.feat3")}</Feat>
        </SolutionSlide>

        {/* SLIDE 12 — DOCS */}
        <SolutionSlide active={current === 12} num="DC">
          <div className="pitch-label pitch-label-v">{t("slide14.label")}</div>
          <PitchDocsIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide14.titleLine1", richTags)}
            <br />
            {t.rich("slide14.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider" />
          <p>{t("slide14.description")}</p>
          <Feat><a href="/docs" className="pitch-link pitch-link-inline">{t("slide14.feat1")}</a></Feat>
          <Feat>{t("slide14.feat2")}</Feat>
          <Feat>{t("slide14.feat3")}</Feat>
        </SolutionSlide>

        {/* SLIDE 13 — NIPs & STANDARDS */}
        <SolutionSlide active={current === 13} num="NP">
          <div className="pitch-label pitch-label-v">{t("slide15.label")}</div>
          <PitchNipsIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide15.titleLine1", richTags)}
            <br />
            {t.rich("slide15.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider" />
          <p>{t("slide15.description")}</p>
          <Feat><a href="https://github.com/nostr-protocol/nips/issues/2237" target="_blank" rel="noopener noreferrer" className="pitch-link pitch-link-inline">{t("slide15.feat1")}</a></Feat>
          <Feat><a href="https://github.com/nostr-protocol/nips/issues/2236" target="_blank" rel="noopener noreferrer" className="pitch-link pitch-link-inline">{t("slide15.feat2")}</a></Feat>
          <Feat>{t("slide15.feat3")}</Feat>
        </SolutionSlide>

        {/* SLIDE 14 — THE ASK */}
        <SolutionSlide active={current === 14} num="$$">
          <div className="pitch-label pitch-label-v">{t("slide17.label")}</div>
          <PitchAskIcon className="pitch-svg-icon" />
          <h2 className="pitch-h2">
            {t.rich("slide17.titleLine1", richTags)}
            <br />
            {t.rich("slide17.titleLine2", richTags)}
          </h2>
          <div className="pitch-divider" />
          <p>{t("slide17.description")}</p>
          <Feat>{t("slide17.feat1")}</Feat>
          <Feat>{t("slide17.feat2")}</Feat>
          <Feat>{t("slide17.feat3")}</Feat>
          <Feat>{t("slide17.feat4")}</Feat>
          <Feat>{t("slide17.feat5")}</Feat>
        </SolutionSlide>

        {/* SLIDE 15 — CONTACT */}
        <Slide active={current === 15} center>
          <div className="pitch-label pitch-label-v">{t("slide13.label")}</div>
          <PitchNetworkGraphSmall className="pitch-svg-icon" style={{ width: 54, height: 54, marginBottom: "1.2rem" }} />
          <h2 className="pitch-h2">
            {t.rich("slide13.titleLine1", richTags)}
            <br />
            {t.rich("slide13.titleLine2", richTags)}
          </h2>
          <div className="pitch-contact-grid">
            <div className="pitch-contact-cell">
              <div className="pitch-cc-label">{t("slide13.projectLabel")}</div>
              <a href="https://nostr-wot.com" target="_blank" rel="noopener noreferrer" className="pitch-cc-value pitch-link">{t("slide13.projectValue")}</a>
            </div>
            <div className="pitch-contact-cell">
              <div className="pitch-cc-label">{t("slide13.githubLabel")}</div>
              <a href="https://github.com/nostr-wot" target="_blank" rel="noopener noreferrer" className="pitch-cc-value pitch-link">{t("slide13.githubValue")}</a>
            </div>
            <div className="pitch-contact-cell">
              <div className="pitch-cc-label">{t("slide13.agencyLabel")}</div>
              <a href="https://dandelionlabs.io" target="_blank" rel="noopener" className="pitch-cc-value pitch-link">{t("slide13.agencyValue")}</a>
            </div>
            <div className="pitch-contact-cell">
              <div className="pitch-cc-label">{t("slide13.bitcoinMapLabel")}</div>
              <a href="https://mappingbitcoin.com" target="_blank" rel="noopener" className="pitch-cc-value pitch-link">{t("slide13.bitcoinMapValue")}</a>
            </div>
          </div>
          <p className="pitch-contact-info">{t("slide13.contactInfo")}</p>
        </Slide>
      </div>

      <SlideDots total={TOTAL_SLIDES} current={current} onSelect={goTo} />
      <SlideArrows onPrev={() => goTo(current - 1)} onNext={() => goTo(current + 1)} />
    </div>
  );
}
