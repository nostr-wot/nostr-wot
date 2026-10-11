import { ecosystemCopy, splitLabelNote } from '@/lib/ecosystem-projects';
import { ecosystemDetail } from '@/lib/project-seo';
import { peopleCopy, personCrumbs, roleLabel, type Person } from '@/lib/people';
import { getPersonProfile, mergeProfileLinks, profileLinkLabel } from '@/lib/people-profiles';
import { Badge, Breadcrumbs, Card, Tooltip } from '@/components/ui';
import { ExternalIconLink, ExternalLink, focus } from '@/components/projects/shared';
import { NostrLogo } from '@/components/icons';
import PersonAvatar from './PersonAvatar';
import { iconButton } from '@/components/ui';

/**
 * A person's page in the ecosystem directory: the roles credited to them, the
 * source that evidences each one, the profile links those sources give, and
 * whatever else the committed profile record holds, which is their own words
 * where they publish them, the other projects they are credited with creating,
 * and their talks and interviews. Every one of those carries the source it was
 * taken from, and nothing appears that a source does not state. The page is an
 * evidence record, not a biography.
 *
 * The profile record was already read by the person CARD on a project page,
 * so until this page read it too, a person's own page showed strictly less
 * than the card linking to it.
 *
 * Laid out as the sibling project page is (`components/projects/ProjectDetail`)
 * so a reader arriving from one recognises the other, and linking back to the
 * directory the same way.
 *
 * `pathPrefix` is '' for English and '/<locale>' otherwise, matching the
 * 'as-needed' locale prefix. It is passed in rather than built from `locale`
 * here, and the internal links are plain anchors rather than next-intl's
 * `Link`, so this stays renderable outside a request scope (which is what lets
 * the tests render it directly).
 */
export default function PersonDetail({ person, locale, pathPrefix }: {
  person: Person;
  locale: string;
  pathPrefix: string;
}) {
  const t = peopleCopy(locale);
  // `nostrProfile`, `source` and `website` are already translated for the
  // project page's person cards. Read them from there rather than keeping a
  // second copy of the same three words in this namespace.
  const d = ecosystemDetail(locale);
  const websiteLabel = ecosystemCopy(locale).website;
  const profile = getPersonProfile(person.name);
  // The dataset cites a profile per credited role, so a person credited on six
  // projects carries the same GitHub link six times. Merged on URL with the
  // researched links, the page lists each one once.
  const links = mergeProfileLinks(person.roles.map(role => role.profiles), profile?.links);

  return (
    <article lang={locale} className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs items={personCrumbs(person, locale)} label={d.breadcrumb} />

      <header className="mt-6">
        <div className="flex items-center gap-4">
          {/* The one image above the fold on this page, so it is not lazy. */}
          <PersonAvatar avatar={profile?.avatar} name={person.name} className="size-16 text-xl" priority />
          <h1 className="text-3xl font-bold md:text-4xl">{person.name}</h1>
        </div>

        {profile?.selfDescription && (
          <figure className="mt-4">
            {/* Their own words, in the language they wrote them, marked as a
                quotation and carrying its own lang. Translating someone's self
                description would misquote them. The source is a visible link
                rather than a tooltip, because a paragraph is not focusable and
                a hover-only citation is unreachable by keyboard. */}
            <blockquote lang="en" className="border-l-2 border-primary pl-4 italic leading-relaxed text-gray-600 dark:text-gray-300">
              {profile.selfDescription.text}
            </blockquote>
            <figcaption className="mt-1 pl-4 text-xs">
              <ExternalLink locale={locale} url={profile.selfDescription.sourceUrl} className="underline underline-offset-4 hover:text-primary">
                {d.source}
              </ExternalLink>
            </figcaption>
          </figure>
        )}

        {(links.length > 0 || profile?.npub) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {links.map(link => (
              <ExternalIconLink key={link.url} url={link.url} label={profileLinkLabel(link, websiteLabel)} locale={locale} />
            ))}
            {profile?.npub && (
              // Internal, so it stays in this tab and is crawlable: the site
              // has its own Nostr profile viewer.
              <Tooltip label={d.nostrProfile} trigger="child" announce={false}>
                <a href={`${pathPrefix}/profile/${profile.npub}`} className={`${iconButton} ${focus}`}>
                  <NostrLogo className="size-4" />
                  <span className="sr-only">{d.nostrProfile}</span>
                </a>
              </Tooltip>
            )}
          </div>
        )}

        <p className="mt-4 text-gray-600 dark:text-gray-300">{t.scope}</p>
      </header>

      <section className="mt-8">
        <h2 className="text-xl font-bold">{t.creditedRoles}</h2>
        <ul className="mt-4 space-y-4">
          {person.roles.map(role => (
            <li key={`${role.projectId}-${role.role}`}>
              <Card padding="md">
                <Badge variant="neutral" size="sm" className="capitalize">{roleLabel(role.role, locale)}</Badge>
                <p className="mt-3 text-sm">
                  <strong>{t.project}</strong>{' '}
                  <a href={`${pathPrefix}/projects/${role.projectId}`} className={`underline underline-offset-4 hover:text-primary ${focus}`}>
                    {role.projectName}
                  </a>
                </p>
                <p className="mt-2 text-sm">
                  <ExternalLink locale={locale} url={role.sourceUrl}>{t.roleEvidence}</ExternalLink>
                </p>
                <h3 className="mt-4 text-sm font-bold">{t.profiles}</h3>
                {role.profiles.length
                  ? (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                      {role.profiles.map((profile, index) => {
                        // The dataset states how a profile was established in a
                        // parenthetical on the label ("GitHub (linked by the
                        // personal site)"). `splitLabelNote` moves that into a
                        // tooltip, which is how the project page shows the same
                        // labels, so the two do not drift apart.
                        const { text, note } = splitLabelNote(profile.label);
                        const link = <ExternalLink locale={locale} url={profile.url}>{text}</ExternalLink>;
                        return note
                          ? <Tooltip key={`${profile.url}-${index}`} label={note} trigger="child">{link}</Tooltip>
                          : <span key={`${profile.url}-${index}`}>{link}</span>;
                      })}
                    </div>
                  )
                  : <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t.noProfiles}</p>}
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {profile?.alsoBuilt?.length ? (
        <section className="mt-8">
          <h2 className="text-xl font-bold">{t.alsoBuilt}</h2>
          {/* Projects outside this directory, so they are outbound links rather
            * than links to a record here. The relationship is the one the
            * source states, labelled from the messages so it is not an English
            * word on a translated page. */}
          <ul className="mt-4 space-y-3 text-sm">
            {profile.alsoBuilt.map(built => (
              <li key={built.url + built.name}>
                <ExternalLink locale={locale} url={built.url}>{built.name}</ExternalLink>
                {' · '}
                <span className="text-gray-600 dark:text-gray-300">
                  {t.builtRelationships[built.relationship as keyof typeof t.builtRelationships] ?? built.relationship}
                </span>
                {' · '}
                <ExternalLink locale={locale} url={built.sourceUrl} className="underline underline-offset-4 hover:text-primary">
                  {d.source}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile?.talks?.length ? (
        <section className="mt-8">
          <h2 className="text-xl font-bold">{t.talks}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {profile.talks.map(talk => (
              <li key={talk.url}>
                {/* The title is the work's own, in the language it was
                  * published in, so it is not translated and carries its lang. */}
                <ExternalLink locale={locale} url={talk.url}><span lang="en">{talk.title}</span></ExternalLink>
                {talk.publisher || talk.date ? (
                  <span className="text-gray-600 dark:text-gray-300">
                    {' · '}
                    {talk.publisher}
                    {talk.publisher && talk.date ? ', ' : ''}
                    {talk.date ? <time dateTime={talk.date}>{talk.date}</time> : null}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
