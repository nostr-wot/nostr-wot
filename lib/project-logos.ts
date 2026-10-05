import manifest from '@/data/project-logos.json';

export type ProjectLogo = {
  file: string;
  sourceUrl: string;
  sourceKind: 'repository-asset' | 'website-icon' | 'website-og-image' | 'owner-avatar';
  ownerType: 'organization' | 'user';
  width: number;
  height: number;
  bytes: number;
  fetchedAt: string;
};

type LogoRecord = (ProjectLogo & { file: string }) | { file: null; reason: string };

const logos = manifest.logos as unknown as Record<string, LogoRecord>;

// Returns undefined for a project with no logo. Four of the 41 have none: a
// specification repository with no mark of its own, and three whose only
// candidate was a personal account avatar, which pictures a person rather than
// the project. An empty slot is honest; a stand-in mark would not be.
export function getProjectLogo(id: string): ProjectLogo | undefined {
  const record = logos[id];
  return record && record.file ? record : undefined;
}

export function logoIds(): string[] {
  return Object.keys(logos);
}
