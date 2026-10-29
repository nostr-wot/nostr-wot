import {withMetadataPolicy} from '@/lib/metadata-policy';
import {generateAlternates,generateOpenGraph,generateTwitter} from '@/lib/metadata';
import type {Locale} from '@/i18n/config';
import {setRequestLocale} from 'next-intl/server';
import LabWorkshop from '@/components/labs/LabWorkshop';
export const generateMetadata=withMetadataPolicy(async ({params}:{params:Promise<{locale:string}>})=>{const {locale}=await params;const meta={title:'LABITCONF: tu identidad y tu red en Nostr | Nostr WoT',description:'Participá del taller de Nostr WoT en LABITCONF: creá tu perfil, publicá, seguí personas, explorá tu red y guardá tus eventos para usarlos en otras apps.'};return {...meta,alternates:generateAlternates('/labs/labitconf',locale as Locale),openGraph:generateOpenGraph({...meta,path:'/labs/labitconf',locale:locale as Locale}),twitter:generateTwitter(meta)}});
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;setRequestLocale(locale);return <LabWorkshop/>}
