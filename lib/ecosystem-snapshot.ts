import snapshot from '@/lib/generated/ecosystem-snapshot.json';

export type Release = { tag: string; date: string; url: string; prerelease: boolean };

export type ProjectSnapshot = {
  slug: string;
  canonicalSlug: string;
  archived: boolean;
  createdAt: string;
  pushedAt: string;
  license: string | null;
  language: string | null;
  topics: string[];
  releases: Release[];
};

const projects = snapshot.projects as unknown as Record<string, ProjectSnapshot>;

export function getProjectSnapshot(id: string): ProjectSnapshot | undefined {
  return projects[id];
}

export function snapshotGeneratedAt(): string {
  return snapshot.generatedAt;
}

export function snapshotIds(): string[] {
  return Object.keys(projects);
}
