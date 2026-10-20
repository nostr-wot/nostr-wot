import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/routing";

export default async function Content(){ const t=await getTranslations("docs.sdk"); return (<section id="passkey-interoperability" className="scroll-mt-24">
        <p>{t("passkeys.domain")}</p>
        <p>{t("passkeys.wire")}</p>
        <p>{t("passkeys.validation")}</p>
        <p>{t("passkeys.blob")}</p>
        <ul>
          <li><a href="https://github.com/nostr-wot/nostr-wot-sdk/blob/main/docs/passkey-recovery.md">{t("passkeys.protocolLink")}</a></li>
          <li><Link href="/guides/recover-nostr-account-with-passkey">{t("passkeys.extensionLink")}</Link></li>
          <li><Link href="/guides/create-nostr-account-with-passkey">{t("passkeys.guidesLink")}</Link></li>
        </ul>
      </section>); }
