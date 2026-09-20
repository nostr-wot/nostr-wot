"use client";

import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "@nostr-wot/data/react";
import { Badge, Button } from "@/components/ui";
import { GraphPlayground } from "@/components/playground";
import { parseGraphPubkey } from "@/lib/graph/parsePubkey";

export default function PlaygroundContent() {
  const t = useTranslations("playground");
  const { pubkey } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rootPubkey, setRootPubkey] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  function explore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseGraphPubkey(inputRef.current?.value ?? "");
    if (!parsed) {
      // Clear rejected input, including accidentally pasted secret keys.
      if (inputRef.current) inputRef.current.value = "";
      setHasError(true);
      inputRef.current?.focus();
      return;
    }
    setHasError(false);
    setRootPubkey(parsed);
  }

  function exploreIdentity() {
    const parsed = parseGraphPubkey(pubkey ?? "");
    if (!parsed) return;
    if (inputRef.current) inputRef.current.value = parsed;
    setHasError(false);
    setRootPubkey(parsed);
  }

  return (
    <main className="min-h-screen">
      <section className={rootPubkey ? "py-4 px-4 sm:px-6 lg:px-8" : "py-16 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"}>
        <div className={rootPubkey ? "max-w-7xl mx-auto" : "max-w-3xl mx-auto"}>
          <div className={rootPubkey ? "flex items-center gap-3 mb-4" : "text-center mb-8"}>
            <Badge className={rootPubkey ? "" : "mb-4"}>{t("hero.badge")}</Badge>
            <h1 className={rootPubkey ? "text-xl font-bold text-gray-900 dark:text-white" : "text-4xl font-bold mb-4"}>
              {t("hero.title")}
            </h1>
            {!rootPubkey && <p className="text-xl text-gray-600 dark:text-gray-400">{t("hero.subtitle")}</p>}
          </div>

          <form onSubmit={explore} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-4">
            <label htmlFor="graph-root-pubkey" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t("entry.label")}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                ref={inputRef}
                id="graph-root-pubkey"
                type="text"
                placeholder={t("entry.placeholder")}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={hasError}
                aria-describedby={hasError ? "graph-root-error graph-root-help" : "graph-root-help"}
                onChange={() => hasError && setHasError(false)}
                className="w-full min-w-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" className="shrink-0">{t("entry.explore")}</Button>
              {pubkey && <Button type="button" variant="outline" className="shrink-0" onClick={exploreIdentity}>{t("entry.useIdentity")}</Button>}
            </div>
            <p id="graph-root-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("entry.help")}</p>
            {hasError && <p id="graph-root-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{t("entry.invalid")}</p>}
          </form>

          {rootPubkey ? (
            <GraphPlayground key={rootPubkey} rootPubkey={rootPubkey} />
          ) : (
            <div className="text-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-12">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7l4 5m0 0l5-5m-5 5l-5 5m5-5l5 5" />
                  <circle cx="6" cy="5" r="3" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="3" /><circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("entry.emptyTitle")}</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">{t("entry.emptyDescription")}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
