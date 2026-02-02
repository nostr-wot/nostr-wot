"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { LinkButton } from "../ui";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { LogoIcon, ChevronDownIcon } from "@/components/icons";

function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
        <span>{localeFlags[locale as Locale]}</span>
        <span className="hidden md:inline">{localeNames[locale as Locale]}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>
      <div className="absolute right-0 mt-2 py-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleChange(loc)}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
              locale === loc ? "text-primary font-medium" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <span>{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const t = useTranslations("common");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/30 dark:bg-gray-950/30 backdrop-blur-md border-b border-gray-200/30 dark:border-gray-800/30">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl text-gray-900 dark:text-white hover:no-underline">
          <LogoIcon />
          <span>Nostr WoT</span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <Link href="/features" className="text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block">
            {t("nav.features")}
          </Link>
          <Link href="/docs" className="text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block">
            {t("nav.developers")}
          </Link>
          <LanguageSwitcher />
          <LinkButton href="/download" className="hover-lift">
            {t("buttons.download")}
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}
