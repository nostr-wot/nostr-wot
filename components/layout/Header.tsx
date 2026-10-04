"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LinkButton, ThemeToggle, LanguageSwitcher } from "../ui";
import { LogoIcon } from "@/components/icons";

const navLinkStyles = "text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block";

export default function Header() {
  const t = useTranslations("common");

  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    setHidden(false);
    setAtTop(lastY <= 16);
    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      setAtTop(y <= 16);
      if (y <= 64) setHidden(false);
      else if (Math.abs(y - lastY) > 8) {
        // Keep an open menu or keyboard-focused navigation available.
        const interacting = header.current?.querySelector(":focus-visible") || header.current?.querySelector('[aria-expanded="true"]');
        setHidden(y > lastY && !interacting);
      } else return;
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <header ref={header} onFocusCapture={() => setHidden(false)} className={`fixed top-0 left-0 right-0 z-50 h-16 transition-[transform,background-color,backdrop-filter] duration-200 motion-reduce:transition-none ${hidden ? "-translate-y-full" : "translate-y-0"} ${atTop ? "bg-transparent" : "bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200/30 dark:border-gray-800/30"}`}>
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-xl text-gray-900 dark:text-white hover:no-underline"
        >
          <LogoIcon />
          <span>Nostr WoT</span>
        </Link>

        <nav className="flex items-center gap-2 md:gap-4">
          <Link href="/features" className={navLinkStyles}>
            {t("nav.features")}
          </Link>
          <Link href="/docs" className={navLinkStyles}>
            {t("nav.developers")}
          </Link>
          <Link href="/news" className={navLinkStyles}>
            {t("nav.news")}
          </Link>

          <LinkButton href="/download" className="hover-lift">
            {t("buttons.download")}
          </LinkButton>

          <div className="flex items-center">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
