import enMessages from '@/messages/en/projects.json';
import esMessages from '@/messages/es/projects.json';
import deMessages from '@/messages/de/projects.json';
import frMessages from '@/messages/fr/projects.json';
import itMessages from '@/messages/it/projects.json';
import ptMessages from '@/messages/pt/projects.json';
import ruMessages from '@/messages/ru/projects.json';

const projectMessages = { en: enMessages, es: esMessages, de: deMessages, fr: frMessages, it: itMessages, pt: ptMessages, ru: ruMessages };

export const PROJECT_STATUSES = ['active', 'beta', 'archived', 'unknown'] as const;
export type ProjectStatus = typeof PROJECT_STATUSES[number];
export type EvidenceLink = { label: string; url: string };
export type EcosystemProject = {
  id: string;
  name: string;
  summary: string;
  category: string;
  status: ProjectStatus;
  statusNote: string;
  website: string;
  repository: string;
  lastVerified: string;
  people: {
    name: string;
    role: 'founder' | 'maintainer' | 'creator';
    profiles: EvidenceLink[];
    sourceUrl: string;
  }[];
  sources: EvidenceLink[];
  latestUpdate?: { date: string; title: string; url: string };
};
export type EcosystemNews = {
  title: string;
  date: string;
  url: string;
  summary: string;
  type?: string;
  coverage?: string;
  dateBasis?: string;
  sources?: EvidenceLink[];
};

export function categoryLabel(category: string, locale = 'en'): string {
  const labels: Record<string, string> = ecosystemCopy(locale).categories;
  const key = category.toLowerCase().replace(/_/g, '-');
  return labels[key] ?? (category ? category.replace(/[-_]+/g, ' ').replace(/^./, letter => letter.toUpperCase()) : labels.uncategorized);
}

export function isCommitDate(dateBasis?: string): boolean {
  return !!dateBasis && /commit|tag|etiquet/i.test(dateBasis);
}

const dateCopy = {
  en: ['Commit date', 'Date', 'Tagged commit', 'Publication date', 'Publication'],
  es: ['Fecha del commit', 'Fecha', 'Commit etiquetado', 'Fecha de publicación', 'Publicación'],
  de: ['Commit-Datum', 'Datum', 'Getaggter Commit', 'Veröffentlichungsdatum', 'Veröffentlichung'],
  fr: ['Date du commit', 'Date', 'Commit étiqueté', 'Date de publication', 'Publication'],
  it: ['Data del commit', 'Data', 'Commit con tag', 'Data di pubblicazione', 'Pubblicazione'],
  pt: ['Data do commit', 'Data', 'Commit com tag', 'Data de publicação', 'Publicação'],
  ru: ['Дата коммита', 'Дата', 'Коммит с тегом', 'Дата публикации', 'Публикация'],
};

export function newsDateLabel(dateBasis?: string, locale = 'en'): string {
  const labels = dateCopy[locale as keyof typeof dateCopy] ?? dateCopy.en;
  return labels[isCommitDate(dateBasis) ? 0 : 1];
}

export function reportTypeLabel(type: string, locale = 'en'): string {
  const labels: Record<string, string> = ecosystemCopy(locale).reportTypes;
  return labels[type] ?? categoryLabel(type, locale);
}

export function dateBasisLabel(basis: string, locale = 'en'): string {
  const labels = dateCopy[locale as keyof typeof dateCopy] ?? dateCopy.en;
  const index = { 'tagged-commit': 2, 'tag commit date': 2, 'commit': 0, 'publication date': 3, 'published': 4 }[basis];
  return index === undefined ? basis : labels[index];
}

export function coverageLabel(coverage: string, locale = 'en'): string {
  if (coverage === 'baseline') return reportTypeLabel('baseline', locale);
  const current: Record<string, string> = { en: 'Current', es: 'Actual', de: 'Aktuell', fr: 'Actuelle', it: 'Attuale', pt: 'Atual', ru: 'Текущий' };
  return coverage === 'current' ? current[locale] ?? current.en : coverage;
}

export function ecosystemDate(value: string, locale = 'en'): string {
  if (locale === 'en' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(date);
}
export type EcosystemData = {
  checkedAt: string;
  projects: EcosystemProject[];
  news: EcosystemNews[];
  security: EcosystemNews[];
};

export function filterProjects(projects: EcosystemProject[], filters: { query?: string; category?: string; status?: string }) {
  const query = (filters.query ?? '').trim().toLocaleLowerCase('en');
  return projects.filter(project =>
    (!filters.category || project.category === filters.category) &&
    (!filters.status || project.status === filters.status) &&
    (!query || [project.name, project.summary, project.category, ...project.people.map(person => person.name)]
      .join(' ').toLocaleLowerCase('en').includes(query))
  );
}

export function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function ecosystemJsonLd(data: EcosystemData, url: string, locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: ecosystemCopy(locale).heading,
    description: ecosystemCopy(locale).intro,
    url,
    inLanguage: locale,
    dateModified: data.checkedAt,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: data.projects.length,
      itemListElement: data.projects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: project.name,
          description: project.summary,
          ...(isSafeExternalUrl(project.website) ? { url: project.website } : {}),
        },
      })),
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function ecosystemCopy(locale = "en") {
  return projectMessages[locale as keyof typeof projectMessages]?.directory ?? enMessages.directory;
}
