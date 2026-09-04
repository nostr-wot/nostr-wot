/**
 * `fetch()` with retry and backoff on transient failures: network errors and
 * 5xx/429 responses.
 *
 * The social poster checks that an article is actually live before sharing it,
 * and it runs on a schedule that can coincide with a deploy. A check that fires
 * during that window can hit a one-off `fetch failed` or a 502/503 that clears
 * within a second or two. That is not a reason to skip a post for eight hours,
 * but it is also not a reason to retry forever, so a couple of backed-off
 * attempts smooth it over while a genuine outage still comes back as not live.
 *
 * Returns the final Response (including a 4xx, or a still-5xx after the last
 * attempt, so the caller reports it normally). Throws only if every attempt
 * failed at the network level.
 *
 * Adapted from quantakrypto/website `scripts/fetch-retry.mjs`.
 */

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchRetry(url, opts = {}, { retries = 4, baseDelay = 700 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, opts);
      // Retry the transient server states a restart produces; return everything else.
      if ((res.status >= 500 || res.status === 429) && attempt < retries) {
        await sleep(baseDelay * (attempt + 1));
        continue;
      }
      return res;
    } catch (e) {
      if (attempt >= retries) throw e;
      await sleep(baseDelay * (attempt + 1));
    }
  }
}
