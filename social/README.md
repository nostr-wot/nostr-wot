# Social copy

## LinkedIn eligibility (owner policy, 6 October 2026)

LinkedIn is reserved for relevant, substantive news and updates about the Nostr WoT platform and team. Routine third-party client, app, relay, protocol or ecosystem notices, including Amber, Amethyst, nak and Nostream releases, are not eligible. Publishing an article or adding a project to our directory does not make it a platform update. General ecosystem significance alone is not an exception.

New ecosystem copy should contain `nostr` only. For a qualifying platform or team announcement, include `linkedin`, `linkedinCategory` set to `platform-update` or `team-update`, and a nonempty `linkedinReason` explaining the actual platform/team news and reader impact. Do not label third-party maintenance as a platform advance. Minor maintenance and routine version bumps do not qualify.

The sender defaults to excluding LinkedIn when this explicit classification is absent, including old queued copy. Existing copy and receipts are preserved; policy exclusion is not delivery failure and never creates a delivery receipt. Nostr delivery remains governed by the normal queue and live-page checks. Do not retry a ledgered or uncertain delivery to apply a new classification.


One `<slug>.json` per news article, named after the **English** slug, so
`social/nip-78-puts-app-data-behind-auth.json` pairs with
`content/news/en/nip-78-puts-app-data-behind-auth.mdx`.

Written by the newsroom routine in the same commit as the article it publishes
(`docs/newsroom/playbook.md`). Only `.json` files here are read; this README is
ignored.

```json
{
  "linkedin": "The claim, alone on the first line.\n\nEvidence, with kind numbers and dates.\n\n{url}\n\n#Nostr #NIP",
  "x": "optional, 280 chars including the appended link",
  "xThread": ["optional array; only the first entry carries the link"],
  "nostr": "optional, no length cap"
}
```

At least one supported copy field is required: `nostr` or `linkedin`. LinkedIn is sent only with the explicit eligibility fields above.

**Never write a URL.** The canonical link is derived from the article's
frontmatter and appended automatically. A hard-coded `http(s)://` link is a lint
error, because a hand-typed link goes stale the moment a slug changes. Use
`{url}` to place the article link somewhere other than the end, and
`{url:/news/other-slug}` for a second link.

- Voice and structure: `docs/social-voice.md`
- How it is posted, and why the drafting agent never holds the key:
  `docs/social-posting.md`
- Check before committing: `npm run social:lint`

Adding a file here means it will be posted by
`.github/workflows/social.yml` on its next scheduled run, once the article is
live. There is no reviewer on that path.
