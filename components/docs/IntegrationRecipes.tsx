import {sdkTopics} from "@/lib/sdk-docs.mjs";
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { CodeBlock, TerminalBlock } from '@/components/ui';
import { integrationExamples, type IntegrationArea } from './integration-examples';

/** Shared presentation for localized, source-checked integration recipes. */
export async function IntegrationRecipes({ area, ids }: { area: IntegrationArea; ids?: string[] }) {
  const t = await getTranslations('docs.integration');
  return <>{integrationExamples[area].filter(recipe => !ids || ids.includes(recipe.id)).map(recipe => <section id={recipe.id} key={recipe.id} className="scroll-mt-24">
    <h2>{t(`${recipe.id}.title`)}</h2>
    <p>{t(`${recipe.id}.intro`)}</p>
    {recipe.install && <TerminalBlock commands={[recipe.install]} />}
    {recipe.code && <><h3>{t('example')}</h3><CodeBlock language={recipe.language ?? 'typescript'} code={recipe.code} /></>}
    <h3>{t('notes')}</h3>
    <p>{t(`${recipe.id}.notes`)}</p>
    {recipe.reference && <p><a href={recipe.reference}>{t('reference')}</a></p>}
  </section>)}</>;
}

export async function IntegrationLinks() {
  const t = await getTranslations('docs.integration');
  return <section id="choose-integration" className="scroll-mt-24">
    <h2>{t('chooseTitle')}</h2>
    <p>{t('chooseDescription')}</p>
    <ul>{integrationExamples.sdk.filter(recipe => recipe.code).map(recipe => <li key={recipe.id}>
      <Link href={sdkTopics.find(topic=>topic.id===recipe.id)?.href ?? `/docs/sdk#${recipe.id}`}>{t(`${recipe.id}.title`)}</Link>
    </li>)}<li><Link href="/docs/extension#capabilities">{t('capabilities.title')}</Link></li></ul>
  </section>;
}
