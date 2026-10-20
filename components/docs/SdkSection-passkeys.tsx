import {getTranslations} from "next-intl/server";
import {CodeBlock, TerminalBlock} from "@/components/ui";
export default async function Content(){ const t=await getTranslations("docs.sdk"); return (<section id="passkeys" className="scroll-mt-24">
        <p>{t("passkeys.description")}</p>
        <TerminalBlock commands={["npm install @nostr-wot/identity@1.0.0 nostr-tools"]} />
        <p>{t("passkeys.host")}</p>
        <CodeBlock language="typescript" code={`import {
  createPasskeyRecord, openPasskeyRecord, parsePasskeyBackup,
  serializePasskeyBackup, sealPasskeyPayload, withPasskeyVaultKey,
  type VaultPayload, type PasskeyInput, type PasskeyProof,
} from "@nostr-wot/identity/vault";

export function protectAccount(payload: VaultPayload, enrollment: PasskeyInput) {
  const record = createPasskeyRecord(payload, enrollment);
  return { record, recoveryFile: serializePasskeyBackup(record) };
}

export async function readRecoveryFile(file: string, proof: PasskeyProof) {
  let record = parsePasskeyBackup(file);
  const opened = await openPasskeyRecord(record, proof);
  if (opened.cacheKeyMinted) {
    record = await withPasskeyVaultKey(record, proof, key =>
      sealPasskeyPayload(opened.payload, key, record),
    );
  }
  return { record, payload: opened.payload };
}`} />
        <p>{t("passkeys.example")}</p>
        <h2>{t("passkeys.adaptersTitle")}</h2>
        <p>{t("passkeys.adapters")}</p>
        <p><a href="https://github.com/nostr-wot/nostr-wot-sdk/tree/main/packages/vault#passkey-record-primitives">{t("passkeys.packageLink")}</a></p>
      </section>); }
