"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Badge, Button, Input, Section, SectionHeader, ScrollReveal } from "@/components/ui";
import { checkPqcSupport, type PqcResult } from "@/lib/client/pqcCheck";

function StatusPill({ tone, children }: { tone: "ok" | "warn" | "bad" | "muted"; children: React.ReactNode }) {
  const styles = {
    ok: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    warn: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    bad: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    muted: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles}`}>
      {children}
    </span>
  );
}

function KeyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-gray-200 py-3 dark:border-gray-800 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="w-44 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="break-all font-mono text-sm text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}

export default function PqcContent() {
  const t = useTranslations("pqc");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PqcResult | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      setResult(await checkPqcSupport(input));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Section>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <Badge>{t("hero.badge")}</Badge>
            <h1 className="mt-4 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">{t("hero.subtitle")}</p>
          </div>
        </ScrollReveal>
      </Section>

      {/* Checker */}
      <Section>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl">
            <SectionHeader title={t("checker.title")} description={t("checker.subtitle")} />

            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("checker.placeholder")}
                aria-label={t("checker.title")}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? t("checker.checking") : t("checker.action")}
              </Button>
            </form>

            {/* Nothing publishes kind 10203 yet. Say so, rather than let an empty
                result read as a broken tool. */}
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t("checker.earlyNotice")}</p>

            {result && (
              <div className="mt-8 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
                {result.status === "invalid-input" && (
                  <StatusPill tone="bad">{t("result.invalidInput")}</StatusPill>
                )}

                {result.status === "not-found" && (
                  <>
                    <StatusPill tone="muted">{t("result.notFound")}</StatusPill>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                      {t("result.notFoundDetail")}
                    </p>
                  </>
                )}

                {result.status === "found" && (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      {result.problems.length === 0 ? (
                        <StatusPill tone="ok">{t("result.supported")}</StatusPill>
                      ) : (
                        <StatusPill tone="warn">{t("result.supportedWithProblems")}</StatusPill>
                      )}
                      {result.popValid === true && <StatusPill tone="ok">{t("result.popValid")}</StatusPill>}
                      {result.popValid === false && <StatusPill tone="bad">{t("result.popInvalid")}</StatusPill>}
                      {result.seedStrength && (
                        <StatusPill tone={result.seedStrength === "256" ? "ok" : "warn"}>
                          {t("result.seedStrength", { bits: result.seedStrength })}
                        </StatusPill>
                      )}
                    </div>

                    {result.problems.length > 0 && (
                      <ul className="mt-5 list-inside list-disc space-y-1 text-sm text-amber-700 dark:text-amber-300">
                        {result.problems.map((p) => (
                          <li key={p.code}>{t(`problems.${p.code}`, p.params)}</li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-6">
                      <KeyRow label={t("result.npub")} value={result.npub} />
                      {result.keys.map((k) => (
                        <KeyRow
                          key={k.alg}
                          label={k.alg}
                          value={`${k.bytes} bytes${k.lengthValid ? "" : " (unexpected length)"} · ${k.base64.slice(0, 40)}…`}
                        />
                      ))}
                      {result.origin && <KeyRow label={t("result.origin")} value={result.origin} />}
                      {result.profile && <KeyRow label={t("result.profile")} value={result.profile} />}
                      <KeyRow
                        label={t("result.published")}
                        value={new Date(result.createdAt * 1000).toISOString().slice(0, 10)}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </ScrollReveal>
      </Section>

      {/* How it works */}
      <Section>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl">
            <SectionHeader title={t("how.title")} description={t("how.subtitle")} />
            <div className="mt-8 space-y-6">
              {["seed", "attestation", "wrap"].map((k) => (
                <div key={k} className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(`how.${k}.title`)}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{t(`how.${k}.body`)}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Section>

      {/* Limits — deliberately prominent. */}
      <Section>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-200">
              {t("limits.title")}
            </h2>
            <p className="mt-3 text-amber-900/90 dark:text-amber-200/90">{t("limits.body")}</p>
          </div>
        </ScrollReveal>
      </Section>
    </>
  );
}
