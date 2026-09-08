import spanishMessages from '@/messages/es/projects.json';

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
  if (locale === 'es') {
    const labels: Record<string, string> = spanishMessages.directory.categories;
    return labels[category.toLowerCase().replace(/_/g, '-')] ?? (category || labels.uncategorized);
  }
  const label = category.replace(/[-_]+/g, ' ').trim();
  return label ? label[0].toUpperCase() + label.slice(1) : 'Uncategorized';
}

export function isCommitDate(dateBasis?: string): boolean {
  return !!dateBasis && /commit|tag|etiquet/i.test(dateBasis);
}

export function newsDateLabel(dateBasis?: string, locale = 'en'): string {
  return locale === 'es'
    ? (isCommitDate(dateBasis) ? 'Fecha del commit' : 'Fecha')
    : (isCommitDate(dateBasis) ? 'Commit date' : 'Date');
}

export function reportTypeLabel(type: string, locale = 'en'): string {
  const labels: Record<string, string> = spanishMessages.directory.reportTypes;
  return locale === 'es' ? labels[type] ?? type : categoryLabel(type);
}

export function dateBasisLabel(basis: string, locale = 'en'): string {
  if (locale !== 'es') return basis;
  const labels: Record<string, string> = {
    'tagged-commit': 'Commit etiquetado', 'tag commit date': 'Fecha del commit etiquetado',
    'commit': 'Commit', 'publication date': 'Fecha de publicación', 'published': 'Publicación',
  };
  return labels[basis] ?? basis;
}

export function ecosystemDate(value: string, locale = 'en'): string {
  if (locale !== 'es' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es', {
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
    name: locale === 'es' ? 'Directorio del ecosistema Nostr' : 'Nostr ecosystem directory',
    description: locale === 'es' ? 'Un directorio de proyectos Nostr, su estado, personas y fuentes. La inclusión no implica una integración con Web of Trust.' : 'A curated directory of Nostr projects, status, people and sources. Listing does not imply a Web of Trust integration.',
    url,
    inLanguage: locale === 'es' ? 'es' : 'en',
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

const englishCopy = {
  "linkUnavailable": "link unavailable",
  "website": "Website",
  "repository": "Repository",
  "for": "for",
  "cardDetails": "People, status & sources",
  "statusEvidence": "Status evidence:",
  "notVerified": "Not verified.",
  "people": "People",
  "unknownFounder": "Founder: not verified.",
  "roleEvidence": "Role evidence",
  "latestUpdate": "Latest recorded update:",
  "sources": "Sources",
  "noSources": "Sources not yet recorded.",
  "lastChecked": "Last checked:",
  "unverified": "not verified",
  "statusNotice": "Status reflects the cited evidence at that time.",
  "reportsNotice": "Selected reports from cited sources; this is not a complete incident or industry record.",
  "summaryEvidence": "Summary & evidence",
  "coverage": "Coverage:",
  "dateBasis": "Date basis:",
  "commitNotice": "; a commit date, not a verified release date.",
  "languageNotice": "Curated content · English",
  "heading": "Explore the Nostr ecosystem",
  "intro": "Discover projects, their current status and the people behind them. Inclusion in this directory does not imply a Nostr WoT integration or endorsement.",
  "directoryChecked": "Directory checked:",
  "directoryNotice": "Expand a project to inspect its evidence. Unknown means status could not be verified.",
  "roundup": "Fortnightly new-project roundup",
  "roundupStart": "The planned editorial cadence is every two weeks, covering new projects and notable updates. Browse the",
  "blog": "blog",
  "roundupMiddle": "for published articles and the",
  "newsroom": "newsroom",
  "roundupEnd": "for industry reporting.",
  "searchRegion": "Search ecosystem projects",
  "search": "Search projects or people",
  "placeholder": "Name, description or person",
  "category": "Category",
  "allCategories": "All categories",
  "status": "Status",
  "allStatuses": "All statuses",
  "of": "of",
  "projects": "projects",
  "clear": "Clear filters",
  "noMatches": "No projects match these filters. Try another search or clear the filters.",
  "empty": "The researched directory is being prepared. Project entries will appear here once their sources have been checked.",
  "newsTitle": "Recent ecosystem news",
  "securityTitle": "Security reports",
  "statuses": {
    "active": "Active",
    "beta": "Beta",
    "archived": "Archived",
    "unknown": "Unknown"
  },
  "roles": {
    "founder": "founder",
    "maintainer": "maintainer",
    "creator": "creator"
  }
};

export function ecosystemCopy(locale = "en"): typeof englishCopy {
  return locale === "es" ? spanishMessages.directory : englishCopy;
}
