import { peopleCrumbs, roleLabels, type Person } from '@/lib/people';
import { getPersonProfile } from '@/lib/people-profiles';
import { focus } from '@/components/projects/shared';
import { Breadcrumbs, cardShell } from '@/components/ui';
import PersonAvatar from './PersonAvatar';

/**
 * Every person the directory credits, as a reachable index.
 *
 * This exists because each person's page had exactly one inbound link, inside a
 * tab panel on one project page. A crawler that never opened that tab had no
 * path to any of them, and a reader who wanted to know who builds on Nostr had
 * nowhere to start. The project pages still link to the individuals; this is
 * the hub that makes the set navigable.
 *
 * Deliberately not `PersonCard`: that card presents ONE credited role, which is
 * what a project page needs. Here a person is the subject and the roles are the
 * list, so showing fiatjaf's six projects through six separate cards would
 * misrepresent the record as six people.
 */
export default function PeopleIndex({ people, locale, pathPrefix, labels }: {
  people: Person[];
  locale: string;
  /** "" for English, "/<locale>" otherwise. */
  pathPrefix: string;
  labels: { heading: string; intro: string; countLine: string; projects: string; breadcrumb: string };
}) {
  return (
    <div lang={locale} className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs items={peopleCrumbs(locale)} label={labels.breadcrumb} />

      <header className="mt-6">
        <h1 className="text-3xl font-bold md:text-4xl">{labels.heading}</h1>
        <p className="mt-3 max-w-3xl text-gray-600 dark:text-gray-300">{labels.intro}</p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{labels.countLine}</p>
      </header>

      <ul className="mt-8 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {people.map(person => {
          const profile = getPersonProfile(person.name);
          // The same role on two projects is still two credits, but the same
          // role name should read once in the summary line.
          const roles = roleLabels(person.roles.map(role => role.role), locale);
          return (
            <li key={person.slug}>
              <article className={`group flex h-full gap-4 p-5 ${cardShell}`}>
                <PersonAvatar
                  avatar={profile?.avatar}
                  name={person.name}
                  className="size-12 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold leading-tight">
                    <a
                      href={`${pathPrefix}/people/${person.slug}`}
                      className={`rounded hover:text-primary group-hover:underline underline-offset-4 ${focus}`}
                    >
                      {person.name}
                    </a>
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">{roles}</p>
                  {/* The projects are named rather than counted, because the
                    * project is the only thing that makes a credit meaningful.
                    * They are plain text here: each one is a link on the
                    * person's own page, and repeating forty of them as links
                    * on the hub would dilute every one of them. */}
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{labels.projects}</span>{' '}
                    {person.roles.map(role => role.projectName).join(', ')}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
