import {withMetadataPolicy} from '@/lib/metadata-policy';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/routing';
import {generateAlternates,generateOpenGraph,generateTwitter} from '@/lib/metadata';
import type {Locale} from '@/i18n/config';
import {sdkPackages,sdkTopics,sdkMoves} from '@/lib/sdk-docs.mjs';
type Props={params:Promise<{locale:string}>};
async function metadata({params}:Props):Promise<Metadata>{
  const {locale}=await params;const t=await getTranslations('docs.sdk');
  const title=t('title'),description=t('description');
  return {title,description,alternates:generateAlternates('/docs/sdk',locale as Locale),openGraph:generateOpenGraph({title,description,path:'/docs/sdk',locale:locale as Locale}),twitter:generateTwitter({title,description})};
}
export const generateMetadata=withMetadataPolicy(metadata);
export default async function SDKDocsPage(){
  const t=await getTranslations('docs');
  return <article className="prose prose-gray dark:prose-invert max-w-none">
    <h1>{t('sdk.title')}</h1><p className="lead">{t('packageDocs.intro')}</p>
    <section id="packages"><h2>{t('packageDocs.title')}</h2>
      <div className="not-prose grid gap-4 sm:grid-cols-2">{sdkPackages.map(pkg=><Link key={pkg.slug} href={pkg.href} className="rounded-xl border border-gray-200 p-5 transition-colors hover:border-primary dark:border-gray-700"><h3 className="mb-2 font-semibold break-words">{pkg.name}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{t(`sdk.roles.${pkg.role}`)}</p><span className="mt-3 block text-sm text-primary">v{pkg.version}</span></Link>)}</div>
    </section>
    <section id="migration" className="scroll-mt-24"><h2>{t('packageDocs.migration')}</h2><p>{t('packageDocs.migrationIntro')}</p>
      <div className="overflow-x-auto"><table><thead><tr><th>{t('packageDocs.old')}</th><th>{t('packageDocs.new')}</th></tr></thead><tbody>{sdkMoves.map(move=><tr key={move.from}><td><code>{move.from}</code></td><td><code>{move.to}</code></td></tr>)}</tbody></table></div>
      <p><a href="https://github.com/nostr-wot/nostr-wot-sdk/blob/main/docs/package-migration.md">{t('packageDocs.migrationTitle')}</a></p>
    </section>
    <h2>{t('packageDocs.topics')}</h2>
    <ul>{sdkTopics.map(topic=><li key={topic.id} id={topic.id} className="scroll-mt-24"><Link href={topic.href}>{t(topic.title)}</Link></li>)}</ul>
  </article>;
}
