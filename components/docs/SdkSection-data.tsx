import {getTranslations} from "next-intl/server";
import {CodeBlock, TerminalBlock} from "@/components/ui";
export default async function Content(){ const t=await getTranslations("docs.sdk"); return (<section id="data" className="scroll-mt-24">
        <p>{t("dataDescription")}</p>
        <TerminalBlock commands={["npm install nostr-wot-sdk@3.0.0 nostr-tools"]} />
        <CodeBlock language="typescript" code={`import {
  fetchProfile, fetchNotesByAuthor, fetchEngagement, setDefaultRelays,
} from "nostr-wot-sdk/data";

setDefaultRelays(["wss://relay.damus.io", "wss://nos.lol"]);

async function loadAuthor(pubkey: string) {
  const profile = await fetchProfile(pubkey);
  const notes = await fetchNotesByAuthor(pubkey, { limit: 50 });
  const engagement = await fetchEngagement(notes.map(note => note.id));
  return { profile, notes, engagement };
}`} />
        <CodeBlock language="tsx" code={`"use client";
import { useProfile } from "nostr-wot-sdk/data/react";

function ProfileCard({ pubkey }: { pubkey: string }) {
  const profile = useProfile(pubkey);
  if (!profile) return null;
  return <h2>{profile.displayName ?? profile.name ?? pubkey}</h2>;
}`} />
      </section>); }
