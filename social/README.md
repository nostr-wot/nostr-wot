# Social copy

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

Only `linkedin` is required.

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
