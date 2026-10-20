# Guide screenshots and videos

Guide media is shared by `translationKey` in `lib/guide-media.ts` and rendered by `components/guides/GuideMedia.tsx`. Captions, accessible image-link labels and YouTube links come from `messages/<locale>/guides.json` in all seven locales. Existing inline diagrams and screenshots remain in MDX where they explain a step. The shared gallery adds full-size image links and related video walkthroughs.

## Screenshots

`public/images/guides/extension/` contains real extension captures, using demo accounts. English UI is identified in the gallery. The source capture harness is `nostr-wot/content-operations`, `capture/guides/guide-media.mjs`; its ignored `out/guide-media/manifest.json` records the extension version, source commit and capture time. Current captures use extension 0.8.9.

The following captures reuse the existing video production footage:

| Website image | Content-operations capture |
| --- | --- |
| sub-account | video 02, `stills/advanced.png` |
| backend-review, relay-review | video 12, `stills12/backend-before.png`, `relay-before.png` |
| zap-limit, zap-review, lightning-address | video 06, `revision-v089/threshold.png`, `request.png`, `address-fixed.png` |
| app-connection | video 06, `apps.png` |
| accounts, remove-confirmation | video 11, `stills/accounts.png`, `warning.png` |

Capture paths are relative to each video's ignored output directory in the content-operations working set. Capture sources are versioned there; rendered media is not. The website owns the images it serves.

Before replacing a screenshot, compare its controls with the current extension source. Never capture a personal vault, recovery phrase, private key, wallet connection secret or personal messages. Account removal and trust customization were updated alongside their screenshots because their previous text described obsolete controls. Conceptual Nostr guides keep diagrams; the playground keeps its existing application screenshots.

## Published videos

These IDs and titles were verified against the public `@nostr-wot` channel and YouTube's oEmbed endpoint on 2026-10-04. A local video render is not evidence of publication. Only add an ID once its published title and topic have been checked.

| ID | Topic | Guides |
| --- | --- | --- |
| eFoC8i0G4Fk | Nostr basics: keys, signed notes, relays and clients | What is Nostr? |
| pUBd2rgmhNc | Create a Nostr account | Getting started, create account |
| 5nk687W76hE | Multiple identities from one seed | Custom identity paths |
| Iu11fK9juzU | Site permissions and global rules | Site permissions |
| pnOollWgs7g | Passwords and auto-lock | Managing identity |
| 2-oTsMLWEd8 | Export and re-import keys | Import account, managing identity |
| -bIhd8BU3kU | Appearance | Theme contribution |
| uK5wQDeWJdA | Change language | Language |
| HjK-ygsj4Qs | Approvals and recent activity | Site permissions |
| 1WgclSqckIk | Wallet setup | Setting up wallet |
| qxEOM_jAG4I | Send zaps | Zapping and auto-approval |
| U1LZmgQgURA | Remove an account | Removing accounts |
| 4TmndKyE8D4 | Backend and relay authentication | Both authentication guides |
| He4gz4occgY | Back up and migrate events | Account Archive |

Players use `youtube-nocookie.com`, lazy loading and a descriptive title, with a separate direct YouTube link below. The site's `frame-src` CSP permits only that YouTube embed origin. The video is in English; localized pages say so. The language guide uses the dedicated language video.

## Verification

Run `npm test`, `npm run build` and `npm run test:parity`. The media tests check all localized guide mappings, captions and assets, validate embed IDs and ensure each published English guide has an instructional image or diagram. Verify the Back control, gallery and video at desktop and mobile widths before deploying.

The theme contribution guide (`create-extension-theme`, all seven locales) reuses the appearance-settings screenshot and the published appearance video. Its JSON starter palette is checked against the extension’s `parseCustomThemeJson` parser.

The Nostr introduction (`eFoC8i0G4Fk`, “What Is Nostr? Keys, Relays and Clients Explained”) was verified on the official public channel on 2026-10-18. The page identifies Nostr WoT as the publisher, dates the public video 2026-10-05, reports a 4:38 duration, and describes keys, signed notes, independent relays and clients. It is embedded in the localized What Is Nostr? guide without implying a software release.

The archive and migration tutorial (`He4gz4occgY`, “How to Back Up and Migrate Nostr Events with Nostr WoT”) was verified through YouTube’s oEmbed endpoint on 2026-10-07. It lasts approximately 1:49 and appears in Account Archive and the localized Help library. Downloads contain signed events without a file password; encryption of the local archive is distinct from the downloaded file.

## User help

`/help` is a searchable index of ordinary task links, grouped by user need. Each task opens `/help/<slug>` with visible steps, optional screenshots and video, related tasks, and relevant longer guides. Search results link directly to the task and retain the query for the Back to Help link. Old `/help#<task-id>` links forward to the matching article. The separate video grid links to the video section of each article; it does not expand players inside the index.

`lib/help-topics.ts` owns stable task IDs, route slugs, categories, optional media and related tasks. `HELP_VIDEOS` lists all 13 published tutorials independently of the task inventory. `lib/guide-media.ts` remains the shared video registry. Steps, category descriptions and navigation labels live in all seven `messages/<locale>/help.json` files. Related guides resolve from the current locale’s published inventory. Screenshots reuse the guide captures and translated captions. Add each task to the inventory and translate its content; the task route and sitemap enumerate that inventory automatically. Keep instructions aligned with the extension when controls change.

Help articles also include an overview, prerequisites, three to five steps, and outcome checks in every locale. Visible H2 sections provide navigation targets; the shared table of contents respects reduced motion. Captioned screenshot galleries use the existing demo captures. The additional `appearance-light`, `appearance-dark` and `language-picker` images come from the published video 07 (`mode.png`, `preset.png`) and video 08 (`open.png`) captures of extension 0.8.8; these illustrate controls, not a claim about the latest release.

The Help index emits a localized CollectionPage and ItemList. Articles emit TechArticle with the visible overview and instructional text; both include BreadcrumbList matching the visible navigation. No publication dates, ratings, or video upload dates are invented. The production SEO audit enforces one nonempty H1, sequential headings in the main content, canonical schema URLs and the expected help schemas. The sitemap tests cover the index and all 21 task routes in seven locales.

## Passkey course publication slots

Lessons 16, 17 and 18 use `passkeyCreate`, `passkeyRecover` and `passkeyProtect` in the existing `GUIDE_VIDEOS` registry. Lesson 16 is published at https://youtu.be/q1RiU-VqM_k (1:04). Lessons 17 and 18 retain `id: null` values, which deliberately render translated pending text in both guide media and help articles. The help library links to working written lessons, with no iframe, thumbnail request, invented runtime or YouTube URL for a pending lesson.

After each video is actually published and its title/topic verified, replace that entry's null ID with the verified 11-character YouTube ID and set its real duration in `HELP_VIDEOS` in `lib/help-topics.ts`. All seven guide and help variants then use the same published video. Keep pending IDs null until publication; never use an empty string or placeholder ID. Lessons 16 and 17 cover creation and recovery. Lesson 18 now covers protecting an existing local private-key account with a passkey; its pending slot belongs to `protect-existing-nostr-account-with-passkey`. The separate external-provider migration guide and help topic retain their written instructions without a video assignment. Content-operations owns the current lesson scripts and captures.

The written lessons were checked against the active extension passkey worktree on 2026-10-15, including `PasskeyRecoverySetup`, `Settings/PasskeySection`, onboarding labels and `docs/passkey-recovery.md`. Updated against the 0.8.13 local creation flow: confirmed provider storage advances automatically to protection preferences, without an optional-download screen or another Continue action. File download, acknowledgement and optional relay saving appear only when provider storage is unavailable or fails. Additional file export remains in Passkey settings. Migration first recovers compatible data at the original RP, verifies the same npub, then uses Add another passkey to enroll a credential at `passkeys.nostrwot.com`. This is not universal cross-application passkey transfer. Release/store availability must be verified before deploying the guides; this draft does not assert an available release number.

Guide paths in each of `en`, `es`, `pt`, `fr`, `it`, `de` and `ru` are `/guides/create-nostr-account-with-passkey`, `/guides/recover-nostr-account-with-passkey`, `/guides/protect-existing-nostr-account-with-passkey` and the separate `/guides/migrate-passkey-account-to-nostr-wot`. Help paths are `/help/create-account-with-passkey`, `/help/recover-account-with-passkey`, `/help/protect-existing-account-with-passkey` and `/help/migrate-passkey-account`. Existing collection discovery and the help-topic sitemap loop include these automatically; existing `guides` and `help` message registrations cover the new localized keys.

Lesson 18 was aligned with the parent’s real Chrome recording: existing local account, Settings → Security → Passkey settings → Set up passkey unlock → Confirm, native credential creation and recovery verification, registered provider storage, Use passkey with 15-minute auto-lock, and successful local lock/unlock. Account removal and reimport were not completed and are not described as verified. The written guide distinguishes local unlock from recovery testing.
