import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { DocsNav } from "@/components/docs/DocsNav";

interface DocsLayoutProps {
  children: ReactNode;
}

export default async function DocsLayout({ children }: DocsLayoutProps) {
  const t = await getTranslations("docs");

  const navSections = [
    {
      title: t("sidebar.gettingStarted"),
      links: [
        { href: "/docs", label: t("sidebar.overview") },
        { href: "/docs/getting-started", label: t("sidebar.quickStart") },
      ],
    },
    {
      title: t("sidebar.extensionCore"),
      links: [
        { href: "/docs/extension", label: t("sidebar.setup") },
        { href: "/docs/extension#getdistance", label: "getDistance" },
        { href: "/docs/extension#isinmywot", label: "isInMyWoT" },
        { href: "/docs/extension#getdistancebetween", label: "getDistanceBetween" },
        { href: "/docs/extension#gettrustscore", label: "getTrustScore" },
        { href: "/docs/extension#getdetails", label: "getDetails" },
        { href: "/docs/extension#getconfig", label: "getConfig" },
      ],
    },
    {
      title: t("sidebar.extensionBatch"),
      links: [
        { href: "/docs/extension#getdistancebatch", label: "getDistanceBatch" },
        { href: "/docs/extension#gettrustscorenbatch", label: "getTrustScoreBatch" },
        { href: "/docs/extension#filterbywot", label: "filterByWoT" },
      ],
    },
    {
      title: t("sidebar.extensionUser"),
      links: [
        { href: "/docs/extension#getmypubkey", label: "getMyPubkey" },
        { href: "/docs/extension#isconfigured", label: "isConfigured" },
      ],
    },
    {
      title: t("sidebar.extensionGraph"),
      links: [
        { href: "/docs/extension#getfollows", label: "getFollows" },
        { href: "/docs/extension#getcommonfollows", label: "getCommonFollows" },
        { href: "/docs/extension#getstats", label: "getStats" },
        { href: "/docs/extension#getpath", label: "getPath" },
      ],
    },
    {
      title: t("sidebar.sdkIntegration"),
      links: [
        { href: "/docs/sdk", label: t("sidebar.sdkSetup") },
        { href: "/docs/sdk#core", label: t("sidebar.sdkCore") },
        { href: "/docs/sdk#batch", label: t("sidebar.sdkBatch") },
        { href: "/docs/sdk#graph", label: t("sidebar.sdkGraph") },
        { href: "/docs/sdk#config", label: t("sidebar.sdkConfig") },
        { href: "/docs/sdk#errors", label: t("sidebar.sdkErrors") },
        { href: "/docs/sdk#react", label: t("sidebar.sdkReact") },
      ],
    },
    {
      title: t("sidebar.oracleApi"),
      links: [
        { href: "/docs/oracle", label: t("sidebar.publicServersOverview") },
        { href: "/docs/oracle#health", label: "GET /health" },
        { href: "/docs/oracle#stats", label: "GET /stats" },
        { href: "/docs/oracle#follows", label: "GET /follows" },
        { href: "/docs/oracle#common-follows", label: "GET /common-follows" },
        { href: "/docs/oracle#path", label: "GET /path" },
        { href: "/docs/oracle#distance", label: "GET /distance" },
        { href: "/docs/oracle#batch", label: "POST /distance/batch" },
        { href: "/docs/oracle#errors", label: t("sidebar.oracleErrors") },
      ],
    },
    {
      title: t("sidebar.resources"),
      links: [
        { href: "/download", label: t("sidebar.extensionGuide") },
        { href: "/oracle", label: t("sidebar.oracleGuide") },
      ],
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-2">{t("hero.title")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">{t("hero.subtitle")}</p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex gap-8 py-8">
          {/* Left sidebar */}
          <DocsNav sections={navSections} />

          {/* Main content */}
          <main className="flex-1 min-w-0 max-w-4xl">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
