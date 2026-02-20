"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui";
import { GraphPlayground } from "@/components/playground";
import { useExtension } from "nostr-wot-sdk/react";

export default function PlaygroundContent() {
  const t = useTranslations("playground");
  const extension = useExtension();

  // Retry check without page reload
  const handleRetry = useCallback(() => {
    extension.refresh();
  }, [extension]);

  // Show loading while extension check is in progress
  if (!extension.isChecked || extension.isChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="sr-only">{t("hero.title")}</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t("extension.connecting")}
          </p>
        </div>
      </main>
    );
  }

  // Show message if extension not available
  if (!extension.isConnected) {
    return (
      <main className="min-h-screen">
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge className="mb-4">{t("hero.badge")}</Badge>
            <h1 className="text-4xl font-bold mb-4">{t("hero.title")}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {t("hero.subtitle")}
            </p>

            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-8 max-w-lg mx-auto">
              {/* Extension icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("extension.required")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("extension.requiredDesc")}
              </p>

              {/* Option 1: Already installed */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      {t("extension.alreadyInstalled")}
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      {t("extension.clickToActivate")}
                    </p>
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {t("extension.retry")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Option 2: Need to install */}
              <div className="bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {t("extension.needToInstall")}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {t("extension.installDesc")}
                    </p>
                    <a
                      href="/download"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t("extension.download")}
                    </a>
                  </div>
                </div>
              </div>

              {/* Help text */}
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                {t("extension.helpText")}
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Show graph when extension is connected
  return (
    <main className="min-h-screen">
      <div className="py-4 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge>{t("hero.badge")}</Badge>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("hero.title")}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-trust-green rounded-full animate-pulse" />
              <span className="text-gray-400">Extension Connected</span>
            </div>
          </div>
        </div>

        {/* Graph visualization */}
        <div className="max-w-7xl mx-auto">
          <GraphPlayground />
        </div>
      </div>
    </main>
  );
}
