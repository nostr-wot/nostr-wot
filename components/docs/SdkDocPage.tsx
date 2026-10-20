import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/routing';
import type {Locale} from '@/i18n/config';
import {sdkPackages} from '@/lib/sdk-docs.mjs';
import {generateAlternates, generateOpenGraph, generateTwitter, getFullUrl} from '@/lib/metadata';
import {breadcrumbJsonLd, JsonLd} from '@/lib/jsonld';
import {TerminalBlock} from '@/components/ui';
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
    <nav aria-label={t('labels.documentationMenu')} className="not-prose mb-6 text-sm text-gray-500"><ol className="flex flex-wrap gap-2">{crumbs.map((c,i)=><li key={c.path}>{i>0 && <span aria-hidden="true" className="mr-2">/</span>}<Link href={c.path} aria-current={i===crumbs.length-1?'page':undefined}>{c.name}</Link></li>)}</ol></nav>
    <JsonLd data={[breadcrumbJsonLd(crumbs.map(c=>({name:c.name,url:getFullUrl(c.path,locale as Locale)}))),{'@context':'https://schema.org','@type':topic?'TechArticle':'CollectionPage',name:title,headline:title,description,url:getFullUrl(path,locale as Locale),inLanguage:locale}]} />
    <h1>{title}</h1>
    {topic?<SdkTopicContent id={topic.id}/>:<>
      <p className="lead">{description}</p>
      <h2>{t('packageDocs.install')}</h2>
      <TerminalBlock commands={[`npm install ${pkg.name}@${pkg.version} nostr-tools`]} />
      <p>{t('packageDocs.installNote')}</p>
      <h2>{t('packageDocs.topics')}</h2>
      {pkg.topics.map(item=><section key={item.id}><h3><Link href={item.href}>{t(item.title)}</Link></h3><p>{t(item.intro)}</p></section>)}
    </>}
    <hr/>
    <p><a href={`https://github.com/nostr-wot/nostr-wot-sdk/tree/main/packages/${pkg.slug==='core'?'sdk':pkg.slug}`}>{t('packageDocs.reference')}</a> · <Link href="/docs/sdk#migration">{t('packageDocs.migration')}</Link></p>
    {topic && <nav aria-label={t('packageDocs.topics')}><ul>{pkg.topics.filter(item=>item.id!==topic.id).map(item=><li key={item.id}><Link href={item.href}>{t(item.title)}</Link></li>)}</ul></nav>}
  </article>;
}
