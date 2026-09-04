/**
 * Shared logic for the social-posting scripts: read `social/<slug>.json` copy
 * files, join each one to the news article it names, and derive the canonical
 * URL from the SAME routing rule the site uses.
 *
 * Adapted from quantakrypto/website `scripts/social/entries.mjs`. Two things
 * differ, both on purpose:
 *
 * 1. **The source of truth is the article file, not a posts.ts index.** This
 *    repository keeps news as MDX under `content/news/<locale>/<slug>.mdx`, so
 *    a slug is a filename and the frontmatter is read directly with
 *    `gray-matter`, exactly as `scripts/generate-content-cache.mjs` already
 *    does. There is no module to import and no server-only boundary to worry
 *    about.
 *
 * 2. **The URL carries no date.** quantakrypto routes news at
 *    `/news/<date>/<slug>`; this site routes it at `/news/<slug>` for the
 *    default locale, per `getFullUrl()` in `lib/metadata.ts` and the news
 *    sitemap in `app/news-sitemap.xml/route.ts`. The newsroom playbook makes
 *    the same point from the other side: slugs carry no date prefix. If that
 *    routing rule ever changes, update it here too.
 *
 * Copy is **English only**, even though every article ships in seven locales.
 * The social accounts post in one language, so the derived URL is the English
 * one, which for the default locale has no locale prefix.
 *
 * Never write the URL by hand in a copy file: the linter (lint-social.mjs)
 * rejects any hard-coded http(s) link in the text fields for exactly this
 * reason. `{url}` in the text places the derived link somewhere other than the
 * end; otherwise it is appended on its own line.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

export const ROOT = new URL("../..", import.meta.url).pathname;
export const SOCIAL_DIR = join(ROOT, "social");
/** Copy is English only, so only the `en` articles are ever joined against. */
export const NEWS_DIR = join(ROOT, "content/news/en");
export const BASE_URL = (process.env.SITE_BASE_URL || "https://nostr-wot.com").replace(/\/$/, "");

/** Only these keys are recognised in a social/<slug>.json file. */
export const KNOWN_CHANNELS = ["linkedin", "x", "xThread", "nostr"];

/**
 * The channels this repository's key is bound to, per channel key above.
 * `primary` entries fail the whole request on a validation error; everything
 * else is sent with `optional: true` so a channel that is not wired up yet (or
 * is temporarily down) can never block the ones that are.
 *
 * Confirm these ids with `npm run social:channels` before the first real
 * (non-dry-run) post: they are named by convention, not fetched from the API.
 */
export const CHANNEL_CONFIG = {
  linkedin: { channel: "nostr-wot-li", primary: true, limit: 3000 },
  nostr: { channel: "nostr-wot-nostr", primary: false, limit: null },
  // X is not enabled yet (see docs/social-posting.md). The mapping is defined
  // so entries.mjs / lint-social.mjs already validate an `x` or `xThread`
  // field correctly the day it is turned on; post-social.mjs skips it until
  // then (see SUPPORTED_CHANNELS below).
  x: { channel: "nostr-wot-x", primary: false, limit: 280 },
};

/** Channels post-social.mjs will actually send. Add "x" here once confirmed. */
export const SUPPORTED_CHANNELS = ["linkedin", "nostr"];

/** Site routes a copy file may link to with `{url:/path}`, for the existence check. */
export const LINKABLE_COLLECTIONS = ["news", "blog", "guides"];

/**
 * YAML dates come back as a string when quoted (which the playbook's
 * frontmatter template requires) and as a Date when not. Normalise to
 * `YYYY-MM-DD` either way rather than trusting the file to be well-formed.
 */
function toDateString(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

/**
 * slug -> { date, type, url }, built by reading the frontmatter of every
 * English news article. `date` is used only to order a batch, and `type`
 * (`story` or `digest`) is carried for reporting; the URL depends on neither,
 * because news does not live under a dated path here.
 */
export function loadNewsIndex() {
  const index = new Map();
  if (!existsSync(NEWS_DIR)) return index;
  for (const name of readdirSync(NEWS_DIR).sort()) {
    if (!name.endsWith(".mdx") && !name.endsWith(".md")) continue;
    const slug = name.replace(/\.mdx?$/, "");
    const raw = readFileSync(join(NEWS_DIR, name), "utf8");
    let data;
    try {
      ({ data } = matter(raw));
    } catch (e) {
      throw new Error(`content/news/en/${name}: invalid frontmatter (${e.message})`);
    }
    index.set(slug, {
      date: toDateString(data.date),
      type: typeof data.type === "string" ? data.type : "",
      url: `${BASE_URL}/news/${slug}`,
    });
  }
  return index;
}

/** Every social/<slug>.json on disk, parsed. Throws with the filename on bad JSON. */
export function listSocialFiles() {
  if (!existsSync(SOCIAL_DIR)) return [];
  const out = [];
  for (const name of readdirSync(SOCIAL_DIR).sort()) {
    if (!name.endsWith(".json")) continue;
    const slug = name.slice(0, -".json".length);
    const path = join(SOCIAL_DIR, name);
    let data;
    try {
      data = JSON.parse(readFileSync(path, "utf8"));
    } catch (e) {
      throw new Error(`social/${name}: invalid JSON (${e.message})`);
    }
    out.push({ slug, path, data });
  }
  return out;
}

/** `{url:/some/path}` -> the absolute site URL. */
export const SITE_LINK = /\{url:(\/[A-Za-z0-9\-._~/]*)\}/g;

/**
 * Expands `{url:/path}` placeholders to absolute links.
 *
 * A second link in a post is a normal format (see docs/social-voice.md), but a
 * hand-typed absolute link goes stale the moment a slug changes, which is why
 * bare http(s) stays a lint error. This keeps the link derived: the copy names
 * a path, the poster resolves it, and lint-social.mjs checks that a /news/,
 * /blog/ or /guides/ path actually matches an article on disk.
 */
export function expandLinks(text) {
  return text.replace(SITE_LINK, (_m, path) => `${BASE_URL}${path}`);
}

/**
 * Places `url` in `text`: at the `{url}` placeholder if present, otherwise
 * appended on its own blank line at the end. Length checks and the request
 * body must both go through this so what gets measured is what gets sent.
 */
export function withUrl(text, url) {
  const t = expandLinks(text);
  if (t.includes("{url}")) return t.split("{url}").join(url);
  return `${t.trim()}\n\n${url}`;
}

/**
 * Joins every social/<slug>.json to its article. Returns { entries, errors }:
 * entries that resolved cleanly, and human-readable errors for ones that did
 * not (missing article, e.g.) so callers can report rather than throw.
 */
export function buildEntries() {
  const newsIndex = loadNewsIndex();
  const errors = [];
  const entries = [];
  for (const { slug, path, data } of listSocialFiles()) {
    const article = newsIndex.get(slug);
    if (!article) {
      errors.push(
        `social/${slug}.json: no article at content/news/en/${slug}.mdx. ` +
          `The copy file must be named after the English slug.`,
      );
      continue;
    }
    entries.push({ slug, path, data, ...article });
  }
  // Oldest article first, so a batch shares in the order it was published.
  entries.sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug));
  return { entries, errors };
}
