import { localePrefix } from '@/lib/metadata';
import { SEO_LIMITS, clean as normalize, firstFit, fitText, length as graphemes } from '@/lib/metadata-policy';
import { categoryLabel, ecosystemCopy, isSafeExternalUrl, type EcosystemProject } from '@/lib/ecosystem-projects';
import type { ProjectSnapshot } from '@/lib/ecosystem-snapshot';


// A word character for the purpose of "this cut split a token", across all
// seven locales: letters and digits in any script, nothing else. A hyphen is
// deliberately not one, so a hyphenated compound may be cut at its hyphen.
const wordCharacter = /[\p{L}\p{N}]/u;

/** A word-boundary excerpt of a summary that is already longer than the window,
 * cut as late as the upper bound allows.
 *
 * `fitText` has a last-resort branch that cuts blind at the character level,
 * because it only scans back from the upper bound as far as the lower bound:
 * about 13 characters here. A German compound is longer than that on its own,
 * which is how `…erfasst die Android-Veröffe…` reached a meta description. This
 * scans back as far as it needs to instead, and is applied before `fitText`
 * ever sees an over-long summary so that branch is not reached.
 *
 * Whitespace boundaries are tried first, so the cut normally falls between
 * words. Only if no whitespace cut reaches the lower bound does any other
 * non-word character count as a boundary, which is what lets one long
 * hyphenated token be cut at its hyphen rather than drag the excerpt below the
 * lower bound, where `withMetadataPolicy` would pad it with generic filler.
 */
function wordBoundaryExcerpt(summary: string, min: number, max: number): string {
  const chars = Array.from(summary);
  const boundaries = [
    (character: string) => /\s/u.test(character),
    (character: string) => !wordCharacter.test(character),
  ];
  for (const isBoundary of boundaries) {
    // `max - 1` leaves room for the ellipsis; stripping trailing punctuation
    // only shortens the result further, so the upper bound always holds.
    for (let end = max - 1; end > 0; end--) {
      if (!isBoundary(chars[end])) continue;
      const candidate = chars.slice(0, end).join('').replace(/[\s|,:;.-]+$/u, '') + '…';
      if (graphemes(candidate) >= min) return candidate;
      // Scanning down only yields shorter candidates, so no later cut in this
      // class can reach the lower bound either. Try the next class.
      break;
    }
  }
  // Unreachable on the committed dataset: every one of the 287 composed
  // descriptions is cut on a boundary above. Kept so the hard upper bound is
  // honoured whatever a future summary looks like; the mid-word test fails
  // loudly if a dataset change ever lands here.
  return chars.slice(0, max - 1).join('').trimEnd() + '…';
}

/** First fit against a candidate list in authored order, which leads with the
 * longest candidate. Both bounds matter: a candidate under the lower bound is
 * padded by the metadata policy with generic site filler, so order can express
 * editorial preference only while the window is checked at both ends. Project
 * names run from 3 to 14 characters, which is why the templates are a list and
 * not one format string.
 *
 * With nothing inside the window, the fallback is the LONGEST candidate that
 * still respects the hard upper bound, because it is the one closest to the
 * lower bound and so loses the least of itself to the policy's generic filler.
 * It is picked by measuring rather than by index: only the head of each
 * authored list is reliably the longest, the remaining entries are in editorial
 * order. Only when every candidate is over the upper bound does the shortest
 * one win, since there the upper bound is the only one that can be honoured.
 */

export function ecosystemDetail(locale = 'en') {
  // `ecosystemCopy` resolves the whole locale object with an English fallback;
  // `detail` sits beside `directory` in the same file, so it is read the same way.
  return ecosystemCopy(locale, 'detail');
}

/**
 * The directory's own category, as one of schema.org's documented
 * `applicationCategory` values.
 *
 * This used to emit `categoryLabel(...)`, which is the TRANSLATED human label,
 * so one piece of software was a "Social client" to a crawler reading the
 * English page and "Cliente social" to one reading the Spanish page. A
 * machine-readable classification cannot depend on which locale was requested.
 *
 * The directory's own category id is emitted alongside it as
 * `applicationSubCategory`, because it is the more precise statement and
 * schema.org has no value for "Nostr relay". Both are locale invariant.
 *
 * Every category in the dataset is mapped, and a test fails if a new one is
 * added without a mapping rather than letting it fall through to a default
 * that would quietly misclassify it.
 */
const SCHEMA_APPLICATION_CATEGORY: Record<string, string> = {
  'social-client': 'SocialNetworkingApplication',
  signer: 'SecurityApplication',
  media: 'MultimediaApplication',
  // schema.org documents no server or infrastructure value; a relay, a tool and
  // a piece of infrastructure are all utilities in its vocabulary. The precise
  // statement is in `applicationSubCategory`.
  relay: 'UtilitiesApplication',
  'developer-tools': 'DeveloperApplication',
  tools: 'UtilitiesApplication',
  infrastructure: 'UtilitiesApplication',
  wallet: 'FinanceApplication',
  marketplace: 'ShoppingApplication',
  other: 'UtilitiesApplication',
};

/** The schema.org application category for a directory category, or undefined
 * when the category has no mapping (in which case the field is omitted rather
 * than guessed). Exported so a test can hold every category to a mapping. */
export function schemaApplicationCategory(category: string): string | undefined {
  return SCHEMA_APPLICATION_CATEGORY[category];
}

/** The trail to a project page, as locale-prefixed site paths.
 *
 * Shared by `projectJsonLd` and the `Breadcrumbs` the page renders, so the
 * structured data and what a reader sees cannot describe different trails.
 * Paths rather than absolute URLs, because the UI links within the site and
 * only the graph needs the origin in front. */
export function projectCrumbs(project: EcosystemProject, locale = 'en'): { name: string; path: string }[] {
  const prefix = localePrefix(locale);
  return [
    { name: 'Nostr WoT', path: prefix },
    { name: ecosystemDetail(locale).breadcrumbProjects, path: `${prefix}/projects` },
    { name: project.name, path: `${prefix}/projects/${project.id}` },
  ];
}

export function projectTitle(project: EcosystemProject, locale = 'en'): string {
  const templates: string[] = ecosystemDetail(locale).titleTemplates;
  return firstFit(templates.map(template => template.replace('{name}', project.name)), ...SEO_LIMITS.title);
}

/** The project's own summary, extended with authored sentences until it reaches
 * the window. This is the same fitter the metadata policy applies to every
 * page, handed project-specific additions, so the policy's own generic filler
 * is never reached and what is returned here is exactly what ships: a summary
 * already longer than the window comes back as a word-boundary excerpt rather
 * than as copy the policy would silently cut later.
 *
 * The suffixes are sorted by length here rather than relied on in authored
 * order, because this fitter prefers the first sentence that lands inside the
 * window and, when a summary is too short for any single one, extends with the
 * last entry. Sorting keeps the shortest sufficient sentence the preferred one
 * and the longest the chain head, whatever order seven translated files
 * happen to be in.
 *
 * Every sentence states only what each of these records always carries: a
 * status with a note explaining it, at least two cited sources, the date the
 * record was last verified, a linked source repository, and its place in this
 * directory. None of them may claim people, a license, a language or a
 * release, because the fitter picks on length alone and most records hold none
 * of those: 3 of 41 projects still credit nobody, five have no license and 17
 * have no published release.
 */
export function projectDescription(project: EcosystemProject, locale = 'en'): string {
  const suffixes = [...ecosystemDetail(locale).descriptionSuffixes]
    .sort((left, right) => graphemes(left) - graphemes(right));
  const [min, max] = SEO_LIMITS.description;
  // A summary already over the upper bound needs no addition, only a cut, and
  // `fitText` cuts it with a fixed-window scan that can split a long token. Cut
  // it here instead; everything else still goes through the shared fitter.
  const summary = normalize(project.summary);
  if (graphemes(summary) > max) return wordBoundaryExcerpt(summary, min, max);
  return fitText(project.summary, min, max, suffixes, ' ');
}

export function projectJsonLd({ project, snapshot, url, locale }: {
  project: EcosystemProject;
  snapshot: ProjectSnapshot | undefined;
  url: string;
  locale: string;
}) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostrwot.com';
  const t = ecosystemDetail(locale);
  // A prerelease is not the current version of anything.
  const stable = snapshot?.releases.find(release => !release.prerelease);

  const application: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    // Its own node, so the page that describes it and the software itself are
    // two things a consumer can tell apart and join.
    '@id': `${url}#software`,
    name: project.name,
    description: project.summary,
    ...(schemaApplicationCategory(project.category) ? { applicationCategory: schemaApplicationCategory(project.category) } : {}),
    // The directory's own category, which is the more precise statement and is
    // the same string whatever locale asked for the page.
    applicationSubCategory: project.category,
    mainEntityOfPage: { '@id': url },
    ...(isSafeExternalUrl(project.website) ? { url: project.website } : {}),
    ...(isSafeExternalUrl(project.repository) ? { codeRepository: project.repository } : {}),
    ...(snapshot?.license ? { license: `https://spdx.org/licenses/${snapshot.license}.html` } : {}),
    ...(snapshot?.language ? { programmingLanguage: snapshot.language } : {}),
    // The date the thing was published, which is what the story records from
    // the launch announcement. The repository's creation date stands in only
    // when no launch date was found: a repo exists before its first release,
    // and for four projects it is all there is. Month and year precision are
    // both valid ISO 8601, so a partial launch date is emitted as it stands
    // rather than padded to a day no source gives.
    ...(project.story?.launched ? { datePublished: project.story.launched }
      : snapshot?.createdAt ? { datePublished: snapshot.createdAt } : {}),
    ...(snapshot?.pushedAt ? { dateModified: snapshot.pushedAt } : {}),
    ...(stable ? { softwareVersion: stable.tag } : {}),
    ...(snapshot?.topics.length ? { keywords: snapshot.topics.join(', ') } : {}),
  };

  const citations = project.sources.filter(source => isSafeExternalUrl(source.url));
  if (citations.length) {
    application.citation = citations.map(source => ({
      '@type': 'CreativeWork', name: source.label, url: source.url,
    }));
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    // Built from the same list the page renders, so the two cannot drift.
    itemListElement: projectCrumbs(project, locale).map((crumb, index) => ({
      '@type': 'ListItem', position: index + 1, name: crumb.name, item: `${base}${crumb.path}`,
    })),
  };

  // `inLanguage` belongs to the page, not to the software: this directory's
  // pages are published in seven languages and the software is not. It used to
  // sit on the SoftwareApplication, which claimed the program itself was in
  // Russian when the Russian page was served.
  const page = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    inLanguage: locale,
    name: projectTitle(project, locale),
    description: projectDescription(project, locale),
    isPartOf: { '@type': 'CollectionPage', '@id': `${base}${localePrefix(locale)}/projects` },
    about: { '@id': `${url}#software` },
    ...(project.lastVerified ? { dateModified: project.lastVerified } : {}),
  };

  return [application, breadcrumbs, page];
}
