import { cardShell } from '@/components/ui';
import { categoryLabel, ecosystemDate, type EcosystemProject } from '@/lib/ecosystem-projects';
import type { ProjectSnapshot } from '@/lib/ecosystem-snapshot';
import { ExternalLink, StatusBadge } from './shared';

export type InfoboxLabels = {
  quickFacts: string;
  category: string;
  status: string;
  launched: string;
  license: string;
  primaryLanguage: string;
  latestRelease: string;
  firstPublished: string;
  lastPush: string;
  topics: string;
  renamedFrom: string;
  peopleCredited: string;
  lastChecked: string;
  notStated: string;
};

/**
 * The project's facts at a glance, beside the story on the overview tab.
 *
 * This absorbed the "Repository facts" section rather than sitting next to it:
 * the licence, language, creation and push dates were already listed as prose
 * paragraphs a few lines above, and two copies of the same facts on one tab is
 * worse than either on its own.
 *
 * A `<dl>` rather than the `<p><strong>label</strong> value</p>` pattern the
 * directory cards use, because this IS a term-and-value table and a reader
 * moving through it by keyboard or screen reader gets the pairing for free.
 * Rows with nothing behind them are omitted, never filled with a dash: the only
 * fact that renders a placeholder is one the record explicitly leaves unstated.
 */
export default function ProjectInfobox({ project, snapshot, locale, peopleCount, labels }: {
  project: EcosystemProject;
  snapshot?: ProjectSnapshot;
  locale: string;
  peopleCount: number;
  labels: InfoboxLabels;
}) {
  const story = project.story;
  // A prerelease is not the latest version of anything.
  const stable = snapshot?.releases.find(release => !release.prerelease);
  const renamed = snapshot && snapshot.canonicalSlug.toLowerCase() !== snapshot.slug.toLowerCase();

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: labels.category, value: categoryLabel(project.category, locale) },
    { label: labels.status, value: <StatusBadge status={project.status} locale={locale} /> },
    ...(story?.launched ? [{
      label: labels.launched,
      value: story.launchedSourceUrl
        ? <ExternalLink locale={locale} url={story.launchedSourceUrl}>
            <time dateTime={story.launched}>{ecosystemDate(story.launched, locale)}</time>
          </ExternalLink>
        : <time dateTime={story.launched}>{ecosystemDate(story.launched, locale)}</time>,
    }] : []),
    ...(snapshot ? [
      { label: labels.license, value: snapshot.license ?? labels.notStated },
      { label: labels.primaryLanguage, value: snapshot.language ?? labels.notStated },
      ...(stable ? [{
        label: labels.latestRelease,
        value: <ExternalLink locale={locale} url={stable.url}>{stable.tag}</ExternalLink>,
      }] : []),
      { label: labels.firstPublished, value: <time dateTime={snapshot.createdAt}>{ecosystemDate(snapshot.createdAt, locale)}</time> },
      { label: labels.lastPush, value: <time dateTime={snapshot.pushedAt}>{ecosystemDate(snapshot.pushedAt, locale)}</time> },
      ...(renamed ? [{
        label: labels.renamedFrom,
        value: <ExternalLink locale={locale} url={`https://github.com/${snapshot.canonicalSlug}`}>{snapshot.canonicalSlug}</ExternalLink>,
      }] : []),
    ] : []),
    ...(peopleCount > 0 ? [{ label: labels.peopleCredited, value: String(peopleCount) }] : []),
    ...(project.lastVerified ? [{
      label: labels.lastChecked,
      value: <time dateTime={project.lastVerified}>{ecosystemDate(project.lastVerified, locale)}</time>,
    }] : []),
  ];

  return (
    <aside className={`${cardShell} p-5 text-sm`} aria-labelledby="project-quick-facts">
      <h2 id="project-quick-facts" className="text-base font-bold">{labels.quickFacts}</h2>
      <dl className="mt-3 space-y-2.5">
        {rows.map(row => (
          <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <dt className="text-gray-600 dark:text-gray-400">{row.label}</dt>
            <dd className="text-right font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
      {snapshot?.topics.length ? (
        <>
          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">{labels.topics}</h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {snapshot.topics.map(topic => (
              <li key={topic} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">{topic}</li>
            ))}
          </ul>
        </>
      ) : null}
    </aside>
  );
}
