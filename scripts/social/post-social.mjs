#!/usr/bin/env node
/**
 * npm run social:post [-- --dry-run]
 *
 * Reads social/<slug>.json entries not yet in the ledger (data/social-posted.json),
 * confirms each one is actually live (fetch the derived URL, require 200: "the
 * commit landed" and "the site is serving the page" are different claims), and
 * shares at most SOCIAL_MAX_PER_RUN (default 1) of them, oldest first, through
 * the dandelionlabs socials API.
 *
 * This script is the ONLY thing that holds DLSOCIAL_NOSTRWOT_KEY. It is invoked
 * by .github/workflows/social.yml, never by the newsroom routine: an agent that
 * spends its day reading arbitrary API responses and writing to `main` without
 * a review gate must never carry a posting credential. See
 * docs/social-posting.md section 1.
 *
 * The secret is only required once something is actually due, so an idle run
 * with nothing to post never fails for a missing key.
 *
 * Adapted from quantakrypto/website `scripts/social/post-social.mjs`.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fetchRetry } from "../fetch-retry.mjs";
import { ROOT, CHANNEL_CONFIG, SUPPORTED_CHANNELS, withUrl } from "./entries.mjs";
import { collectErrors } from "./checks.mjs";

const LEDGER_FILE = join(ROOT, "data/social-posted.json");
const API_BASE = process.env.DLSOCIAL_API_BASE || "https://socials.dandelionlabs.io";
const DRY_RUN = process.argv.includes("--dry-run");
const MAX_PER_RUN = Number(process.env.SOCIAL_MAX_PER_RUN ?? 1);

function loadLedger() {
  if (!existsSync(LEDGER_FILE)) return {};
  return JSON.parse(readFileSync(LEDGER_FILE, "utf8"));
}

function saveLedger(ledger) {
  mkdirSync(dirname(LEDGER_FILE), { recursive: true });
  writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2) + "\n");
}

/**
 * Parse a JSON response without throwing on an empty or non-JSON body: the
 * caller decides what to do with null, and a surprising body must never turn
 * a successful post into a crash after the post already went out.
 */
async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function isLive(url) {
  try {
    const res = await fetchRetry(url, { method: "GET" });
    return res.status === 200;
  } catch {
    return false;
  }
}

function buildRequestPosts(entry) {
  const posts = [];
  for (const key of SUPPORTED_CHANNELS) {
    const text = key === "x" ? undefined : entry.data[key]; // x deferred, see entries.mjs
    if (!text) continue;
    const config = CHANNEL_CONFIG[key];
    const body = { channel: config.channel, text: withUrl(text, entry.url) };
    if (!config.primary) body.optional = true;
    posts.push(body);
  }
  return posts;
}

async function main() {
  // The same checks `npm run social:lint` runs, re-run here on purpose.
  //
  // CI already lints on push to `main`, but a red build does not stop a
  // scheduled workflow: the newsroom commits copy without a pull request, and
  // this job would happily send it hours later. Enforcing the rules at the
  // point of sending is what makes them a gate rather than a report.
  //
  // This covers every file, not just the ones due, so a broken copy file stops
  // the run instead of quietly posting the entries either side of it.
  const { entries, errors } = collectErrors();
  if (errors.length) {
    for (const e of errors) console.error(`error ${e}`);
    console.error(
      `\nRefusing to post: ${errors.length} lint error(s). ` +
        `Nothing was sent and nothing was recorded. Fix the copy and re-run.`,
    );
    process.exit(1);
  }

  const ledger = loadLedger();
  const pending = entries.filter((e) => !ledger[e.slug]);

  if (!pending.length) {
    console.log("Nothing due. No entries pending, no secret required.");
    return;
  }

  console.log(`${pending.length} entrie(s) pending: ${pending.map((e) => e.slug).join(", ")}`);

  const live = [];
  for (const entry of pending) {
    if (await isLive(entry.url)) {
      live.push(entry);
    } else {
      console.log(`skip  ${entry.slug}: ${entry.url} does not return 200 yet (not live)`);
    }
    if (live.length >= MAX_PER_RUN) break;
  }

  if (!live.length) {
    console.log("Nothing live yet. Nothing posted, no secret required.");
    return;
  }

  const batch = live.slice(0, MAX_PER_RUN);

  if (DRY_RUN) {
    console.log(`--dry-run: would post ${batch.length} entrie(s), nothing sent, nothing recorded.`);
    for (const entry of batch) {
      const posts = buildRequestPosts(entry);
      console.log(`\n${entry.slug} (${entry.url})`);
      console.log(JSON.stringify({ posts }, null, 2));
    }
    return;
  }

  const apiKey = process.env.DLSOCIAL_NOSTRWOT_KEY;
  if (!apiKey) {
    console.error(
      "error DLSOCIAL_NOSTRWOT_KEY is not set, and a post is due. Set it as a repository secret: " +
        "gh secret set DLSOCIAL_NOSTRWOT_KEY --repo nostr-wot/nostr-wot",
    );
    process.exit(1);
  }

  let failed = false;
  for (const entry of batch) {
    const posts = buildRequestPosts(entry);
    const res = await fetchRetry(`${API_BASE}/api/ext/post`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ posts }),
    });
    if (res.ok) {
      // Record what the API says it PUBLISHED, never what we asked it to.
      // An `optional: true` entry that the board could not deliver (channel
      // not configured yet, copy rejected) comes back under `skipped` while
      // the request still returns 200, so echoing the request would file an
      // unpublished channel as published and no later run would retry it.
      // Fall back to the requested channels only when the body carries no
      // results at all, and say so, rather than silently guessing.
      const body = await readJson(res);
      const results = Array.isArray(body?.results) ? body.results : null;
      const skipped = Array.isArray(body?.skipped) ? body.skipped : [];
      const channels = results
        ? results.map((r) => r.channel).filter(Boolean)
        : posts.map((p) => p.channel);

      const record = {
        postedAt: new Date().toISOString(),
        url: entry.url,
        channels,
      };
      // The permalink the platform assigned, per channel. Worth keeping: it
      // is the only handle on the published post, and it is not derivable.
      const urls = Object.fromEntries(
        (results ?? []).filter((r) => r.channel && r.url).map((r) => [r.channel, r.url]),
      );
      if (Object.keys(urls).length) record.urls = urls;
      if (skipped.length) record.skipped = skipped.map((s) => s.channel ?? s).filter(Boolean);
      if (!results) record.channelsUnverified = true;

      ledger[entry.slug] = record;
      console.log(`posted ${entry.slug} -> ${channels.join(", ") || "(none reported)"}`);
      if (record.skipped?.length) console.log(`  skipped: ${record.skipped.join(", ")}`);
      for (const [ch, u] of Object.entries(urls)) console.log(`  ${ch}: ${u}`);
      if (!results) {
        console.log(`  note: response carried no results[], recorded the requested channels unverified.`);
        console.log(`  raw response: ${JSON.stringify(body).slice(0, 500)}`);
      }
    } else {
      let detail = "";
      try {
        detail = await res.text();
      } catch {
        // ignore, report the status alone below
      }
      console.error(`error ${entry.slug}: HTTP ${res.status} ${detail}`.trim());
      failed = true;
      // A 400 posts nothing on ANY channel, so nothing is recorded and this
      // slug is retried in full next run. Do not attempt the rest of the
      // batch on the same failure; a required field over the limit on one
      // post is not a signal the next one is also bad, but surfacing one
      // clear failure per run beats guessing.
      break;
    }
  }

  saveLedger(ledger);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(`error ${e.stack || e}`);
  process.exit(1);
});
