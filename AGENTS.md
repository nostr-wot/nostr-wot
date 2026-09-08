# Project instructions

## Git and deployment

- Do not add Codex, Anthropic or co-author attribution to commits, pull requests or authored content.
- Preserve unrelated local work. Deploy through the established GitHub Actions workflow.

## Ecosystem directory and editorial work

- Keep `data/ecosystem-projects.json` and `data/ecosystem-projects.es.json` synchronized. Translate display text; preserve IDs, enum values, dates, names and source URLs. Spanish pages must not silently render the English directory.
- Use explicit source evidence for founder/creator/maintainer roles and project status. Distinguish newly indexed from newly launched projects, and security advisories or fixes from confirmed exploited incidents.
- Read `docs/newsroom/playbook.md` before newsroom work and honor `content/news/PAUSE`. Existing daily newsroom rules remain in force.
- Weekly newsletters are prepared in the sibling dl-social repository. Read its `docs/editorial/nostr-weekly-newsletter.md`; the fortnightly series uses `docs/editorial/nostr-ecosystem-watch.md` there.
- Always check the sibling `nostr-wot-extension` and `nostr-wot-sdk` repositories for candidate version changes, then independently verify that the exact versions were published. Local manifests, commits, tags and passing builds alone are insufficient.
- For extension releases, verify channel-specific availability in the Chrome Web Store, Firefox Add-ons or non-draft downloadable GitHub releases. Store approval can differ between browsers; never claim all stores have a version based only on a GitHub release.
- For the SDK, discover non-private workspace packages and verify exact versions, publication timestamps and dist-tags against npm. The private monorepo root version is not a published package version.
- Read changelogs at the verified release refs. Lead the weekly newsletter with published Nostr WoT functionality when there is a release in its coverage window, including exact versions, meaningful changes, migration notes and release/install links. Exclude unreleased functionality and mark unavailable evidence as unknown.
- Newsletter/blog/social drafts remain pending for review. Preparing a scheduled newsletter does not authorize sending it to subscribers. Do not access posting or mailing credentials for research.
- No em dashes, invented first-person experience or unsupported claims in new editorial copy.
- Newsletter subscribers retain their page locale in private durable runtime storage. Keep all seven supported locales valid and never silently switch a recipient to English. Never expose or commit subscriber records.
- `/newsletters` is a sent-edition archive, not a draft list. An authorized sender must record the exact subject, preheader and editorial body only after provider acceptance, using `scripts/newsletters/record-sent.mjs`. Keep recipients, personalization and provider IDs private. Sent versions are immutable; corrections require a new issue/version. Preserve `data/newsletter` across deployments and include it in private operational backups.
