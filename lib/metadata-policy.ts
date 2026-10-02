import type { Metadata } from 'next';
import { socialArtForUrl, type SocialArtId } from '@/lib/social-art';
import { defaultLocale, locales, type Locale } from '@/i18n/config';

// Editorial limits requested for this site, including social cards. These are
// not search-engine guarantees; engines may choose their own displayed copy.
export const SEO_LIMITS = { title: [45, 57], description: [145, 157] } as const;
const context: Record<Locale, { title: string; description: string }> = {
  en: { title: 'Information and resources from Nostr WoT', description: 'Explore this topic on Nostr WoT, with information about the Nostr network, its tools, and the people and projects building it.' },
  es: { title: 'Nostr WoT: recursos e información', description: 'Explora este tema en Nostr WoT, con información sobre la red Nostr, sus herramientas y las personas y los proyectos que la construyen.' },
  pt: { title: 'Nostr WoT: recursos e informações', description: 'Explore este tema no Nostr WoT, com informações sobre a rede Nostr, suas ferramentas e as pessoas e os projetos que ajudam a construí-la.' },
  ru: { title: 'Nostr WoT: материалы и информация', description: 'Подробнее об этой теме на Nostr WoT: информация о сети Nostr, её инструментах, участниках и проектах, которые помогают развивать сеть.' },
  it: { title: 'Nostr WoT: risorse e informazioni', description: 'Esplora questo argomento su Nostr WoT, con informazioni sulla rete Nostr, i suoi strumenti e le persone e i progetti che la costruiscono.' },
  fr: { title: 'Nostr WoT : ressources et informations', description: 'Explorez ce sujet sur Nostr WoT, avec des informations sur le réseau Nostr, ses outils et les personnes et projets qui le construisent.' },
  de: { title: 'Nostr WoT: Ressourcen und Informationen', description: 'Mehr zu diesem Thema auf Nostr WoT: Informationen über das Nostr-Netzwerk, seine Werkzeuge sowie die Menschen und Projekte, die es gestalten.' },
};

const endings: Record<Locale, string[]> = {
  en: ['Read more.', 'Find out more.', 'Read more on Nostr WoT.', 'Read the details on Nostr WoT.', 'Explore the full story and details on Nostr WoT.'],
  es: ['Leer más.', 'Más información.', 'Lee más en Nostr WoT.', 'Consulta los detalles en Nostr WoT.', 'Explora toda la información y los detalles en Nostr WoT.'],
  pt: ['Leia mais.', 'Saiba mais.', 'Leia mais no Nostr WoT.', 'Veja os detalhes no Nostr WoT.', 'Explore todas as informações e os detalhes no Nostr WoT.'],
  ru: ['Подробнее.', 'Узнайте больше.', 'Читайте на Nostr WoT.', 'Все подробности на Nostr WoT.', 'Читайте полный материал и подробности на Nostr WoT.'],
  it: ['Leggi tutto.', 'Scopri di più.', 'Leggi su Nostr WoT.', 'Scopri i dettagli su Nostr WoT.', 'Esplora tutte le informazioni e i dettagli su Nostr WoT.'],
  fr: ['Lire la suite.', 'En savoir plus.', 'À lire sur Nostr WoT.', 'Tous les détails sur Nostr WoT.', 'Découvrez toutes les informations et les détails sur Nostr WoT.'],
  de: ['Mehr dazu.', 'Mehr erfahren.', 'Mehr auf Nostr WoT.', 'Alle Details auf Nostr WoT.', 'Alle Informationen und weitere Details auf Nostr WoT.'],
};

const length = (text: string) => Array.from(text).length;
const clean = (text: string) => text.normalize('NFC').replace(/\s+/gu, ' ').trim();

/** Keep authored copy when it fits; extend short copy with localized context.
 * Prefer whole-word excerpts. For an unusually long token, use a Unicode-safe
 * excerpt so external profile/note text cannot violate the hard length limit.
 */
function fit(value: string, min: number, max: number, additions: string[], separator = " | "): string {
  let text = clean(value);
  while (length(text) < min) {
    const candidates = additions.map(addition => clean(`${text}${text ? separator : ''}${addition}`));
    const fitted = candidates.find(candidate => length(candidate) >= min && length(candidate) <= max);
    if (fitted) return fitted;
    text = candidates.find(candidate => length(candidate) >= min) || candidates[candidates.length - 1];
  }
  if (length(text) <= max) return text;
  const chars = Array.from(text);
  for (let end = max - 1; end >= min - 1; end--) {
    if (/\s/u.test(chars[end])) {
      const candidate = chars.slice(0, end).join('').replace(/[\s|,:;.-]+$/u, '') + '…';
      if (length(candidate) >= min) return candidate;
    }
  }
  return chars.slice(0, max - 1).join('').trimEnd() + '…';
}

export function seoText(title: string, description: string, locale: Locale = defaultLocale) {
  const copy = context[locale];
  const labels: Record<Locale, string> = { en: 'Information and resources', es: 'Información y recursos', pt: 'Informações e recursos', ru: 'Информация и материалы', it: 'Informazioni e risorse', fr: 'Informations et ressources', de: 'Informationen und Ressourcen' };
  return {
    title: fit(title, ...SEO_LIMITS.title, ['Nostr WoT', labels[locale], copy.title, copy.description]),
    description: fit(description, ...SEO_LIMITS.description, [...endings[locale], copy.description, copy.description], ' '),
  };
}

export function previewImageUrl(title: string, description: string, locale: Locale = defaultLocale, art: SocialArtId = 'home') {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostrwot.com';
  const copy = seoText(title, description, locale);
  return `${base}/social-preview.png?${new URLSearchParams({ ...copy, locale, art })}`;
}

function titleText(title: Metadata['title']): string {
  if (typeof title === 'string') return title;
  if (title && 'absolute' in title) return title.absolute;
  if (title && 'default' in title) return title.default;
  return 'Nostr WoT';
}

export function normalizeMetadata(metadata: Metadata, locale: Locale): Metadata {
  const { title, description } = seoText(titleText(metadata.title), metadata.description || '', locale);
  const canonical = metadata.alternates?.canonical;
  const canonicalUrl = canonical && typeof canonical === 'object' && 'url' in canonical ? canonical.url : canonical;
  const english = metadata.alternates?.languages?.en;
  const englishUrl = english && typeof english === 'object' && 'url' in english ? english.url : english;
  const art = socialArtForUrl(englishUrl || canonicalUrl);
  const image = previewImageUrl(title, description, locale, art);
  return {
    ...metadata,
    // An absolute title prevents a parent template silently exceeding 57.
    title: { absolute: title },
    description,
    openGraph: {
      ...metadata.openGraph,
      title, description,
      url: canonicalUrl || metadata.openGraph?.url,
      siteName: 'Nostr WoT',
      images: [{ url: image, width: 1200, height: 630, type: 'image/png', alt: title }],
    },
    twitter: {
      ...metadata.twitter,
      card: 'summary_large_image',
      title, description,
      images: [{ url: image, alt: title }],
    },
  };
}

/** One final policy boundary for every localized page and layout. */
export function withMetadataPolicy<P extends { params: Promise<{ locale: string }> }>(
  generate: (props: P) => Promise<Metadata>,
): (props: P) => Promise<Metadata> {
  return async props => {
    const metadata = await generate(props);
    const { locale } = await props.params;
    return normalizeMetadata(metadata, locales.includes(locale as Locale) ? locale as Locale : defaultLocale);
  };
}
