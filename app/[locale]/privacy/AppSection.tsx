import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

/**
 * The Nostr WoT app (iOS) section of the privacy policy. Every statement here
 * is grounded in the app's code (nostr-wot-wallet) and in the hosted wallet's
 * server (LNbits-proxy); change the copy when they change.
 */

const ON_DEVICE = ["vault", "unlock", "settings", "archive", "walletSecrets"] as const;
const CONNECTIONS = [
  "relays",
  "lan",
  "sameDevice",
  "hostedWallet",
  "nwc",
  "spark",
  "lightningAddress",
  "tor",
  "favicons",
  "feedback",
] as const;
const HOSTED_STORED = ["identity", "wallet", "address", "payments", "requests"] as const;
const DOES_NOT = ["analytics", "ads", "tracking", "sell", "keys"] as const;
const DELETE = ["account", "everything", "hostedWallet", "relays"] as const;

const external = (href: string) => {
  function ExternalLink(chunks: ReactNode) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        {chunks}
      </a>
    );
  }
  return ExternalLink;
};

const richTags = {
  breez: external("https://breez.technology/privacy.html"),
  spark: external("https://www.spark.money/privacy"),
  google: external("https://policies.google.com/privacy"),
  github: external("https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"),
  strong: (chunks: ReactNode) => <strong className="text-gray-900 dark:text-white">{chunks}</strong>,
};

export default async function AppSection() {
  const t = await getTranslations("privacy.app");

  const item = (group: string, key: string) => (
    <li key={key}>
      <strong className="text-gray-900 dark:text-white">{t(`${group}.items.${key}.title`)}</strong>{" "}
      {t.rich(`${group}.items.${key}.description`, richTags)}
    </li>
  );

  return (
    <section id="app" className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{t("intro")}</p>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{t("publisher")}</p>

      <div className="bg-trust-green/5 border border-trust-green/20 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-trust-green mb-2">{t("summary.title")}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">{t("summary.description")}</p>
      </div>

      <h3 className="text-lg font-semibold mb-3">{t("onDevice.title")}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{t("onDevice.description")}</p>
      <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
        {ON_DEVICE.map((key) => item("onDevice", key))}
      </ul>

      <h3 className="text-lg font-semibold mb-3">{t("connections.title")}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{t("connections.description")}</p>
      <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
        {CONNECTIONS.map((key) => item("connections", key))}
      </ul>

      <h3 id="hosted-wallet" className="text-lg font-semibold mb-3">{t("hostedWallet.title")}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{t("hostedWallet.description")}</p>
      <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
        {HOSTED_STORED.map((key) => item("hostedWallet", key))}
      </ul>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{t("hostedWallet.custody")}</p>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{t("hostedWallet.retention")}</p>

      <h3 className="text-lg font-semibold mb-3">{t("privacyMode.title")}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{t("privacyMode.description")}</p>

      <h3 className="text-lg font-semibold mb-3">{t("doesNot.title")}</h3>
      <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
        {DOES_NOT.map((key) => (
          <li key={key}>{t(`doesNot.items.${key}`)}</li>
        ))}
      </ul>

      <h3 id="delete-app-data" className="text-lg font-semibold mb-3">{t("delete.title")}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{t("delete.description")}</p>
      <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
        {DELETE.map((key) => item("delete", key))}
      </ul>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {t("delete.contact")}{" "}
        <Link href="/support" className="text-primary hover:underline">{t("delete.supportLink")}</Link>{" "}
        {t("delete.or")}{" "}
        <Link href="/contact" className="text-primary hover:underline">{t("delete.contactLink")}</Link>.
      </p>

      <h3 className="text-lg font-semibold mb-3">{t("children.title")}</h3>
      <p className="text-gray-600 dark:text-gray-400">{t("children.description")}</p>
    </section>
  );
}
