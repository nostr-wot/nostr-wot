"use client";

import {useLocale, useTranslations} from 'next-intl';
import {usePathname} from '@/i18n/routing';
import {Breadcrumbs} from '@/components/ui';

export function DocsBreadcrumbs({links}:{links:{href:string;label:string}[]}) {
  const pathname=usePathname();
  const locale=useLocale();
  const t=useTranslations('docs');
  const paths=pathname.split('/').filter(Boolean).map((_,i,parts)=>'/'+parts.slice(0,i+1).join('/'));
  const items=paths.flatMap(path=>{
    const link=links.find(link=>link.href===path);
    const name=path==='/docs'?t('meta.title'):link?.label;
    return name?[{name,path:(locale==='en'?'':'/'+locale)+path}]:[];
  });
  return <Breadcrumbs items={items} label={t('labels.documentationMenu')} className="pt-6 pb-2"/>;
}
