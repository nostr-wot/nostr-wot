"use client";
import type {ReactNode} from 'react';
import {usePathname} from '@/i18n/routing';
import {Header,Footer,PageTransition} from '@/components/layout';
export default function SiteFrame({children}:{children:ReactNode}){
 const pathname=usePathname().replace(/\/$/,'');
 const workshop=pathname==='/labs/labitconf'||pathname==='/deck';
 return <>{!workshop&&<Header/>}<div className={workshop?'':'pt-16'}><PageTransition>{children}</PageTransition></div>{!workshop&&<Footer/>}</>;
}
