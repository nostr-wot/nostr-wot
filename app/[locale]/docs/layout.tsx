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
      title: t("sidebar.extensionSigner"),
      links: [
        { href: "/docs/extension#setup", label: t("extensionApi.setup") },
        { href: "/docs/extension#nip07", label: t("extensionApi.nip07Title") },
        { href: "/docs/extension#getpublickey", label: "getPublicKey" },
        { href: "/docs/extension#signevent", label: "signEvent" },
        { href: "/docs/extension#nip04encrypt", label: "nip04.encrypt" },
        { href: "/docs/extension#nip04decrypt", label: "nip04.decrypt" },
        { href: "/docs/extension#nip44encrypt", label: "nip44.encrypt" },
        { href: "/docs/extension#nip44decrypt", label: "nip44.decrypt" },
        { href: "/docs/extension#getrelays", label: "getRelays" },
        { href: "/docs/extension#errors", label: t("extensionApi.errorsTitle") },
      ],
    },
    {
      title: t("sidebar.sdkIntegration"),
      links: [
        { href: "/docs/sdk#packages", label: t("sidebar.sdkPackages") },
        { href: "/docs/sdk#setup", label: t("sidebar.sdkSetup") },
        { href: "/docs/sdk#data", label: t("sidebar.sdkData") },
        { href: "/docs/sdk#relay", label: t("sidebar.sdkRelay") },
        { href: "/docs/sdk#ui", label: t("sidebar.sdkUi") },
        { href: "/docs/sdk#wot", label: t("sidebar.sdkWot") },
      ],
    },
    {
      title: t("sidebar.oracleApi"),
      links: [
        { href: "/docs/oracle", label: t("sidebar.publicServersOverview") },
        { href: "/docs/oracle#health", label: "GET /health" },
        { href: "/docs/oracle#ready", label: "GET /ready" },
        { href: "/docs/oracle#stats", label: "GET /stats" },
        { href: "/docs/oracle#follows", label: "GET /follows" },
        { href: "/docs/oracle#mutes", label: "GET /mutes" },
        { href: "/docs/oracle#trust", label: "GET /trust" },
        { href: "/docs/oracle#common-follows", label: "GET /common-follows" },
        { href: "/docs/oracle#path", label: "GET /path" },
        { href: "/docs/oracle#distance", label: "GET /distance" },
        { href: "/docs/oracle#batch", label: "POST /distance/batch" },
        { href: "/docs/oracle#errors", label: t("sidebar.oracleErrors") },
      ],
    },
    {
      title: t("sidebar.lnbitsProxy"),
      links: [
        { href: "/docs/lnbits-proxy", label: t("sidebar.proxyOverview") },
        { href: "/docs/lnbits-proxy#architecture", label: t("sidebar.proxyArchitecture") },
        { href: "/docs/lnbits-proxy#prerequisites", label: t("sidebar.proxyPrerequisites") },
        { href: "/docs/lnbits-proxy#install", label: t("sidebar.proxyInstall") },
        { href: "/docs/lnbits-proxy#endpoints", label: t("sidebar.proxyEndpoints") },
        { href: "/docs/lnbits-proxy#nip98", label: t("sidebar.proxyNip98") },
        { href: "/docs/lnbits-proxy#ownership", label: t("sidebar.proxyOwnership") },
        { href: "/docs/lnbits-proxy#nginx", label: t("sidebar.proxyNginx") },
        { href: "/docs/lnbits-proxy#process", label: t("sidebar.proxyProcess") },
        { href: "/docs/lnbits-proxy#monitoring", label: t("sidebar.proxyMonitoring") },
        { href: "/docs/lnbits-proxy#limits", label: t("sidebar.proxyLimits") },
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
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex gap-8 py-8">
          {/* Left sidebar */}
          <DocsNav sections={navSections} />

          {/* Main content */}
          <main className="docs-content flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
