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

Players use `youtube-nocookie.com`, lazy loading and a descriptive title, with a separate direct YouTube link below. The site's `frame-src` CSP permits only that YouTube embed origin. The video is in English; localized pages say so. The language guide uses the dedicated language video.

## Verification

Run `npm test`, `npm run build` and `npm run test:parity`. The media tests check all localized guide mappings, captions and assets, validate embed IDs and ensure each published English guide has an instructional image or diagram. Verify the Back control, gallery and video at desktop and mobile widths before deploying.

The theme contribution guide (`create-extension-theme`, all seven locales) reuses the appearance-settings screenshot and the published appearance video. Its JSON starter palette is checked against the extension’s `parseCustomThemeJson` parser.

## User help

`/help` organizes all 12 published videos into searchable tasks with short steps. `lib/help-topics.ts` owns categories, durations and related guide translation keys; `lib/guide-media.ts` remains the shared video registry. Steps and labels live in `messages/<locale>/help.json`. Related guides resolve from the current locale’s published inventory. Players load when a task opens, and each task has a shareable fragment URL. Keep the steps aligned with the extension when controls change.

Help separates the task directory from its video library. `HELP_TOPICS` accepts tasks without videos, including troubleshooting; `HELP_VIDEOS` keeps all 12 published tutorials in a separate thumbnail grid. Search covers task titles and steps. Screenshots reuse the guide captures and translated captions. Players load only when a visitor chooses a video, either within an expanded task or in the library. New tasks need concise instructions in all seven `help.json` files; a video is optional.
