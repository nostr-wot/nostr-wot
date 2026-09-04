# Social voice for Nostr WoT

The newsroom playbook (`docs/newsroom/playbook.md`) governs the articles. This governs
the social copy in `social/<slug>.json`, which is a different job: an article is read by
someone who already chose to read it, a LinkedIn post has to earn the second line.

The anatomy and mechanics below are adapted from `quantakrypto/website`
`docs/social-voice.md`, which derived them from posts that measurably worked. Two things
differ here, and both are deliberate. See [section 0](#0-two-deltas-from-the-quantakrypto-voice).

**This document is not yet grounded in this project's own posts.**
[Section 6](#6-the-reference-posts) is empty on purpose and gets filled from the first
five real posts. Until then the rules below are inherited, not proven here. When this
document and your instinct disagree, and section 6 is still empty, prefer the rule and
note the disagreement; once section 6 has entries, the reference posts win and the fix is
to update this document.

## 0. Two deltas from the quantakrypto voice

**1. First person is allowed in social copy, and never in the article body.**

This is intentional. It is not an inconsistency to be tidied up later, and a future
reader should not "fix" it in either direction.

The newsroom writes unsigned reports about other people's protocol changes. The playbook
forbids attributing an article to a person, forbids speculating about maintainer intent,
and requires that articles state what the diff says. An article that says "we think" or
"we track" has quietly become a party to the thing it is reporting on, and it has no
author to whom that "we" refers.

Social copy is posted by an account. An account is a speaker. "We track hybrid key
exchange adoption daily" is a true statement about who is posting, and part 4 of the
anatomy below depends on being able to say it. Without first person there is no way to
say what this project does and no way to turn a report into something a reader can
respond to.

So:

- `social/<slug>.json` may use "we" and "our". Sparingly, and only about things this
  project actually does.
- `content/news/<locale>/<slug>.mdx` may not, in any locale.

Nothing checks the article side automatically. It is a playbook rule and a review point.

**2. Section 6 starts empty.** quantakrypto's voice document was written from five posts
that already existed. This one is written before the first post, so its reference section
is a placeholder rather than five invented examples. An invented reference post is worse
than none: it looks like evidence and is not.

## 1. The anatomy

Every post follows the same five parts, in this order.

**1. A claim, alone on the first line, followed by a blank line.** One sentence. It
states a finding, not a topic. It is safe to lead with the number. There is no length
limit on it, or on any line: the only caps that exist are the platform's own (LinkedIn
3000 characters, X 280 per post), and those are counted with the article link included.

Not "NIP-78 was updated yesterday." That is an event report. The claim is what the change
*means*: that app settings stored on a relay were readable by anyone until a paragraph
merged on Wednesday.

**2. The evidence, immediately.** Exact figures in the second block, never later. Kind
numbers, tag names, dates, counts, NIP numbers, byte sizes, at full precision. Keep them
in English and unlocalised, the way the articles do.

If you cannot put a number or a specific identifier in the second block, you may not have
a post.

**3. The turn.** One short line that inverts what the reader now expects. This is the
part that makes it a post rather than a summary.

**4. What we track, and what it costs the reader to ignore.** First person plural for
this project's own work, per [section 0](#0-two-deltas-from-the-quantakrypto-voice): "We
track", "We read every merged NIP". Then address the reader directly, usually as a
question they cannot answer yet.

Keep this honest. The newsroom reports on the protocol; it does not claim credit for it.
"We track every NIP merge" is true. "We secured your DMs" is not.

**5. Links, then hashtags.** In that order, see [section 3](#3-links).

## 2. The honesty note

State a limit on the claim, in a short line near the end. In this subject area that is
usually the gap between what a specification says and what relays and clients actually
do: a merged `SHOULD` is not deployed behavior, and saying so plainly is the difference
between a report and a press release.

> The text merged on Wednesday. Whether any relay enforces it is a separate question, and
> today the answer is mostly no.

A post that claims only what it can support reads as more confident, not less.

## 3. Links

The canonical article link is derived, never typed: see `docs/social-posting.md`. Two
rules specific to voice:

- **Place it with `{url}`, on its own line, BEFORE the hashtags.** Without a `{url}`
  placeholder the poster appends the link at the very end, which puts it after the
  hashtag block. Posts end on hashtags. The linter enforces this pairing.
- **A second link needs `{url:/path}`.** A bare `https://` link in the copy is a lint
  error, because a hand-typed link goes stale when a slug changes. To link another page,
  write `{url:/news/some-slug}` and the poster expands it. A `/news/`, `/blog/` or
  `/guides/` path is checked against the files on disk, so a link to an article that does
  not exist fails CI instead of shipping dead.

The link always points at the **English** article. Copy is English only, even though
every article ships in seven locales.

Multiple links are a normal format. Give each one a line and say what it is.

## 4. Hashtags

Two to five, on the last line, CamelCase, no punctuation. Drawn from what the post is
actually about. The expected set for this project:

`#Nostr` `#NIP` `#Relays` `#Privacy` `#Decentralization` `#PostQuantum` `#Cryptography`
`#OpenSource` `#Protocol` `#Security`

## 5. Mechanics

- **No em dashes or en dashes**, anywhere. Commas, colons, parentheses, or a full stop.
  This is the same house rule the newsroom playbook applies to articles, and the linter
  checks it here.
- **No emoji.**
- **No hype vocabulary.** No "revolutionary", "game-changing", "unprecedented",
  "massive", "groundbreaking", "cutting-edge", "paradigm shift". The specifics carry it.
- **No vague call to action.** "We wrote up what is actually new here", "Read more",
  "Learn more", "Check it out" are all dead text. Say what the thing is: "Full breakdown
  here:", "How it works:", "What the diff actually says:".
- **No speculation about maintainer intent, roadmaps or adoption.** This carries over
  from the playbook unchanged. Report what merged, not what someone probably wants.
- **Fragments are correct.** Vary the length hard; a nine-word sentence after a
  forty-word one is the rhythm.
- **Adjectives are a smell.** Replace one with a number or a kind number wherever you can.
- **Technical terms stay in English** and at full precision: `kind 30078`, not "the
  settings event". The articles follow the same rule.

## 6. The reference posts

**Empty on purpose. Do not invent entries here.**

Fill this section from the **first five real posts** this project publishes, once they
exist and once there is some signal about which of them worked. Keep each one verbatim,
with a short note on what it does structurally, in the shape quantakrypto's section 6
uses:

```
N. **Short label.** What the claim does, what the evidence is, what the turn is,
   and what limit the honesty note states.
```

Until then, sections 1 through 5 are inherited rules rather than observed ones, and the
gap is worth remembering when a post does not fit them.
