import { type EcosystemProject } from '@/lib/ecosystem-projects';
import { personSlug, roleLabel } from '@/lib/people';
import { getPersonProfile, mergeProfileLinks, profileLinkLabel } from '@/lib/people-profiles';
import { ExternalIconLink, ExternalLink, focus } from '@/components/projects/shared';
import { Tooltip, cardShell, iconButton } from '@/components/ui';
import { NostrLogo } from '@/components/icons';
import PersonAvatar from './PersonAvatar';

type DatasetPerson = EcosystemProject['people'][number];

/**
 * One credited person, as a card. Used by a project page's People tab.
 *
 * Every link here comes from the dataset or from the committed profile record,
 * and both carry the source they were taken from. The avatar is the person's
 * own public developer-profile image.
 */
export default function PersonCard({ person, locale, localePrefix, labels }: {
  person: DatasetPerson;
  locale: string;
  /** "" for English, "/<locale>" otherwise. */
  localePrefix: string;
  labels: { roleEvidence: string; nostrProfile: string; source: string; website: string };
}) {
  const profile = getPersonProfile(person.name);
  const slug = personSlug(person.name);

  // The dataset's profiles and the researched links overlap on GitHub, X and
  // personal sites, so they are merged on URL (see `mergeProfileLinks`).
  const links = mergeProfileLinks(person.profiles, profile?.links);

  return (
    <article className={`group flex gap-4 p-5 ${cardShell}`}>
      <PersonAvatar
        avatar={profile?.avatar}
        name={person.name}
        className="size-14 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
      />
      <div className="min-w-0 flex-1">
        <h3 className="font-bold leading-tight">
          <a href={`${localePrefix}/people/${slug}`} className={`rounded hover:text-primary group-hover:underline underline-offset-4 ${focus}`}>
            {person.name}
          </a>
        </h3>
        <p className="mt-0.5 text-xs first-letter:uppercase text-gray-600 dark:text-gray-300">{roleLabel(person.role, locale)}</p>

        {profile?.selfDescription && (
          // Their own words. The source is a visible link rather than a
          // tooltip: a paragraph is not focusable, so hiding the citation
          // behind hover put it out of reach of the keyboard entirely.
          <figure className="mt-2">
            {/* A direct quote in the language its author wrote it, so it carries
                its own lang and is marked as a quotation rather than being
                presented as this page's prose. Translating someone's own words
                would misquote them. */}
            <blockquote lang="en" className="text-sm italic leading-relaxed text-gray-600 dark:text-gray-300">
              {profile.selfDescription.text}
            </blockquote>
            <figcaption className="mt-1 text-xs">
              <ExternalLink locale={locale} url={profile.selfDescription.sourceUrl} className="underline underline-offset-4 hover:text-primary">
                {labels.source}
              </ExternalLink>
            </figcaption>
          </figure>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {links.map(link => (
            <ExternalIconLink key={link.url} url={link.url} label={profileLinkLabel(link, labels.website)} locale={locale} />
          ))}
          {profile?.npub && (
            // Internal, so it stays in this tab and is crawlable: the site has
            // its own Nostr profile viewer.
            <Tooltip label={labels.nostrProfile} trigger="child" announce={false}>
              <a
                href={`${localePrefix}/profile/${profile.npub}`}
                className={`${iconButton} ${focus}`}
              >
                <NostrLogo className="size-4" />
                <span className="sr-only">{labels.nostrProfile}</span>
              </a>
            </Tooltip>
          )}
        </div>

        <p className="mt-3 text-xs">
          <ExternalLink locale={locale} url={person.sourceUrl}>{labels.roleEvidence}</ExternalLink>
        </p>
      </div>
    </article>
  );
}
