/**
 * The house rules for social copy, as a function.
 *
 * This exists so that `npm run social:lint` and `post-social.mjs` enforce the
 * SAME rules rather than two copies that drift. It used to live inside
 * lint-social.mjs, which meant the CLI checked the copy and the thing that
 * actually posts did not.
 *
 * Why that mattered: the newsroom agent commits an article and its copy file
 * straight to `main`, with no pull request and no reviewer
 * (docs/newsroom/playbook.md). CI runs on push, so a bad copy file turns `main`
 * red, but nothing stopped the scheduled poster from sending it hours later
 * anyway. A red build that still ships is not a gate. Now the poster refuses.
 *
 * `collectErrors()` returns { entries, errors } and prints nothing, so callers
 * decide how to report.
 */
import { readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import {
  ROOT,
  KNOWN_CHANNELS,
  CHANNEL_CONFIG,
  LINKABLE_COLLECTIONS,
  SITE_LINK,
  withUrl,
  buildEntries,
  loadNewsIndex,
} from "./entries.mjs";

// Deliberately narrow: bans the specific tics this project (and its sibling
// properties) have actually shipped, not a generic profanity list. Extend it
// the day a new one slips through, per docs/social-posting.md section 6.
export const HYPE_WORDS =
  /\b(revolutionary|game[- ]changing|unprecedented|massive|huge|groundbreaking|cutting[- ]edge|to the moon|moonshot|disrupt(?:ive|ion)?|paradigm shift|world[- ]class|best[- ]in[- ]class)\b/i;
export const EM_EN_DASH = /[—–]/;
// Rough but sufficient: covers the emoji blocks a copy-paste from a draft
// tends to carry (pictographs, symbols, dingbats, transport, flags, misc
// technical arrows and shapes used as decoration).
export const EMOJI =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}]/u;
export const HARD_LINK = /https?:\/\//i;
// docs/social-voice.md section 5: dead calls to action. Narrow on purpose,
// these are the ones that have actually shipped.
export const DEAD_CTA =
  /\b(we wrote up|read more|learn more|check it out|find out more|click here|in this article)\b/i;
// section 4: 2-5 CamelCase hashtags on the last non-empty line.
export const HASHTAG = /^#[A-Za-z][A-Za-z0-9]*$/;

/**
 * Every `/news/`, `/blog/` and `/guides/` path that exists, for the
 * `{url:/path}` existence check. English only, because the copy is English
 * only.
 */
function buildKnownPaths(newsIndex) {
  const known = new Set([...newsIndex.values()].map((p) => new URL(p.url).pathname));
  for (const collection of LINKABLE_COLLECTIONS) {
    if (collection === "news") continue; // already indexed above
    const dir = join(ROOT, "content", collection, "en");
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".mdx") && !name.endsWith(".md")) continue;
      known.add(`/${collection}/${name.replace(/\.mdx?$/, "")}`);
    }
  }
  return known;
}

/**
 * Runs every check over every social/<slug>.json on disk.
 *
 * @returns {{entries: Array, errors: string[]}}
 */
export function collectErrors() {
  const errors = [];
  const newsIndex = loadNewsIndex();
  const knownPaths = buildKnownPaths(newsIndex);
  const LINKABLE_RE = new RegExp(`^/(${LINKABLE_COLLECTIONS.join("|")})/`);

  function checkText(rel, key, text) {
    if (typeof text !== "string" || !text.trim()) {
      errors.push(`${rel}: "${key}" must be a non-empty string`);
      return;
    }
    if (HARD_LINK.test(text)) {
      errors.push(
        `${rel}: "${key}" contains a hard-coded link. Remove it; the poster derives and appends the canonical URL. Use {url} only to place it somewhere other than the end.`,
      );
    }
    if (EM_EN_DASH.test(text)) {
      errors.push(`${rel}: "${key}" contains an em or en dash. Rephrase; do not substitute a hyphen.`);
    }
    if (EMOJI.test(text)) {
      errors.push(`${rel}: "${key}" contains an emoji. This house style carries none.`);
    }
    const hype = text.match(HYPE_WORDS);
    if (hype) {
      errors.push(`${rel}: "${key}" uses hype vocabulary ("${hype[0]}"). Evidence over adjectives.`);
    }
  }

  /**
   * The LinkedIn shape from docs/social-voice.md, only the parts a machine can
   * judge: a standalone opening claim, and a hashtag block. Everything else in
   * that document (the turn, the honesty note, numbers in the second block) is
   * a human call and deliberately not linted.
   */
  function checkLinkedInShape(rel, text) {
    const lines = text.split("\n");

    // Structure only. There is deliberately NO character cap on the opening
    // line or on any other line: the only length limits here are the
    // platform's own (checkLength, from CHANNEL_CONFIG). An invented per-line
    // cap would reject copy that reads fine and is not a rule anyone agreed to.
    const first = lines[0]?.trim() ?? "";
    if (!first) {
      errors.push(`${rel}: "linkedin" must open with the claim, not a blank line.`);
    } else if ((lines[1] ?? "").trim() !== "") {
      errors.push(`${rel}: "linkedin" opening claim must be followed by a blank line.`);
    }

    const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);
    const tags = (nonEmpty[nonEmpty.length - 1] ?? "").split(/\s+/).filter(Boolean);
    const allTags = tags.length > 0 && tags.every((t) => HASHTAG.test(t));
    if (!allTags) {
      errors.push(
        `${rel}: "linkedin" must end on a line of 2-5 CamelCase hashtags. ` +
          `See docs/social-voice.md section 4.`,
      );
    } else if (tags.length < 2 || tags.length > 5) {
      errors.push(`${rel}: "linkedin" has ${tags.length} hashtags (want 2-5).`);
    }

    // The poster appends the canonical URL at the very end when no {url} is
    // present, which would land it after the hashtags. Every post ends on
    // hashtags, so a hashtag block requires an explicit {url} placement.
    if (allTags && !text.includes("{url}")) {
      errors.push(
        `${rel}: "linkedin" ends on hashtags but has no {url} placeholder, so the ` +
          `article link would be appended after them. Put {url} on its own line above.`,
      );
    }

    const cta = text.match(DEAD_CTA);
    if (cta) {
      errors.push(
        `${rel}: "linkedin" uses a dead call to action ("${cta[0]}"). ` +
          `Say what the thing is: "Full breakdown here:", "How it works:", "Try it:".`,
      );
    }
  }

  function checkLength(rel, key, text, url, limit) {
    if (limit == null) return;
    const withLink = withUrl(text, url);
    if (withLink.length > limit) {
      errors.push(
        `${rel}: "${key}" is ${withLink.length} chars with the URL appended (max ${limit}). ` +
          `A required entry over the limit fails the whole request, on every channel.`,
      );
    }
  }

  /**
   * `{url:/news/x}` and the blog/guides equivalents must name something that
   * exists. This is the staleness guard the bare-link ban was protecting: a
   * path is only safe to write by hand if something checks it.
   */
  function checkSiteLinks(rel, key, text) {
    for (const [, path] of text.matchAll(SITE_LINK)) {
      if (!LINKABLE_RE.test(path)) continue; // other routes are not enumerable here
      if (!knownPaths.has(path.replace(/\/$/, ""))) {
        errors.push(`${rel}: "${key}" links {url:${path}}, which matches no article on disk.`);
      }
    }
  }

  const { entries, errors: joinErrors } = buildEntries();
  errors.push(...joinErrors);

  for (const { path, data, url } of entries) {
    const rel = relative(ROOT, path);

    const unknown = Object.keys(data).filter((k) => !KNOWN_CHANNELS.includes(k));
    if (unknown.length) {
      errors.push(
        `${rel}: unknown field(s) ${unknown.join(", ")}. Known fields: ${KNOWN_CHANNELS.join(", ")}.`,
      );
    }

    if (!("linkedin" in data)) {
      errors.push(`${rel}: missing required "linkedin" field.`);
    }

    for (const key of ["linkedin", "x", "nostr"]) {
      if (!(key in data)) continue;
      checkText(rel, key, data[key]);
      if (typeof data[key] === "string") {
        checkSiteLinks(rel, key, data[key]);
        checkLength(rel, key, data[key], url, CHANNEL_CONFIG[key]?.limit);
        if (key === "linkedin") checkLinkedInShape(rel, data[key]);
      }
    }

    if ("xThread" in data) {
      if (!Array.isArray(data.xThread) || !data.xThread.length) {
        errors.push(`${rel}: "xThread" must be a non-empty array of strings.`);
      } else {
        data.xThread.forEach((entry, i) => {
          checkText(rel, `xThread[${i}]`, entry);
          if (typeof entry !== "string") return;
          checkSiteLinks(rel, `xThread[${i}]`, entry);
          // Only the first entry of a thread carries the article link by
          // convention; later entries are still checked against the same cap
          // with no URL appended, since that is what the API actually sends.
          if (i > 0 && entry.length > (CHANNEL_CONFIG.x?.limit ?? Infinity)) {
            errors.push(
              `${rel}: "xThread[${i}]" is ${entry.length} chars (max ${CHANNEL_CONFIG.x.limit}).`,
            );
          } else if (i === 0) {
            checkLength(rel, `xThread[0]`, entry, url, CHANNEL_CONFIG.x?.limit);
          }
        });
      }
    }
  }

  return { entries, errors };
}
