import { isSafeExternalUrl, splitLabelNote } from '@/lib/ecosystem-projects';
import { parsePublicPubkey } from '@/lib/graph/parsePubkey';
import manifest from '@/data/people-profiles.json';

export type SourcedLink = { label: string; url: string; sourceUrl?: string };

export type PersonProfile = {
  name: string;
  avatar?: { file: string; width: number; height: number; bytes: number; sourceUrl: string };
  /** Present only for the people whose own profiles publish one. */
  npub?: string;
  selfDescription?: { text: string; sourceUrl: string };
  alsoBuilt?: { name: string; url: string; relationship: string; sourceUrl: string }[];
  links?: SourcedLink[];
  talks?: { title: string; url: string; publisher?: string; date?: string }[];
};

const people = manifest.people as unknown as Record<string, PersonProfile>;

/**
 * Keyed by the name the dataset uses. The record carries no slug of its own:
 * `personSlug` in lib/people.ts is the single owner of that derivation, and
 * storing a second copy here drifted once already on names with diacritics.
 */
const byName = new Map(Object.values(people).map(person => [person.name, person]));

export function getPersonProfile(name: string): PersonProfile | undefined {
  return byName.get(name);
}

/**
 * A profile link's label.
 *
 * The dataset's own profile labels are translated per locale, so those are used
 * as they stand. The researched profile records are locale invariant and
 * carried English labels like "Personal site / blog", which rendered
 * untranslated on every non-English page, so those are labelled from the URL
 * instead: a well known host by its proper name, anything else by its host.
 *
 * The host, rather than the locale's generic word for a website, because a
 * person with both a personal site and a dev blog got two icons both labelled
 * "Website", which is ambiguous to anyone reading the page with a screen
 * reader. A host name is a proper noun, so it needs no translation and it is
 * never a duplicate.
 *
 * Lives here rather than in a component because the card, the person's own page
 * and the index all label the same links, and the three drifting apart would
 * show one link under three names.
 */
export function profileLinkLabel(link: MergedLink, websiteLabel: string): string {
  const fromDataset = splitLabelNote(link.label).text;
  if (link.translatedLabel) return fromDataset;
  try {
    const host = new URL(link.url).host.replace(/^www\./, '');
    if (/(^|\.)github\.com$/i.test(host)) return 'GitHub';
    if (/(^|\.)(x|twitter)\.com$/i.test(host)) return 'X';
    if (/(^|\.)njump\.me$/i.test(host)) return 'Nostr';
    return host;
  } catch {
    // Unreachable for a link that passed `isSafeExternalUrl`, which parses the
    // URL to check its scheme. Kept so this never returns an unparsed URL.
    return websiteLabel;
  }
}

/**
 * What a profile link identifies, for the purpose of asking whether two links
 * are the same profile.
 *
 * For a Nostr profile viewer URL this is the pubkey behind the pointer, so the
 * same person cited as an `npub`, as an `nprofile` and as a `nostr:`-prefixed
 * `nprofile` collapses to one entry rather than rendering three identical
 * "Nostr" icons. For anything else it is the URL itself: two different pages on
 * one host are two links.
 */
export function profileIdentity(url: string): string {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)njump\.me$/i.test(parsed.host.replace(/^www\./, ''))) return url;
    const pointer = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
    const pubkey = parsePublicPubkey(pointer);
    return pubkey ? `nostr-pubkey:${pubkey}` : url;
  } catch {
    return url;
  }
}

/** A merged link, carrying whether its label came from the translated dataset
 * or from a locale-invariant researched record. `profileLinkLabel` needs to
 * know: one is already in the reader's language and the other never is. */
export type MergedLink = SourcedLink & { translatedLabel: boolean };

/**
 * The dataset's cited profiles and the researched profile links, merged on URL
 * with the dataset first, so one link is never shown twice under two labels.
 * Unsafe URLs are dropped rather than rendered as text.
 *
 * `translated` comes from the per-locale dataset; `researched` comes from the
 * committed profile records, which carry one English label for all locales.
 */
export function mergeProfileLinks(
  translated: SourcedLink[] | SourcedLink[][] | undefined,
  researched: SourcedLink[] | undefined,
): MergedLink[] {
  const seen = new Set<string>();
  const merged: MergedLink[] = [];
  const groups: [SourcedLink[], boolean][] = [
    ...(Array.isArray(translated?.[0]) ? translated as SourcedLink[][] : [(translated ?? []) as SourcedLink[]])
      .map(group => [group, true] as [SourcedLink[], boolean]),
    [researched ?? [], false],
  ];
  for (const [group, translatedLabel] of groups) {
    for (const link of group) {
      // Keyed by what the link identifies, not by its spelling, so one Nostr
      // profile cited in three encodings is one entry.
      const identity = profileIdentity(link.url);
      if (!isSafeExternalUrl(link.url) || seen.has(identity)) continue;
      seen.add(identity);
      merged.push({ ...link, translatedLabel });
    }
  }
  return merged;
}
