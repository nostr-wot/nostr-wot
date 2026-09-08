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

export function categoryLabel(category: string): string {
  const label = category.replace(/[-_]+/g, ' ').trim();
  return label ? label[0].toUpperCase() + label.slice(1) : 'Uncategorized';
}

export function newsDateLabel(dateBasis?: string): string {
  return dateBasis && /commit|tag/i.test(dateBasis) ? 'Commit date' : 'Date';
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

export function ecosystemJsonLd(data: EcosystemData, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Nostr ecosystem directory',
    description: 'A curated directory of Nostr projects, status, people and sources. Listing does not imply a Web of Trust integration.',
    url,
    inLanguage: 'en',
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
