import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/routing";
import {CodeBlock} from "@/components/ui";
export default async function Content(){ const t=await getTranslations("docs.sdk"); return (<section id="compatibility" className="scroll-mt-24">
        <p>{t("compatibilityDescription")}</p>
        <CodeBlock language="typescript" code={`async function oracleDistance(from: string, to: string) {
  const query = new URLSearchParams({ from, to, max_hops: "2" });
  const response = await fetch(
    "https://wot-oracle.mappingbitcoin.com/distance?" + query,
  );
  if (!response.ok) throw new Error("Oracle HTTP " + response.status);
  const result = await response.json();
  return result.hops as number | null;
}`} />
        <p><Link href="/docs/oracle">{t("oracleLink")}</Link></p>
      </section>); }
