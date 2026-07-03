"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui";

export default function PlaygroundContent() {
  const t = useTranslations("playground");

  return (
    <main className="min-h-screen flex items-center justify-center">
      <section className="py-16 w-full">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Badge className="mb-4">{t("hero.badge")}</Badge>
          <h1 className="text-4xl font-bold mb-4">{t("hero.title")}</h1>

          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-8 mt-8">
            {/* Playground icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("unavailable.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("unavailable.description")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
