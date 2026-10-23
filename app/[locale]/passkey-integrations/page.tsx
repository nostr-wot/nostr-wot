import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Card, ExternalLinkButton, LinkButton } from '@/components/ui';
import { Section } from '@/components/ui/Section';
import { generateAlternates, generateOpenGraph, generateTwitter } from '@/lib/metadata';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import { type Locale } from '@/i18n/config';
import { PASSKEY_INTEGRATION_LINKS } from '@/lib/passkey-integration-links';

type Props = { params: Promise<{ locale: string }> };

async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'passkeyIntegrations' });
  const title = t('title');
  const description = t('description');
  return {
    title, description,
    alternates: generateAlternates('/passkey-integrations', locale as Locale),
    openGraph: generateOpenGraph({ title, description, path: '/passkey-integrations', locale: locale as Locale }),
    twitter: generateTwitter({ title, description }),
  };
}
export const generateMetadata = withMetadataPolicy(pageMetadata);

export default async function PasskeyIntegrationsPage() {
  const t = await getTranslations('passkeyIntegrations');
  return (
    <>
      <Section background="gradient" padding="lg">
        <div className="max-w-3xl">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-5">{t('badge')}</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">{t('title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{t('description')}</p>
          <div className="flex flex-wrap gap-3">
            <ExternalLinkButton href={PASSKEY_INTEGRATION_LINKS.request}>{t('cta')}</ExternalLinkButton>
            <ExternalLinkButton href={PASSKEY_INTEGRATION_LINKS.guide} variant="outline">{t('docs')}</ExternalLinkButton>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">{t('ctaNote')}</p>
          <p className="mt-8 border-l-2 border-primary pl-4 text-sm text-gray-600 dark:text-gray-400">{t('status')}</p>
        </div>
      </Section>
      <Section padding="sm">
        <h2 className="text-3xl font-bold mb-8">{t('pathsTitle')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {(['signer', 'recovery'] as const).map(kind => (
            <Card key={kind} padding="lg">
              <h3 className="text-xl font-semibold mb-3">{t(`${kind}Title`)}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t(`${kind}Body`)}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section background="gray" padding="sm">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">{t('prepareTitle')}</h2>
            <ul className="list-disc pl-5 space-y-4 text-gray-600 dark:text-gray-400">
              {(['project', 'origins', 'scope', 'evidence'] as const).map(key => <li key={key}>{t(key)}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">{t('processTitle')}</h2>
            <ol className="space-y-6">
              {[1, 2, 3].map(step => (
                <li key={step} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold" aria-hidden="true">{step}</span>
                  <div><h3 className="font-semibold mb-1">{t(`step${step}Title`)}</h3><p className="text-gray-600 dark:text-gray-400">{t(`step${step}Body`)}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>
      <Section padding="sm">
        <div className="max-w-3xl space-y-8">
          <div><h2 className="text-2xl font-bold mb-3">{t('limitsTitle')}</h2><p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('limitsBody')}</p></div>
          <div><h2 className="text-2xl font-bold mb-3">{t('privacyTitle')}</h2><p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('privacyBody')}</p><ExternalLinkButton href={PASSKEY_INTEGRATION_LINKS.security} variant="outline">{t('security')}</ExternalLinkButton></div>
          <LinkButton href="/docs" variant="ghost">{t('docs')}</LinkButton>
        </div>
      </Section>
    </>
  );
}
