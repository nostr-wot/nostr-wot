import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/routing';
import type {Locale} from '@/i18n/config';
import {sdkPackages} from '@/lib/sdk-docs.mjs';
import {generateAlternates, generateOpenGraph, generateTwitter, getFullUrl} from '@/lib/metadata';
import {breadcrumbJsonLd, JsonLd} from '@/lib/jsonld';
import {TerminalBlock} from '@/components/ui';
import {DocTopicCards} from './DocTopicCards';
import {SdkTopicContent} from './SdkTopicContent';
type Params={params:Promise<{locale:string}>};
function lookup(path:string) {
  const pkg=sdkPackages.find(p=>path===p.href || p.topics.some(t=>t.href===path));
  if(!pkg) notFound();
  return {pkg,topic:pkg.topics.find(t=>t.href===path)};
}
export function sdkDocMetadata(path:string) {
  return async ({params}:Params):Promise<Metadata>=>{
    const {locale}=await params; const {pkg,topic}=lookup(path); const t=await getTranslations('docs');
    const title=topic?`${t(topic.title)} | ${pkg.name}`:pkg.name;
    const description=t(topic?.intro ?? `sdk.roles.${pkg.role}`);
    return {title,description,alternates:generateAlternates(path,locale as Locale),openGraph:generateOpenGraph({title,description,path,locale:locale as Locale}),twitter:generateTwitter({title,description})};
  };
}
export async function SdkDocPage({path,params}:Params & {path:string}) {
  const {locale}=await params; const {pkg,topic}=lookup(path); const t=await getTranslations('docs');
  const title=topic?t(topic.title):pkg.name;
  const description=t(topic?.intro ?? `sdk.roles.${pkg.role}`);
  const crumbs=[{name:t('meta.title'),path:'/docs'},{name:t('sdk.title'),path:'/docs/sdk'},{name:pkg.name,path:pkg.href},...(topic?[{name:title,path}]:[])];
  return <article className="prose prose-gray dark:prose-invert max-w-none">
    <JsonLd data={[breadcrumbJsonLd(crumbs.map(c=>({name:c.name,url:getFullUrl(c.path,locale as Locale)}))),{'@context':'https://schema.org','@type':topic?'TechArticle':'CollectionPage',name:title,headline:title,description,url:getFullUrl(path,locale as Locale),inLanguage:locale}]} />
    <h1>{title}</h1>
    {topic?<SdkTopicContent id={topic.id}/>:<>
      <p className="lead">{description}</p>
      <h2>{t('packageDocs.install')}</h2>
      <TerminalBlock commands={[`npm install ${pkg.name}@${pkg.version} nostr-tools`]} />
      <p>{t('packageDocs.installNote')}</p>
      <h2>{t('packageDocs.topics')}</h2>
      <DocTopicCards topics={pkg.topics}/>
    </>}
    <div className="not-prose mt-12 mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-200 pt-6 dark:border-gray-800">
    <a className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-primary" href={`https://github.com/nostr-wot/nostr-wot-sdk/tree/main/packages/${pkg.slug==='core'?'sdk':pkg.slug}`}>{t('packageDocs.reference')}</a><Link className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-primary" href="/docs/sdk#migration">{t('packageDocs.migration')}</Link>
    </div>
    {topic && <nav aria-label={t('packageDocs.topics')}><h2>{t('packageDocs.topics')}</h2><DocTopicCards topics={pkg.topics.filter(item=>item.id!==topic.id)}/></nav>}
  </article>;
}
