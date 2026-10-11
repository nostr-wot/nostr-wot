import { localePrefix } from '@/lib/metadata';
import { pluralForm } from '@/lib/plural';
import { profileIdentity } from '@/lib/people-profiles';
import { SEO_LIMITS, firstFit, fitText, length as graphemes } from '@/lib/metadata-policy';
import { ecosystemCopy, isSafeExternalUrl, type EcosystemData, type EcosystemProject, type EvidenceLink } from '@/lib/ecosystem-projects';

import enMessages from '@/messages/en/people.json';
import esMessages from '@/messages/es/people.json';
import ptMessages from '@/messages/pt/people.json';
import ruMessages from '@/messages/ru/people.json';
import itMessages from '@/messages/it/people.json';
import frMessages from '@/messages/fr/people.json';
import deMessages from '@/messages/de/people.json';

const peopleMessages = { en: enMessages, es: esMessages, pt: ptMessages, ru: ruMessages, it: itMessages, fr: frMessages, de: deMessages };

/** Read by direct import rather than through `getTranslations`, exactly as
 * `ecosystemCopy` does: the sitemap, `generateStaticParams` and the SEO
 * composition below all run outside a request scope, where a next-intl
 * translator is not available. The fallback is per locale, never per key, so a
 * key added to English and forgotten in another language renders undefined
 * rather than silently English.
 */
export function peopleCopy(locale = 'en'): typeof enMessages {
  return peopleMessages[locale as keyof typeof peopleMessages] ?? enMessages;
}

export type PersonRoleName = EcosystemProject['people'][number]['role'];

/** One credited role: which project, which role, and the evidence for it.
 * Every field is copied from the project record it came from, so a role can
 * never say more than the dataset already does. */
export type PersonRole = {
  projectId: string;
  projectName: string;
  role: PersonRoleName;
  profiles: EvidenceLink[];
  sourceUrl: string;
};

export type Person = {
  slug: string;
  name: string;
  roles: PersonRole[];
};

/** The kebab-cased name, which is the only identifier these records carry: the
 * dataset holds no per-person id. Marks are stripped after NFD so an accented
 * Latin name yields an ASCII slug, and `\p{L}`/`\p{N}` are kept so a name in a
 * non-Latin script still produces a slug rather than an empty string.
 * Lowercasing is pinned to 'en' (as `filterProjects` does) so the slug does not
 * depend on the server's locale: Turkish would otherwise map "I" to "ı".
 */
export function personSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('en')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

/** Every credited person in the dataset, in first-appearance order, with all
 * of their roles.
 *
 * Grouping is by slug rather than by name, because the slug is what the route
 * resolves: two names that kebab-case to one slug must render as one page
 * carrying both roles, otherwise one of them would be unreachable. Slug
 * distinctness is pinned by a test, and several people do hold several roles:
 * fiatjaf is credited on six projects and renders as one page.
 *
 * A role whose `sourceUrl` is not a usable external citation is skipped. This
 * is the same rule `ProjectDetail` applies before listing a person, and it
 * matters more here: a person page IS that citation, so an unevidenced role
 * must not bring one into existence. A person left with no evidenced role
 * therefore gets no page, which is also why the sitemap and
 * `generateStaticParams` derive their inventory from this function.
 */
export function getPeople(data: EcosystemData): Person[] {
  const people = new Map<string, Person>();
  for (const project of data.projects ?? []) {
    for (const person of project.people ?? []) {
      if (!isSafeExternalUrl(person.sourceUrl)) continue;
      const slug = personSlug(person.name);
      if (!slug) continue;
      const entry = people.get(slug) ?? { slug, name: person.name, roles: [] };
      entry.roles.push({
        projectId: project.id,
        projectName: project.name,
        role: person.role,
        profiles: person.profiles ?? [],
        sourceUrl: person.sourceUrl,
      });
      people.set(slug, entry);
    }
  }
  return [...people.values()];
}

export function getPerson(data: EcosystemData, slug: string): Person | undefined {
  return getPeople(data).find(person => person.slug === slug);
}

/** The directory's own role labels, so a role reads identically on a person
 * page and on the project page that credits it. Shaped like `categoryLabel`. */
export function roleLabel(role: string, locale = 'en'): string {
  const labels: Record<string, string> = ecosystemCopy(locale).roles;
  return labels[role] ?? role;
}


/** Names here run from 6 ("Fabian") to 15 ("William Casarin") graphemes, which
 * is most of the 13-grapheme title window on its own, so the templates are an
 * ordered list and not one format string.
 *
 * People credited on more than one project get their own template, because the
 * singular list says "the credited role" and five people here hold two or more
 * (fiatjaf holds six). Their names are all short — 3 ("v0l") to 11
 * ("greenart7c3") graphemes — so one template spans them, and it is still run
 * through `firstFit` with the singular list behind it so a longer name added
 * later degrades to a shorter form instead of overflowing the window. */
export function personTitle(person: Person, locale = 'en'): string {
  const copy = peopleCopy(locale);
  const templates: string[] = person.roles.length > 1
    ? [copy.titlePlural, ...copy.titleTemplates]
    : copy.titleTemplates;
  return firstFit(templates.map(template => template.replace('{name}', person.name)), ...SEO_LIMITS.title);
}

/** The description names the credited role's project — but only for the people
 * who hold exactly one. Naming the first of several, as this used to, produced
 * a description that claimed all six of fiatjaf's roles were on nos2x. Anyone
 * with more than one role gets a template that states the count instead and
 * names no project, since the page lists every project in full.
 *
 * The role LABEL is deliberately not interpolated, only the project name. Its
 * translations run from 7 graphemes ("Gründer") to 28 ("Responsable de
 * mantenimiento"), a 21-grapheme spread that no fixed template can absorb
 * inside a 13-grapheme window; the page itself states the role in full.
 *
 * The authored templates land inside the window for every credited person in
 * all seven locales (pinned by a test), so `fitText` is reached only if the dataset
 * changes under them. It is still applied, with the authored suffixes sorted
 * shortest-first, so that even then the policy's generic filler is not what
 * ships.
 */
export function personDescription(person: Person, locale = 'en'): string {
  const copy = peopleCopy(locale);
  const projectName = person.roles[0]?.projectName ?? '';
  const [min, max] = SEO_LIMITS.description;
  const count = person.roles.length;
  // An ordered list for the plural case too, for the same reason the singular
  // case has one: a single template would need a static length of exactly 141
  // to span a 3-grapheme name ("v0l") and a 15-grapheme one ("Fabricio
  // Acosta") inside a 13-grapheme window. The longer entry is preferred and the
  // shorter one catches the long names.
  const templates: string[] = count > 1 ? copy.descriptionPlural : copy.descriptionTemplates;
  // The noun has to agree with the numeral beside it; see lib/plural.ts.
  const roles = pluralForm(locale, count, copy.rolesPlural);
  const candidates = templates.map(template => template
    .replace('{name}', person.name)
    .replace('{count}', String(count))
    .replace('{roles}', roles)
    .replace('{project}', projectName));
  const fitted = firstFit(candidates, min, max);
  if (graphemes(fitted) >= min) return fitted;
  const suffixes = [...copy.descriptionSuffixes].sort((left, right) => graphemes(left) - graphemes(right));
  return fitText(fitted, min, max, suffixes, ' ');
}

/** Several role labels, joined for display and each capitalised on its own.
 *
 * `first-letter:uppercase` in CSS only reaches the first item, so a joined list
 * read "Founder, creator" in English, where the authored labels are lowercase
 * and the capital comes from the stylesheet. Capitalising per label also leaves
 * a multi-word label alone, which `capitalize` would not: Spanish's
 * "Responsable de mantenimiento" must not become "Responsable De Mantenimiento".
 *
 * Duplicates collapse: the same role credited on two projects is one label. */
export function roleLabels(roles: string[], locale = 'en'): string {
  return [...new Set(roles.map(role => roleLabel(role, locale)))]
    .map(label => {
      const [first, ...rest] = Array.from(label);
      return first ? first.toLocaleUpperCase(locale) + rest.join('') : label;
    })
    .join(', ');
}

/** The trail to the people index, as locale-prefixed site paths. Shared by the
 * index page's graph and its `Breadcrumbs`, so the two cannot drift.
 *
 * People sit directly under the home page, not under the directory. The URL is
 * `/people/<slug>`, not `/projects/people/<slug>`, and a BreadcrumbList that
 * puts Projects in the middle claims a hierarchy the site does not have. The
 * two sections are siblings: a person is credited ON projects and links to each
 * of them, which is a relation, not a parent. */
export function peopleCrumbs(locale = 'en'): { name: string; path: string }[] {
  const prefix = localePrefix(locale);
  return [
    { name: 'Nostr WoT', path: prefix },
    { name: peopleCopy(locale).breadcrumbPeople, path: `${prefix}/people` },
  ];
}

/** The trail to one person's page. */
export function personCrumbs(person: Person, locale = 'en'): { name: string; path: string }[] {
  return [...peopleCrumbs(locale), { name: person.name, path: `${localePrefix(locale)}/people/${person.slug}` }];
}

/** A `Person` graph and its breadcrumbs.
 *
 * Only what the dataset evidences is emitted: the name, the URL of this page,
 * and `sameAs` for each recorded profile URL that is safe to publish. No
 * `jobTitle` or `worksFor` (the credited role is a directory record, not a
 * statement of employment), no image, no birth date, no location: these records
 * hold none of that, and a Person graph is the wrong place to invent any of it.
 */
export function personJsonLd({ person, url, locale }: { person: Person; url: string; locale: string }) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostrwot.com';
  const copy = peopleCopy(locale);
  // Deduplicated by what each URL identifies rather than by its spelling: the
  // dataset cites one Nostr profile as an npub, as an nprofile and as a
  // `nostr:`-prefixed nprofile, which put three `sameAs` entries in the graph
  // for a single profile. The first spelling of each identity is the one
  // published.
  const byIdentity = new Map<string, string>();
  for (const url of person.roles.flatMap(role => role.profiles.map(profile => profile.url))) {
    if (!isSafeExternalUrl(url)) continue;
    const identity = profileIdentity(url);
    if (!byIdentity.has(identity)) byIdentity.set(identity, url);
  }
  const sameAs = [...byIdentity.values()];

  const graph = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    url,
    ...(sameAs.length ? { sameAs } : {}),
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    // Built from the same list the page renders. The "people" crumb used to be
    // named "People in the directory" while pointing at /projects, because no
    // people index existed to point at; it now points at the index that does.
    itemListElement: personCrumbs(person, locale).map((crumb, index) => ({
      '@type': 'ListItem', position: index + 1, name: crumb.name, item: `${base}${crumb.path}`,
    })),
  };

  return [graph, breadcrumbs];
}
