import { ecosystemDate, type EcosystemProject } from '@/lib/ecosystem-projects';
import { ExternalLink } from './shared';

export type StoryLabels = {
  heading: string;
  launched: string;
  nameOrigin: string;
  motivation: string;
  milestones: string;
  nothingFound: string;
  source: string;
};

/** One labelled paragraph of the story, with the link that evidences it. */
function Claim({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">{label}</h3>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/**
 * How the project came to exist, told from its own sources.
 *
 * Every claim here is one a source states, and carries the link to it. Nothing
 * is inferred: 35 of the 41 projects have no published explanation of their
 * name, so this section simply has no name paragraph for them rather than a
 * guess at what "Khatru" or "strfry" might mean. One project (go-nostr) has no
 * launch announcement, no name explanation and no statement of motivation at
 * all, and gets the one-line notice instead of an empty section.
 *
 * `docs/ecosystem-story-research.md` records what was looked for and not found,
 * so a later pass does not fill a gap with something plausible.
 */
export default function ProjectStory({ project, locale, labels }: {
  project: EcosystemProject;
  locale: string;
  labels: StoryLabels;
}) {
  const story = project.story;

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-bold">{labels.heading}</h2>

      {!story ? (
        <p className="text-gray-600 dark:text-gray-300">{labels.nothingFound}</p>
      ) : (
        <>
          {story.launched && (
            <Claim label={labels.launched}>
              <p>
                <time dateTime={story.launched} className="font-medium">{ecosystemDate(story.launched, locale)}</time>
                {story.launchedNote ? <>{' · '}{story.launchedNote}</> : null}
                {story.launchedSourceUrl && (
                  <>
                    {' · '}
                    <ExternalLink locale={locale} url={story.launchedSourceUrl} className="underline underline-offset-4">
                      {labels.source}
                    </ExternalLink>
                  </>
                )}
              </p>
            </Claim>
          )}

          {story.nameOrigin && (
            <Claim label={labels.nameOrigin}>
              <p>
                {story.nameOrigin.text}{' · '}
                <ExternalLink locale={locale} url={story.nameOrigin.sourceUrl} className="underline underline-offset-4">
                  {labels.source}
                </ExternalLink>
              </p>
            </Claim>
          )}

          {story.motivation && (
            <Claim label={labels.motivation}>
              <p>
                {story.motivation.text}{' · '}
                <ExternalLink locale={locale} url={story.motivation.sourceUrl} className="underline underline-offset-4">
                  {labels.source}
                </ExternalLink>
              </p>
            </Claim>
          )}

          {story.milestones?.length ? (
            <Claim label={labels.milestones}>
              {/* Oldest first, and sorted in the data rather than here: a
                * changelog tag, a grant or a public demo can predate the launch
                * the record gives, so the order cannot assume the launch is
                * first. */}
              <ol className="mt-1 space-y-3 border-l border-gray-200 pl-4 dark:border-gray-800">
                {story.milestones.map(milestone => (
                  <li key={milestone.sourceUrl + milestone.date} className="relative">
                    <span aria-hidden="true" className="absolute -left-[1.3125rem] top-2 size-2 rounded-full bg-primary" />
                    <time dateTime={milestone.date} className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {ecosystemDate(milestone.date, locale)}
                    </time>
                    <p className="mt-0.5">
                      {milestone.title}{' · '}
                      <ExternalLink locale={locale} url={milestone.sourceUrl} className="underline underline-offset-4">
                        {labels.source}
                      </ExternalLink>
                    </p>
                  </li>
                ))}
              </ol>
            </Claim>
          ) : null}
        </>
      )}
    </section>
  );
}
