# Content Authoring Guide

This guide covers MDX components, citation systems, SEO structured data, and best practices for writing content on the Nostr WoT site.

## Table of Contents

- [MDX Components](#mdx-components)
  - [WikiLink](#wikilink)
  - [Callout](#callout)
  - [Citation System](#citation-system)
  - [Statistic](#statistic)
  - [ExpertQuote](#expertquote)
- [FAQ Authoring](#faq-authoring)
- [SEO Structured Data](#seo-structured-data)
- [GEO Optimization Best Practices](#geo-optimization-best-practices)
- [New Blog Post Checklist](#new-blog-post-checklist)

---

## MDX Components

All blog posts and guides are written in MDX. The following custom components are available alongside standard Markdown.

### WikiLink

Wikipedia-style hover preview links. Use for external references where a tooltip preview adds context.

```mdx
<WikiLink href="https://en.wikipedia.org/wiki/Web_of_trust" extract="A web of trust is a concept used in PGP, GnuPG, and other OpenPGP-compatible systems to establish the authenticity of the binding between a public key and its owner.">
  Web of Trust
</WikiLink>
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `href` | string | Yes | URL to link to |
| `children` | ReactNode | Yes | Link text |
| `extract` | string | No | Preview text shown in tooltip |

**Best practices:**
- Use for Wikipedia, technical docs, or protocol specification links
- Keep `extract` under 200 characters for clean tooltip display
- Don't overuse - 2-5 WikiLinks per article section is ideal
- Prefer WikiLink over plain `[text](url)` when the term benefits from a definition preview

### Callout

Highlighted info, warning, or tip boxes.

```mdx
<Callout type="info">
  NIP-07 is the Nostr protocol for browser extension signing.
</Callout>

<Callout type="warning">
  Never share your private key (nsec) with anyone.
</Callout>

<Callout type="tip">
  You can use the playground to test WoT queries before integrating the SDK.
</Callout>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'info'` \| `'warning'` \| `'tip'` | `'info'` | Visual style |
| `children` | ReactNode | - | Content |

---

### Citation System

For academic-style references. Three components work together: `Citation`, `BibEntry`, and `Bibliography`.

Use quoted literal IDs such as `id="1"`. The MDX renderer keeps `blockJS` enabled, which strips JavaScript expression props, including `id={1}`. Quoted IDs reach the citation components and produce matching citation and reference links.

#### Inline Citation

Place inline citation markers that link to a bibliography at the bottom of the post.

```mdx
The Web of Trust model was first described by Phil Zimmermann in the PGP documentation.<Citation id="1" />
Trust networks reduce spam by 85% compared to naive filtering approaches.<Citation id="2" />
```

**Rendered output:** The text with superscript `[1]` and `[2]` markers that are clickable links to the bibliography.

#### Bibliography

Place at the end of the post. The `BibEntry` items link back to their inline citations.

```mdx
<Bibliography>
  <BibEntry
    id="1"
    authors="Zimmermann, P."
    title="PGP User's Guide, Volume I: Essential Topics"
    source="MIT Press"
    year="1994"
    url="https://www.philzimmermann.com/EN/essays/index.html"
  />
  <BibEntry
    id="2"
    authors="Garcia-Molina, H., Kamvar, S., Schlosser, M."
    title="The EigenTrust Algorithm for Reputation Management in P2P Networks"
    source="Proceedings of the 12th International Conference on World Wide Web"
    year="2003"
    url="https://doi.org/10.1145/775152.775242"
  />
</Bibliography>
```

**BibEntry Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | number | Yes | Must match the `Citation` id |
| `authors` | string | Yes | Author names (Last, First format) |
| `title` | string | Yes | Title of the work |
| `source` | string | No | Journal, conference, or publisher |
| `year` | string | No | Publication year |
| `url` | string | No | Link to the source (DOI preferred) |

**Best practices:**
- Number citations sequentially as they appear in the text
- Use DOI URLs when available (`https://doi.org/...`)
- Prefer peer-reviewed or authoritative sources (.gov, .edu, IEEE, ACM)
- Every `Citation` must have a matching `BibEntry` and vice versa

### Statistic

Highlighted statistic with source attribution. Use for key numbers that support claims.

```mdx
<Statistic
  value="2.3M+"
  label="Nostr users have adopted identity verification"
  source="Nostr Analytics Q1 2026"
  sourceUrl="https://stats.nostr.com"
/>
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | string | Yes | The number/stat (e.g., "2.3M+", "85%", "10K") |
| `label` | string | Yes | What the stat represents |
| `source` | string | No | Attribution text |
| `sourceUrl` | string | No | Link to the source |

**Best practices:**
- Always include a source - unsourced stats hurt credibility
- Use concrete numbers, not vague claims ("85%" not "most")
- Place after the paragraph that introduces the claim
- 1-2 statistics per article section maximum

### ExpertQuote

Styled blockquote with author attribution. Use for statements from known developers, researchers, or industry figures.

```mdx
<ExpertQuote
  quote="The Web of Trust is a game-changer for decentralized identity verification."
  author="fiatjaf"
  title="Creator of Nostr"
  organization="Nostr Protocol"
/>
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `quote` | string | Yes | The quoted text |
| `author` | string | Yes | Person's name |
| `title` | string | No | Job title or role |
| `organization` | string | No | Company or institution |
| `avatar` | string | No | Path to avatar image |

**Best practices:**
- Only use real, verifiable quotes - never fabricate
- Include title and organization for authority signaling
- Prefer quotes from recognized figures in the Nostr/crypto/security space
- 1 expert quote per article is usually sufficient

### `<cite>` Tag

Standard HTML cite tag, styled for the blog. Use for inline title references.

```mdx
As described in <cite>The PGP User's Guide</cite>, trust is transitive.
```

---

## FAQ Authoring

FAQ content is defined in translation files (`messages/{locale}/home.json` and `messages/{locale}/download.json`).

### Plain text FAQ

```json
{
  "faq": {
    "items": {
      "whatIsWot": {
        "question": "What is Web of Trust?",
        "answer": "Web of Trust is a decentralized trust model..."
      }
    }
  }
}
```

### Rich HTML FAQ

The `AccordionList` component supports HTML in answers via the `richAnswer` flag:

```typescript
const faqItems = [
  {
    question: "How do I integrate WoT?",
    answer: 'Install the <a href="https://npmjs.com/package/nostr-wot-sdk">SDK</a> and follow our <strong>getting started</strong> guide.',
    richAnswer: true,
  },
];
```

When `richAnswer: true`, the answer string is rendered as HTML. Supported tags: `<a>`, `<strong>`, `<em>`, `<code>`, `<br>`. Links automatically get primary color styling.

**Best practices:**
- Keep FAQ answers concise (2-3 sentences)
- Use rich answers sparingly - only when links or emphasis are needed
- FAQ content should directly answer the question (no preamble)
- Maintain the same FAQ items across all locale files

---

## SEO Structured Data

The site automatically generates JSON-LD structured data. Here's what's auto-generated and what requires manual attention.

### Auto-generated (no action needed)

| Schema | Pages | Source |
|--------|-------|--------|
| `Organization` | Homepage | `app/[locale]/page.tsx` |
| `WebSite` + `SearchAction` | Homepage | `app/[locale]/page.tsx` |
| `SiteNavigationElement` | Homepage | `app/[locale]/page.tsx` |
| `FAQPage` | Homepage, Download | `app/[locale]/page.tsx`, `app/[locale]/download/page.tsx` |
| `BlogPosting` | All blog posts | `app/[locale]/blog/[slug]/page.tsx` |
| `HowTo` | All guides | `app/[locale]/guides/[slug]/page.tsx` |
| `BreadcrumbList` | Blog posts, Guides | Auto-generated from URL hierarchy |
| `SoftwareApplication` | Download, Features, Oracle | Per-page definitions |
| `AboutPage` | About | `app/[locale]/about/page.tsx` |
| `ContactPage` | Contact | `app/[locale]/contact/page.tsx` |

### Author Schema (auto from frontmatter)

Blog post author schema is automatically enriched from frontmatter:

```yaml
author:
  name: "Leon Acosta"
  avatar: "/authors/leon-profile.jpg"
  npub: "npub1gxdhmu..."
  socials:
    linkedin: "leonacosta"
    twitter: "leonacosta_"
    github: "leonacostaok"
```

This generates a `Person` schema with:
- `name` and `url` (njump.me link from npub)
- `affiliation` (Organization: Nostr Web of Trust)
- `sameAs` array (Twitter, GitHub, LinkedIn, Nostr profile URLs)

### Adding a new author

1. Add avatar image to `public/authors/`
2. Use the full frontmatter author block in your MDX file
3. The JSON-LD will automatically include all provided social links

---

## GEO Optimization Best Practices

GEO (Generative Engine Optimization) optimizes content for AI citation engines (ChatGPT, Claude, Perplexity, Gemini). These practices increase the likelihood of your content being cited in AI-generated answers.

### 1. Cite authoritative sources

Every factual claim should reference a reputable source. Preferred source types:
- **Academic papers** (DOI links): IEEE, ACM, arXiv
- **Standards bodies**: NIST, IETF (RFCs), W3C
- **Protocol specifications**: NIPs (Nostr Implementation Possibilities)
- **Industry reports**: From recognized organizations

Use the `<Citation>` + `<Bibliography>` system for formal references.

### 2. Include concrete statistics

Replace vague claims with specific numbers:

| Weak | Strong |
|------|--------|
| "Many users experience spam" | "78% of social media users report encountering spam daily (Pew Research, 2025)" |
| "Fast performance" | "Processes 10,000+ trust queries per second with <1ms latency" |
| "Growing adoption" | "Nostr's relay count grew 340% in 2025, reaching 800+ active relays" |

Use the `<Statistic>` component for key numbers.

### 3. Use expert quotes

Attribute statements to recognized experts when possible. This signals E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) to both AI engines and traditional search.

### 4. Write with authoritative tone

- Use confident, direct language - avoid hedging ("might", "could potentially", "it seems")
- Use domain-specific terminology: "NIP-07 signer", "cryptographic proof", "social graph traversal", "Sybil resistance"
- Define technical terms on first use, then use them consistently
- Write in active voice

### 5. Increase lexical diversity

- Vary sentence structure and length
- Use precise synonyms instead of repeating the same words
- Maintain technical accuracy while being accessible
- Target Flesch Reading Ease > 60 for technical content, > 80 for introductory content

### 6. Structure for AI extraction

- Lead each section with a clear topic sentence
- Use descriptive H2/H3 headings that could serve as standalone answers
- Include definition-style paragraphs: "X is Y that does Z"
- Wrap key definitions in `<strong>` tags

---

## New Blog Post Checklist

Use this checklist when creating a new blog post:

### Frontmatter
- [ ] `title` - Clear, descriptive, includes target keyword
- [ ] `description` - 150-160 characters, includes keyword
- [ ] `excerpt` - 1-2 sentence summary for cards/previews
- [ ] `date` - ISO format (YYYY-MM-DD)
- [ ] `author` - Full block with name, avatar, npub, socials
- [ ] `featuredImage` - 2:1 aspect ratio, SVG + JPG versions
- [ ] `previewImage` - Card preview, SVG + JPG versions
- [ ] `ogImage` - 1200x630, SVG + JPG versions
- [ ] `tags` - 3-5 relevant tags
- [ ] `seoTitle` - If different from title (60 chars max)
- [ ] `seoDescription` - If different from description
- [ ] `translationKey` - Unique key linking all locale versions
- [ ] `published: true`

### Content quality
- [ ] At least 2-3 authoritative citations with `<Citation>` + `<Bibliography>`
- [ ] At least 1 concrete statistic with source
- [ ] Domain-specific terminology used correctly
- [ ] No hedging language in key claims
- [ ] WikiLinks for important external concepts
- [ ] Callouts for important warnings or tips

### Images
- [ ] SVG source files created
- [ ] JPG versions generated (use `--background-color '#1e1b4b'` for dark backgrounds)
- [ ] All images have descriptive alt text

### Translations
- [ ] English version complete and reviewed
- [ ] Translation files created for all 7 locales (en, es, pt, ru, it, fr, de)
- [ ] `translationKey` consistent across all locale versions

### SEO
- [ ] Title under 60 characters
- [ ] Description under 160 characters
- [ ] Target keyword in title, description, and first paragraph
- [ ] H2/H3 headings include related keywords
- [ ] Internal links to relevant pages (guides, docs, features)

### Localized internal links

Use locale-free internal paths in Markdown links, for example `/guides/configurar-billetera` in Spanish content. The shared link component adds the current locale. Adding `/es` yourself produces `/es/es/...` after hydration. Keep the translated slug, and verify the rendered link in the browser.
