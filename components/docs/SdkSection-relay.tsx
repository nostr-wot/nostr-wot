import {getTranslations} from "next-intl/server";
import {CodeBlock, TerminalBlock} from "@/components/ui";
export default async function Content(){ const t=await getTranslations("docs.sdk"); return (<section id="relay" className="scroll-mt-24">
        <p>{t("relayDescription")}</p>
        <TerminalBlock commands={["npm install nostr-wot-sdk@3.0.0 nostr-tools"]} />
        <CodeBlock language="typescript" code={`import { RelayPool, type PoolLike, type NostrEvent } from "nostr-wot-sdk/relay";

function watchNotes(transport: PoolLike, onEvent: (event: NostrEvent) => void) {
  const pool = new RelayPool({
    urls: ["wss://relay.damus.io", "wss://nos.lol"],
    pool: transport,
  });
  const sub = pool.subscribe({ kinds: [1], limit: 50 }, { onEvent });
  return () => {
    sub.close();
    pool.destroy();
  };
}`} />
      </section>); }
