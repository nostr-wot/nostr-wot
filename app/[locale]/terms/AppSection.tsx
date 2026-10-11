import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

/**
 * The Nostr WoT app (iOS) section of the terms. Grounded in what the app
 * (nostr-wot-wallet) and the hosted wallet (LNbits-proxy) do today.
 */

const TOPICS = ["selfCustody", "signing", "hostedWallet", "selfCustodialWallet", "externalWallets", "noAdvice", "availability", "fees", "openSource", "appStore", "liability"] as const;

export default async function AppSection() {
  const t = await getTranslations("terms.app");

  return (
    <section id="app" className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{t("description")}</p>

      {TOPICS.map((key) => (
        <div key={key} id={key === "hostedWallet" ? "hosted-wallet" : undefined}>
          <h3 className="text-lg font-semibold mb-3">{t(`${key}.title`)}</h3>
          <p className={`text-gray-600 dark:text-gray-400 ${key === "liability" ? "mb-4" : "mb-6"}`}>{t(`${key}.description`)}</p>
        </div>
      ))}

      <p className="text-gray-600 dark:text-gray-400">
        {t("privacy")}{" "}
        <Link href="/privacy#app" className="text-primary hover:underline">{t("privacyLink")}</Link>.
      </p>
    </section>
  );
}
