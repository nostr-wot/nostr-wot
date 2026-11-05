import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

const TOPICS = ["keys", "recovery", "network", "providers", "hostedWallet", "delete", "copies"] as const;

export default async function AppSection() {
  const t = await getTranslations("privacy.app");
  return (
    <section id="app" className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{t("intro")}</p>
      {TOPICS.map((key) => (
        <div key={key} id={key === "hostedWallet" ? "hosted-wallet" : key === "delete" ? "delete-app-data" : undefined}>
          <h3 className="text-lg font-semibold mb-3">{t(`topics.${key}.title`)}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t(`topics.${key}.description`)}</p>
        </div>
      ))}
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {t("contact")}{" "}<Link href="/support" className="text-primary hover:underline">{t("supportLink")}</Link>{" "}
        {t("or")}{" "}<Link href="/contact" className="text-primary hover:underline">{t("contactLink")}</Link>.
      </p>
      <h3 className="text-lg font-semibold mb-3">{t("children.title")}</h3>
      <p className="text-gray-600 dark:text-gray-400">{t("children.description")}</p>
    </section>
  );
}
