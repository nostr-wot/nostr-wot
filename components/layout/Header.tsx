"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LinkButton, ThemeToggle, LanguageSwitcher } from "../ui";
import { LogoIcon } from "@/components/icons";

const navLinkStyles = "text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block";

export default function Header() {
  const t = useTranslations("common");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/30 dark:bg-gray-950/30 backdrop-blur-md border-b border-gray-200/30 dark:border-gray-800/30">
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
