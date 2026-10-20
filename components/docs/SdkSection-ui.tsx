import {getTranslations} from "next-intl/server";
import {CodeBlock, TerminalBlock} from "@/components/ui";
export default async function Content(){ const t=await getTranslations("docs.sdk"); return (<section id="ui" className="scroll-mt-24">
        <p>{t("uiDescription")}</p>
        <TerminalBlock commands={["npm install @nostr-wot/ui@2.0.0 nostr-wot-sdk@3.0.0 nostr-tools react react-dom"]} />
        <CodeBlock language="tsx" code={`"use client";
import { LoginButton, useSession } from "@nostr-wot/ui";
import { NostrSdkProvider } from "nostr-wot-sdk/react";
import "@nostr-wot/ui/styles.css";

function Account() {
  const { pubkey } = useSession();
  return <><LoginButton /><output>{pubkey}</output></>;
}

function App() {
  return <NostrSdkProvider><Account /></NostrSdkProvider>;
}`} />
      </section>); }
