"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, localeNames, localeISO, type Locale } from "@/i18n/config";
import { ChevronDownIcon } from "@/components/icons";
import { useBlogTranslations } from "@/contexts/BlogTranslationsContext";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { translations } = useBlogTranslations();

  const handleChange = (newLocale: Locale) => {
    // If we have blog translations, use the translated slug
    if (translations && translations[newLocale]) {
      const translatedSlug = translations[newLocale];
      router.replace(`/blog/${translatedSlug}`, { locale: newLocale });
    } else {
      router.replace(pathname, { locale: newLocale });
    }
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
        <span>{localeISO[locale as Locale]}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>
      <div className="absolute right-0 mt-1 py-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleChange(loc)}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              locale === loc ? "text-primary font-medium" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    </div>
  );
}
