#!/usr/bin/env node
/**
 * npm run social:channels
 *
 * Asks the board what DLSOCIAL_NOSTRWOT_KEY can actually reach, rather than
 * assuming. Run this once before arming anything, and again any time a channel
 * id in entries.mjs's CHANNEL_CONFIG is suspected wrong: the ids there
 * (nostr-wot-li, nostr-wot-nostr, nostr-wot-x) are named by convention and
 * have not been confirmed against the live API.
 *
 * A wrong id on an `optional` channel fails silently, which is exactly the
 * failure this command exists to prevent: the post is skipped, the request
 * still returns 200, and nothing anywhere says the channel never went out.
 *
 * Adapted from quantakrypto/website `scripts/social/list-channels.mjs`.
 */
import { fetchRetry } from "../fetch-retry.mjs";

const API_BASE = process.env.DLSOCIAL_API_BASE || "https://socials.dandelionlabs.io";

const apiKey = process.env.DLSOCIAL_NOSTRWOT_KEY;
if (!apiKey) {
  console.error("error DLSOCIAL_NOSTRWOT_KEY is not set. Export it for this command only, do not hardcode it.");
  process.exit(1);
}

const res = await fetchRetry(`${API_BASE}/api/ext/channels`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});

const body = await res.text();
if (!res.ok) {
  console.error(`error HTTP ${res.status} ${body}`);
  process.exit(1);
}

try {
  console.log(JSON.stringify(JSON.parse(body), null, 2));
} catch {
  console.log(body);
}
