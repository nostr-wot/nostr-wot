# Sharing Nostr WoT news on LinkedIn (and Nostr)

How automated social posting works in this repository. Adapted from
`quantakrypto/website` (`scripts/social/` and `.github/workflows/social.yml`),
which this mirrors closely on purpose: same API, same split of responsibility,
same failure modes to guard against. Section 4 is where the two diverge.

## 1. The rule that shapes everything else: the agent never holds the key

The newsroom routine writes the copy. **A workflow posts it.** The agent that
drafts articles must never be given the API key, and must never be told to
call the posting endpoint itself.

This is not ceremony, and it matters more here than in the repository this is
adapted from. The newsroom agent commits articles **straight to `main` with no
pull request and no reviewer** (`docs/newsroom/playbook.md`). If a posting
credential were in that agent's context, there would be no diff anyone could
reject between a bad input and a published post under the project's name.

So the split, as implemented:

- **The newsroom routine** writes `social/<slug>.json` in the same commit as
  the article it publishes. Text only.
- **`.github/workflows/social.yml`** holds `DLSOCIAL_NOSTRWOT_KEY` as a
  repository secret and does the posting, on its own schedule, independent of
  when the article lands.

Everything below exists to make that split safe and observable.

## 2. The API

```
POST https://socials.dandelionlabs.io/api/ext/post
Authorization: Bearer <DLSOCIAL_NOSTRWOT_KEY>
Content-Type: application/json

{"posts": [{"channel": "nostr-wot-li", "text": "..."}]}
```

The key is bound server-side to this project's channels and can reach nothing
else. Discover what it actually covers rather than assuming:

```
GET https://socials.dandelionlabs.io/api/ext/channels
```

`npm run social:channels` wraps this (needs `DLSOCIAL_NOSTRWOT_KEY` in the
environment).

Three properties of the API the implementation has to respect:

- **LinkedIn caps commentary at 3,000 characters.** X, once enabled, caps at
  280 per post.
- **A required entry that fails validation returns `400` and nothing is
  posted, on any channel.** One over-long draft kills the whole request.
- **`optional: true` entries are skipped rather than failing.** Every channel
  except the primary one (LinkedIn) is sent `optional: true`, so a channel
  that is not configured yet, or is briefly unavailable, can never block the
  ones that are. See `CHANNEL_CONFIG` in `scripts/social/entries.mjs`.

The bare `{"text": "..."}` convenience form is never used. It works only while
a key has exactly one channel and breaks silently the day a second one is
added.

## 3. The pieces

| Path | Job |
|---|---|
| `social/<slug>.json` | The copy: `{"linkedin": "...", "x": "...", "xThread": [...], "nostr": "..."}`. Only `linkedin` is required. |
| `scripts/social/entries.mjs` | Reads entries, joins them to the article they name, derives URLs, builds request bodies. Shared by the scripts below. |
| `scripts/social/checks.mjs` | The house rules, as `collectErrors()`. Used by the linter **and** by the poster, so the two cannot drift. |
| `scripts/social/lint-social.mjs` | `npm run social:lint`, a CLI over `checks.mjs`. Wired into `.github/workflows/ci.yml` on pull requests and pushes to `main`. |
| `scripts/social/post-social.mjs` | `npm run social:post`, with `--dry-run`. Run by `.github/workflows/social.yml`. |
| `scripts/social/list-channels.mjs` | `npm run social:channels`. Worth running any time a channel id is suspected wrong. |
| `scripts/fetch-retry.mjs` | `fetch()` with backoff, so a deploy window does not read as "not live". |
| `data/social-posted.json` | Ledger of what has been shared, committed back by the workflow. |

## 4. The URL is never written by hand, and it carries no date

The copy file carries text and no link. `entries.mjs` derives the canonical URL
by reading the frontmatter of `content/news/en/<slug>.mdx` with `gray-matter`,
exactly as `scripts/generate-content-cache.mjs` already does.

**This is the main departure from quantakrypto's implementation.** Two
differences, both structural:

1. **The source of truth is the article file, not a `posts.ts` index.** News
   here is MDX on disk, one file per locale, so a slug is a filename. There is
   no module to parse and no server-only boundary to work around. A copy file
   that names a slug with no matching `content/news/en/<slug>.mdx` is a lint
   error.
2. **The URL has no date segment.** quantakrypto routes news at
   `/news/<date>/<slug>`. This site routes it at `/news/<slug>`, per
   `getFullUrl()` in `lib/metadata.ts` and `app/news-sitemap.xml/route.ts`, and
   the newsroom playbook says the same thing from the other side: slugs carry
   no date prefix, because the date already lives in frontmatter and on the
   page. If that routing rule ever changes, update `entries.mjs` with it.

`date` and `type` are still read from the frontmatter, but neither one is part
of the URL: `date` orders a batch oldest-first, and `type` (`story` or
`digest`) is carried for reporting.

**Copy is English only**, even though every article ships in seven locales. The
social accounts post in one language, so the derived link is the English one,
which for the default locale takes no locale prefix
(`https://nostr-wot.com/news/<slug>`).

`lint-social.mjs` **rejects any hard-coded `http(s)://` link** in a copy field:
a hand-typed URL drifts the moment a slug is renamed, and nothing catches it
until a reader hits a 404. Use `{url}` in the text to place the link somewhere
other than the end; otherwise it is appended on its own line by `withUrl()`. A
second link uses `{url:/path}`, and a `/news/`, `/blog/` or `/guides/` path is
checked against the files on disk.

## 5. Post when the article is actually live, not when the commit lands

Before posting, `post-social.mjs` fetches the derived URL and requires a `200`.
"The commit landed on `main`" and "the site is serving the page" are different
claims, and only the second matters to a reader who clicks the link. This
repository deploys on push to `main`, so the gap is usually small and
occasionally is not.

An entry that is not yet live is **skipped, not failed**, and is retried on the
next scheduled run. `fetch-retry.mjs` backs off over transient 5xx so a deploy
restart does not read as "not live".

## 6. The linter is the safety property, not bookkeeping

`npm run social:lint` runs in CI on every pull request (`ci.yml`, "Social copy
lint" step). It enforces:

- The API's own length limits, per channel, counted **with** the appended URL.
- House style: no em or en dash, no emoji, no hype vocabulary, no dead call to
  action. Extend `HYPE_WORDS` / `DEAD_CTA` in `lint-social.mjs` the day
  something new slips through.
- The LinkedIn shape a machine can judge: an opening claim on its own line
  followed by a blank line, and a closing block of 2 to 5 CamelCase hashtags
  with a `{url}` placed above them.
- No hard-coded links, no unknown fields, no copy file that cannot be joined to
  an article.

**The rules live in `checks.mjs`, and both entry points use them.** This matters
because the newsroom path does not go through a pull request: an article and its
copy file are committed straight to `main`, so `ci.yml`'s pull-request trigger
never sees them before they exist. Three things cover that path:

- `ci.yml` also runs on `push` to `main`, so a bad copy file turns the branch
  red immediately after the newsroom commits it.
- Nothing is posted until a scheduled `social.yml` run picks it up, and the
  soonest is hours away.
- **`post-social.mjs` re-runs the same checks before it sends anything**, and
  exits non-zero without posting or recording if any fail. A red `main` that
  nobody notices therefore cannot ship copy: CI reports, and the poster refuses.

That last point is why the rules were pulled out of `lint-social.mjs` into
`checks.mjs`. Two copies of the rules would drift, and the copy that mattered
would be the one nobody was reading. `lint-social.mjs` is now just a CLI over
`collectErrors()`.

The check covers **every** copy file, not only the ones due to post, so a broken
file stops the run rather than letting the entries either side of it go out.

The playbook still tells the newsroom agent to run `npm run social:lint` before
committing. That is the same gate, earlier, where it can stop something before
`main` goes red at all.

Proven to bite, not just written: feeding it

```json
{"linkedin": "This is revolutionary 🚀 and here is a link https://example.com — read more"}
```

produces exactly six errors and exits non-zero: the hard-coded link, the em
dash, the emoji, the hype word, the missing hashtag block, and the dead call to
action.

Six and not seven: the "hashtags with no `{url}` above them" check only fires
once a valid hashtag block exists, so a copy file missing hashtags entirely is
told that and not also told about the placeholder. Re-run this after touching
the linter; a linter nobody has seen fail is not a linter.

## 7. Cadence: fewer runs, one post per run

Three scheduled runs a day, roughly eight hours apart, on odd minutes
(`.github/workflows/social.yml`):

```yaml
on:
  schedule:
    - cron: "13 3 * * *"
    - cron: "41 11 * * *"
    - cron: "7 19 * * *"
```

**And at most one post per run**, oldest first, via `SOCIAL_MAX_PER_RUN`
(default 1, read in `post-social.mjs`).

Both halves matter. The newsroom publishes at most one article a day, so in the
steady state the cap changes nothing. It earns its keep after a quiet stretch
followed by a backlog, or after the archive gains several copy files at once:
without it, three runs a day would share them in a single burst.

The cost, written down so nobody has to rediscover it: a post can reach the feed
up to eight hours after the article goes live, and the third post of a batch
lands the next day.

**Timing is not precise.** GitHub delivers scheduled workflows late and
unevenly; cron does not need to be randomised on top of that.

## 8. Failing well

- **The secret is checked only when something is due.** `post-social.mjs` exits
  0 with no error, and no secret read, when the ledger already covers everything
  pending or nothing is live yet. Otherwise every idle run would fail and the
  red X would become background noise.
- **Any non-2xx from the API fails loudly**, with the response body surfaced,
  not just the status.
- **Nothing is recorded unless the request succeeded.** A `400` posts nothing at
  all, so a failed run is always safe to retry with the same copy next run.
- **Lint failures stop the run before any network call.** No post, no ledger
  write, non-zero exit, and the errors printed. Fix the copy and the next run
  picks it up unchanged.
- **The ledger records what the API says it published**, not what was requested.
  An `optional` channel that the board could not deliver comes back under
  `skipped` while the request still returns `200`; echoing the request would
  file an unpublished channel as published and no later run would retry it.
- **`concurrency: { group: social-posting, cancel-in-progress: false }`** on the
  workflow, so two overlapping runs cannot both see the same entry as unshared
  and both share it, and a run is never cancelled mid-POST.
- **The ledger is committed back** by the workflow's own last step
  (`permissions: contents: write`), or every run would repost everything.

## 9. What the newsroom routine does (and does not)

`docs/newsroom/playbook.md` has a step, after the illustration step, telling the
agent to write `social/<slug>.json` for whatever it just published, in the same
commit. It is told, in substance:

> Write the English social copy for the article you just published. Follow
> `docs/social-voice.md`. Only `linkedin` is required. Do not write a URL; the
> canonical link is derived and appended automatically, and a hard-coded link is
> a lint error. Run `npm run social:lint` before committing.
>
> You never hold a posting credential and must never ask for one. A separate
> workflow reads a repository secret; you write text into the commit and nothing
> else.

The routine never runs `social:post` and never touches
`DLSOCIAL_NOSTRWOT_KEY`.

## 9a. Node version, in two unrelated places

These are separate things, and conflating them wastes an afternoon.

**1. The Node that runs the build.** `.nvmrc` is the single source of truth, and
all three workflows read it with `node-version-file`. They previously carried
the literal `20` in three separate places, which is how all three drifted
together: a bump has to be made three times to take effect, so in practice it
was made zero times. Change `.nvmrc` and every workflow follows.

**2. The Node that runs the actions themselves.** An action declares its own
runtime in its `action.yml` (`runs.using`), and nothing in this repository
controls it except the version pinned in `uses:`. `actions/checkout@v4` and
`actions/setup-node@v4` declare `node20`, which is what produces

> Node 20 is being deprecated. This workflow is running with Node 24 by default.

on every run. That warning is about the action runtime and is **completely
unaffected by `node-version`**. Setting `node-version: 22` does not silence it;
only bumping the action does. The first-party actions here are pinned to
majors that declare `node24`: `checkout@v7`, `setup-node@v7`, `cache@v6`.

The `appleboy/*` actions in `deploy.yml` are composite actions, so they have no
Node runtime of their own and need no bump for this.

## 10. Setup (one-time, by a human with repo admin)

The repository secret is set:

```bash
gh secret set DLSOCIAL_NOSTRWOT_KEY --repo nostr-wot/nostr-wot
```

Use the prompt rather than `--body`, so the key stays out of shell history.

**What is still unconfirmed is the channel ids.** `nostr-wot-li`,
`nostr-wot-nostr` and `nostr-wot-x` in `CHANNEL_CONFIG`
(`scripts/social/entries.mjs`) are named by convention, copied from
quantakrypto's pattern, and have never been checked against the live API. A
wrong id on an `optional` channel fails **silently**: the post is skipped, the
request still returns `200`, and nothing reports it. This is not hypothetical;
quantakrypto's own ledger records its first real post going out on LinkedIn with
`quantakrypto-nostr` under `skipped`.

So before the first real post:

```bash
DLSOCIAL_NOSTRWOT_KEY=... npm run social:channels   # confirm nostr-wot-li, and the Nostr id
npm run social:post -- --dry-run                    # print what would be sent, post nothing
```

Or run the workflow from the Actions UI with `dry_run` left at its default
(**true**), which does both and cannot post by accident.

`SUPPORTED_CHANNELS` in `entries.mjs` controls which channels
`post-social.mjs` actually sends. X is defined in `CHANNEL_CONFIG` but
deliberately left out until it is decided on.

## 11. Two things worth verifying on the first real post

Neither can be settled from the code:

1. **Does a bare URL in the text produce a preview card on LinkedIn?**
   LinkedIn's own Posts API documentation says the API does not scrape URLs and
   that a thumbnail, title and description must be supplied explicitly for an
   article-style post. If no card appears on the first real post, that is work
   on the dandelionlabs board's side, not this repository's. Every article has
   an illustration at `public/images/news/<slug>.svg` if one is needed.
2. **Is the underlying LinkedIn credential current?** These expire roughly every
   60 days and are held by the dandelionlabs board, not this repo. A `401` from
   the posting API means reconnect the account there, not a bug here.
