import { type EcosystemData, type EcosystemProject } from '@/lib/ecosystem-projects';
import { getProjectSnapshot } from '@/lib/ecosystem-snapshot';

/**
 * Projects a reader of this one is plausibly also looking for.
 *
 * Similarity is derived, never hand-assigned: same category first, then ranked
 * by how many repository topics the two share, then by whether the project is
 * still active. Topics come from the committed GitHub snapshot, so this says
 * only what the data says. Projects with no category peers return nothing
 * rather than being padded with unrelated entries.
 */
export function similarProjects(project: EcosystemProject, data: EcosystemData, limit = 8): EcosystemProject[] {
  const topics = new Set(getProjectSnapshot(project.id)?.topics ?? []);
  return data.projects
    .filter(candidate => candidate.id !== project.id && candidate.category === project.category)
    .map(candidate => ({
      candidate,
      shared: (getProjectSnapshot(candidate.id)?.topics ?? []).filter(topic => topics.has(topic)).length,
      active: candidate.status === 'active' ? 1 : 0,
    }))
    .sort((a, b) => b.shared - a.shared || b.active - a.active || a.candidate.name.localeCompare(b.candidate.name, 'en'))
    .slice(0, limit)
    .map(entry => entry.candidate);
}
