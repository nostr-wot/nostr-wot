import enMessages from '@/messages/en/projects.json';
import esMessages from '@/messages/es/projects.json';
import deMessages from '@/messages/de/projects.json';
import frMessages from '@/messages/fr/projects.json';
import itMessages from '@/messages/it/projects.json';
import ptMessages from '@/messages/pt/projects.json';
import ruMessages from '@/messages/ru/projects.json';
import { pluralForm } from '@/lib/plural';
import { repositorySlug } from '@/lib/repository-slug.mjs';

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
  /** How the project came to exist, as its own sources tell it. Every field is
   * optional because the research refused to publish what no source states: 35
   * of the 41 projects have no explanation of their name anywhere, so claiming
   * one would be invention. Dates carry whatever precision their source gives
   * (see `ecosystemDate`), and every claim carries the URL that evidences it. */
  story?: {
    launched?: string;
    launchedNote?: string;
    launchedSourceUrl?: string;
    nameOrigin?: { text: string; sourceUrl: string };
    motivation?: { text: string; sourceUrl: string };
    milestones?: { date: string; title: string; sourceUrl: string }[];
  };
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
  // Month and year precision are carried as `YYYY-MM` and `YYYY`, because for
  // ten of the launch dates no source gives a day and inventing one would be a
  // fabrication. Each precision is formatted to exactly the fields it has, so a
  // month-precision date never renders as the first of that month.
  const precision = /^\d{4}-\d{2}-\d{2}$/.test(value) ? 'day'
    : /^\d{4}-\d{2}$/.test(value) ? 'month'
    : /^\d{4}$/.test(value) ? 'year'
    : null;
  if (locale === 'en' || !precision) return value;
  if (precision === 'year') return value;
  const date = new Date(`${precision === 'day' ? value : `${value}-01`}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  const formatted = new Intl.DateTimeFormat(locale, {
    ...(precision === 'day' ? { day: 'numeric' } : {}), month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(date);
  // Russian long dates end in the abbreviation "г.", so any sentence that puts
  // a full stop after a date rendered "г..". Dropping it matches ordinary
  // Russian web usage and keeps the surrounding copy punctuated normally.
  return locale === 'ru' ? formatted.replace(/\s*г\.$/u, '') : formatted;
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
      itemListElement: data.projects.map((project, index) => {
        const projectUrl = `${url.replace(/\/projects$/, '')}/projects/${project.id}`;
        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            // `SoftwareApplication`, not `CreativeWork`: every entry in this
            // directory is a program, and the project's own page says so too.
            // The `@id` is that page's software node, so a consumer reading
            // both joins them into one thing instead of two unrelated ones.
            '@type': 'SoftwareApplication',
            '@id': `${projectUrl}#software`,
            name: project.name,
            description: project.summary,
            url: projectUrl,
            ...(isSafeExternalUrl(project.website) ? { sameAs: project.website } : {}),
          },
        };
      }),
    },
  };
}

// Re-exported, not reimplemented. This file carried its own copy that escaped
// `<` but not U+2028 or U+2029, so the two differed in how safe they were.
export { serializeJsonLd } from '@/lib/serialize-jsonld';

type ProjectCopy = typeof enMessages;

/** Directory copy by default, so every existing caller is unchanged. The
 * fallback is per locale, never per key: a key added to English and forgotten
 * in another language renders undefined rather than silently English.
 */
export function ecosystemCopy<K extends 'directory' | 'detail' = 'directory'>(
  locale = "en",
  namespace: K = 'directory' as K,
): ProjectCopy[K] {
  const messages: ProjectCopy = projectMessages[locale as keyof typeof projectMessages] ?? enMessages;
  return messages[namespace] ?? enMessages[namespace];
}

/** The directory's "N of M projects" line.
 *
 * One function rather than four interpolations at the call site, because the
 * noun has to agree with `total`: concatenating a number and a fixed plural
 * shipped "41 von 41 Projekte" in German and "41 из 41 проектов" in Russian.
 * See lib/plural.ts. */
export function projectCountLine(shown: number, total: number, locale = 'en'): string {
  const copy = ecosystemCopy(locale);
  return copy.countLine
    .replace('{shown}', String(shown))
    .replace('{total}', String(total))
    .replace('{projects}', pluralForm(locale, total, copy.projectsPlural));
}

// Re-exported rather than reimplemented: `lib/repository-slug.mjs` is the one
// owner, shared with the snapshot generator that runs before any TypeScript.
export { repositorySlug };

export function findProject(data: EcosystemData, id: string): EcosystemProject | undefined {
  return data.projects.find(project => project.id === id);
}

// A report belongs to a project when the project's repository slug appears in
// the report's own URL or in any of its source URLs. Matching on URLs rather
// than on project names in prose is what keeps this from inventing
// relationships between similarly named projects.
export function relatedReports(project: EcosystemProject, data: EcosystemData) {
  const slug = repositorySlug(project.repository)?.toLowerCase();
  const matches = (report: EcosystemNews) => !!slug && [report.url, ...(report.sources ?? []).map(source => source.url)]
    .some(url => typeof url === 'string' && url.toLowerCase().includes(slug));
  return { news: data.news.filter(matches), security: data.security.filter(matches) };
}

// Several dataset labels carry their provenance in a trailing parenthetical,
// for example "X (username supplied by official GitHub profile)". Splitting it
// lets the link read as the plain thing it is, with the provenance available on
// hover instead of repeated inline on every row of every card.
export function splitLabelNote(label: string): { text: string; note?: string } {
  const match = /^(.*\S)\s*\(([^()]+)\)\s*$/.exec(label);
  return match ? { text: match[1], note: match[2] } : { text: label };
}
