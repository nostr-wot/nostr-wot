import {getTranslations} from 'next-intl/server';
import {CodeBlock, TerminalBlock} from '@/components/ui';
export default async function PqContent() {
  const t=await getTranslations('docs');
  return <section>
    <p>{t('packageDocs.pqIntro')}</p>
    <TerminalBlock commands={['npm install @nostr-wot/pq@1.0.0 nostr-tools']} />
    <h2>{t('integration.example')}</h2>
    <CodeBlock language="typescript" code={`import { verifyAttestation } from '@nostr-wot/pq';

export function readPublicKeys(event: Parameters<typeof verifyAttestation>[0]) {
  const attestation = verifyAttestation(event);
  if (!attestation.usable) throw new Error('Unusable PQ attestation');
  return attestation;
}`} />
    <h2>{t('integration.notes')}</h2><p>{t('packageDocs.pqNotes')}</p>
  </section>;
}
