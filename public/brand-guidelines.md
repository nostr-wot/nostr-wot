# Nostr WoT: brand and interface guidelines for agents

Use this guide when writing copy, changing website UI, creating illustrations or producing branded assets. It describes the website's existing implementation and the product focus set by its owner: signer and wallet interoperability, easy onboarding, and user control across compatible apps and devices. It does not approve a redesign or certify product availability.

## Start here

1. Read `AGENTS.md` and the nearest instructions for the files you will change.
2. Search the existing components and the closest page before adding markup or behavior. Use `rg --files components` and `rg -n 'ComponentName' app components`.
3. Reuse the existing component, token, translation key, asset and route helper where they fit. Extend a shared component when there is a real gap; do not create a parallel design system.
4. Keep product facts separate from positioning. Verify platform, release channel and compatibility before claiming a capability is available.
5. Inspect the final light/dark, mobile/desktop, keyboard and expanded/collapsed states. Preserve existing content and working interactions.

The implementation map below uses repository-relative paths in [nostr-wot/nostr-wot](https://github.com/nostr-wot/nostr-wot). Source code defines current behavior; an inconsistency is not permission to copy it into new work. The dated audit in `docs/design/brand-audit-2026-11-02.md` records findings and correction status separately from these durable guidelines.

## Brand, audience and language

- Public name: **Nostr WoT**, preserving capitalization. Use **Nostr Web of Trust** when expanding the name. Nostr is the ecosystem; Nostr WoT is this project.
- Lead with the signer and Lightning wallet experience: start with an identity, connect compatible apps, review requests and manage access. Explain Web of Trust, the SDK and the Oracle in the context where they help the reader.
- People using Nostr need understandable onboarding, identity management, signing and payments. Developers need reusable integration tools and clear compatibility boundaries. Oracle operators need accurate deployment and query documentation.
- Use direct action labels: “Create account”, “Connect wallet”, “Review request”, “Manage permissions”. Localize UI strings through `messages/<locale>/*.json` rather than pasting these English examples into JSX.
- Distinguish identity, signer, wallet and app. A signature is not a payment; a connection is not unlimited permission; a remote signer connection is not a copy of the private key.
- Describe supported clients as **compatible apps**. Check platform and pairing requirements before describing a phone-to-device flow. Do not reuse generated concept art as evidence of shipped UI, iOS support or background operation.
- Describe experimental cryptography as experimental and specify its scope. Avoid promises of permanent security or compatibility with every client.
- Social distance is a graph measurement. Do not introduce new claims that a distant account is malicious or that proximity certifies a person. The owner approved descriptive integration and social-distance wording. Use “Nostr WoT integration” and explicit hop counts; do not reintroduce verification labels.
- Use plain language, preserve technical accuracy, and avoid em dashes and invented personal experience in new editorial copy.

**Copy pattern:** “Connect a compatible wallet to send Lightning payments.” Explain a protocol name in developer documentation or a relevant technical detail, rather than making it the first thing a new user must understand.

**Sources:** `messages/en/home.json`, `messages/en/features.json`, `messages/en/about.json`, `public/llms.txt`, the sibling extension/SDK documentation, and the owner's product direction. These sources have known copy drift; they are not interchangeable release guarantees.

## Logo and identity assets

| Use | Existing source | Rule |
| --- | --- | --- |
| Website logo | `components/icons/Logo.tsx` → `LogoIcon` | Reuse the connected-node SVG. Default size is 26×26, viewBox 48×48, default class is `text-primary dark:text-indigo-300 shrink-0`. |
| Header/footer lockup | `components/layout/Header.tsx`, `components/layout/Footer.tsx` | `BrandLockup` in `components/icons/BrandLockup.tsx`, 26px high, theme-aware SVG assets containing the symbol beside outlined Inter Semibold lettering. |
| Animated logo | `components/icons/AnimatedWotLogo.tsx` | Reuse the existing animation where appropriate; review reduced-motion behavior. |
| App icon | `app/icon.svg`, `app/icon.png`, `public/icon-192.png`, `public/icon-512.png` | Use existing assets. Check vector/raster consistency before exporting; do not trace or regenerate the logo with an image model. |
| Social preview mark | `components/icons/SocialLogo.tsx`, `lib/social-image.tsx` | Use the existing renderer and original geometry. |
| Nostr ecosystem symbol | `NostrLogo` in `components/icons/Logo.tsx` | Keep its meaning separate from the Nostr WoT product mark. |
| Partner marks | `public/brand/` | Preserve provided geometry and colors; use the appropriate light/dark asset. |

`className` on `LogoIcon` replaces its default class string. Include `text-primary dark:text-indigo-300 shrink-0` yourself when customizing size. The component does not accept arbitrary SVG props; wrap it when adding decorative accessibility semantics.

```tsx
import { Link } from '@/i18n/routing';
import { BrandLockup } from '@/components/icons/BrandLockup';

<Link href="/" className="flex items-center gap-2 font-semibold text-xl text-gray-900 dark:text-white hover:no-underline">
  <BrandLockup />
</Link>
```

The canonical downloadable lockups live in `public/brand/nostr-wot/lockup-light.svg` and `lockup-dark.svg`; matching standalone symbols are `symbol-light.svg` and `symbol-dark.svg`. They contain paths, not SVG text or an external font reference. Inter Semibold at optical size 20 supplies the wordmark; this is a fixed brand asset, while page copy still uses the system font. Regenerate using `scripts/brand/export-wordmark.py` with the official Inter variable TTF. Keep the adjacent Inter OFL license with distributed assets. Do not export Apple system fonts or replace the outlined wordmark with live text.

Use brand indigo #6366F1 with neutral lettering on light backgrounds. On dark backgrounds, the symbol and lettering use light purple #A5B4FC. Keep clear space of at least half the symbol height around the lockup. Minimum display height: 26px for the lockup and 24px for a standalone symbol. Preserve proportions and do not crop the mark. `BrandLockup` defaults to the page theme; `tone="light"` and `tone="dark"` are for explicitly colored preview surfaces.

Do not substitute the egg concept, generated poster typography or a newly drawn node arrangement for these assets. Those earlier creative explorations are not the website's identity system.

## Colors: distinguish brand tokens from effective control styles

The token source is `app/globals.css` (`@theme`). Read the entire file: later rules intentionally override some early definitions.

| Token | Value | Existing use |
| --- | --- | --- |
| `primary` | `#6366F1` | Product mark, accents, borders, decorative fills. |
| Dark-background logo | `#A5B4FC` | Symbol and wordmark on dark surfaces; not a primary button fill. |
| `primary-dark` | `#4F46E5` | Darker indigo, including active tab text on light surfaces. |
| `nostr` | `#8B5CF6` | Nostr accent. |
| `trust-green` | `#22C55E` | Existing success/trust visualization color. |
| `trust-yellow` | `#EAB308` | Existing warning/distance visualization color. |
| `trust-red` | `#EF4444` | Existing error/distance visualization color. |

**Actual primary buttons:** final `.btn-primary` rules use `#4F46E5`, hover `#4338CA`, with white text. Do not rebuild a primary button using only `bg-primary`; it would bypass the current button treatment. The media kit documents this approved distinction between brand indigo and action indigo.

**Surfaces:** root body uses `bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`. Shared cards use white/gray-800; directory and article sidebar surfaces use white/gray-900. These are contextual patterns, not evidence that every card must have the same background.

**Text:** ordinary secondary text commonly uses `text-gray-600 dark:text-gray-400`. Small colored text needs a contrast check on its actual surface. `Tabs` already uses `text-primary-dark dark:text-primary` for this reason. Green/yellow/red badge variants are not blanket approval for small text or white text on saturated backgrounds.

**Focus:** reuse `focusRing` for non-field controls and `iconButton` for the existing 36px icon-control treatment. Fields use primary rings; `.btn` uses an indigo outline. These treatments currently differ; do not introduce a fourth custom focus style.

## Typography, space and layout

| Role | Existing pattern | Example |
| --- | --- | --- |
| UI/body font | System sans stack in `--font-sans` | `app/globals.css`; no new marketing font needed. |
| Code | `--font-mono`, Fira Code/Consolas/Monaco fallback stack | `CodeBlock`, `InlineCode`, `TerminalBlock`. A named fallback is not proof that a font is bundled. |
| Page heading | `text-4xl md:text-5xl font-bold` | Media kit hero; other heroes can have intentionally larger scales. |
| Section heading | `text-3xl md:text-4xl font-bold mb-4` | `SectionHeader`. |
| Card heading | `text-xl font-bold mb-3` | `FeatureCard`. |
| Main section width | `max-w-6xl mx-auto px-6` | `Section`, Header, Footer. |
| Reading layout | `max-w-5xl`, sidebar at `lg`, 2:1 featured image | `ArticleLayout`. |
| Section rhythm | `sm=py-16`, `md=py-20`, `lg=py-24` | `Section`; default `lg`. |
| Card padding | `none`, `sm=p-4`, `md=p-6`, `lg=p-8` | `Card`; default `md`. |
| Corners | `rounded-lg` controls, `rounded-xl` Card, `rounded-2xl` FeatureCard/directory | Choose by component family. |

Use the existing scale rather than arbitrary pixel values for ordinary layouts. Keep special geometry in diagrams and illustrations where it is necessary. Do not flatten the article, docs, marketing and interactive-tool layouts into a single template.

## Components: selection and actual API

Import shared controls from `@/components/ui` and icons from `@/components/icons`.

| Need | Component/API | Notes |
| --- | --- | --- |
| Action | `Button`, `variant="primary\|secondary\|outline\|ghost"`, `size="sm\|md\|lg"` | Use `type="button"` for non-submit actions. No built-in `loading` prop. |
| Internal CTA | `LinkButton`, `href` | Locale-aware. Also supports `white` and `white-outline`. |
| External CTA | `ExternalLinkButton`, `href` | Opens a new tab with `noopener noreferrer`; also has white variants. |
| General surface | `Card`, `variant="default\|interactive\|gradient"`, `padding`, `gradient` | Interactive appearance does not create link/button semantics. |
| Feature summary | `FeatureCard`, `icon`, `title`, `description`, optional `iconBg` | Larger rounded surface used on the home page. |
| Status | `Badge`, `variant="primary\|success\|warning\|error\|neutral"`, `size` | Include text; check contrast. |
| Field | `Input` / `TextArea`, `label`, `error`, `hint`, native field props | Always provide a stable `id` or `name`. Error/hint text currently lacks automatic ARIA linkage. |
| Tabs | `Tabs`, `items: {id,label,content}[]`, `label` | Nonempty list, arrow/Home/End navigation; inactive panels stay in HTML. |
| Disclosure | `AccordionList`, `items: {question,answer,richAnswer?}[]` | Native details/summary. Use plain text unless the HTML source is trusted. |
| Dialog | `Modal`, `open`, `onClose`, `title`, `closeLabel`, `size="lg\|xl"` | Escape, outside click, focus trap, focus restoration, scroll lock. |
| Tooltip | `Tooltip`, `label`, `trigger="self\|child"`, `announce` | Use `child` for an already focusable link/button; avoid duplicate tab stops. |
| Code sample | `CodeBlock`, `code`, `language`, `showCopy`, `showLineNumbers` | Reuse instead of duplicating syntax/copy UI. |
| Breadcrumbs | `Breadcrumbs`, `items`, `label` | Shared by article and documentation layouts. |

### Cards: select by purpose

| Pattern | Use | Composition and behavior |
| --- | --- | --- |
| `Card` default | Settings summary, grouped facts, explanation | A short heading, supporting text and optional explicit action. Default padding 24px; compact 16px; spacious 32px. A div is not a click target. |
| `Card` interactive | Destination or next step | Include an actual link/button with visible focus. Hover styling alone never creates navigation. Avoid nesting actions inside a whole-card link. |
| `FeatureCard` | Product capability in a marketing grid | One decorative icon, short title, concise description. Built-in 32px padding, 16px corners and 56px icon container. Its visual hover is not an action. |
| `Card` gradient | Introduction or selected callout | Use subtle purple for brand emphasis. Keep ordinary content neutral; do not use a gradient on every card or imply a semantic state from hue alone. |

Keep one purpose per card. Align padding within a row; use 24px grid gaps and stack on small screens. Let long translations wrap instead of clipping or fixing content heights. Put the most important information before optional detail. Preserve shared family differences rather than forcing all cards into the same corner radius.

The media kit's `components/brand/BrandPatterns.tsx` provides live default, interactive, feature and gradient examples, composed from production components. Use these as a starting point and retain real link/button semantics.

### Forms, feedback and composition

- One primary action per decision. Use outline/secondary actions for supporting choices and text links for navigation. A disabled or pending action needs a clear label and a reason where the context does not explain it. Preserve context and prevent duplicate submission.
- Status badges state a fact, such as “Connected” or “No connection”. Use text plus color; do not imply certification. The live kit uses neutral badges to avoid copying the known saturated-text contrast issue.
- Keep labels above fields. Provide expected-format guidance before an error, specific recovery guidance after one, and native ARIA links between the field and help/error. The kit's examples are explicitly read-only demonstrations, not a submission form.
- Empty states explain what is absent and provide a relevant next step. Error states preserve entered data; loading states communicate progress without clearing the context.
- Disclosures hold optional details, never the only copy of essential instructions. Verify expanded and collapsed states and keyboard operation with `AccordionList`. Dialogs use the existing Modal focus/escape behavior.
- Check both themes, visible keyboard focus, hover, disabled and pending behavior. No essential action may depend on hover. Keep dense controls at 8px corners, standard cards at 12px, feature cards at 16px, and marketing sections within `max-w-6xl px-6`.

### Compose a marketing section

This example uses existing `home` keys and real component props. It is an example fragment within a server component, not a new translation namespace.

```tsx
import { getTranslations } from 'next-intl/server';
import { Section, SectionHeader, FeatureCard, LinkButton } from '@/components/ui';
import { KeyIcon } from '@/components/icons';

export async function IdentitySection() {
  const t = await getTranslations('home');
  return (
    <Section background="gray" padding="md">
      <SectionHeader title={t('identity.title')} description={t('identity.description')} />
      <FeatureCard
        icon={<span aria-hidden="true"><KeyIcon className="w-7 h-7 text-primary" /></span>}
        title={t('capabilities.identity.title')}
        description={t('capabilities.identity.description')}
      />
      <div className="mt-8"><LinkButton href="/download">{t('hero.downloadButton')}</LinkButton></div>
    </Section>
  );
}
```

`Section background="white"` currently adds no background class; it inherits its surrounding surface. For actual white, choose the appropriate wrapper/class intentionally rather than assuming the prop paints one. `Section background="dark"` sets a background but not contrasting text; supply readable text colors.

### Actions and links

```tsx
// Within a client component; onApprove, pending, actionLabel and siteUrl come from its props/state.
<Button type="button" onClick={onApprove} disabled={pending} aria-busy={pending}>
  {actionLabel}
</Button>
<LinkButton href="/docs" variant="outline">{docsLabel}</LinkButton>
<ExternalLinkButton href={siteUrl} variant="secondary">{visitLabel}</ExternalLinkButton>
```

The basic Button also supports `as="link"`, but the dedicated link components have additional variants. Do not copy their style maps. Button sizes mix utilities with unlayered `.btn` CSS; verify the computed padding and font size before depending on `sm`/`lg` visual differences.

### Custom icon control with the existing focus treatment

```tsx
import { focusRing, iconButton } from '@/components/ui';
import { CloseIcon } from '@/components/icons';

<button type="button" onClick={onClose} aria-label={closeLabel} className={`${iconButton} ${focusRing}`}>
  <span aria-hidden="true"><CloseIcon className="size-4" /></span>
</button>
```

### Form error linkage with the current Input API

`Input` accepts native ARIA props, but does not expose an ID for its internally rendered hint/error paragraph. For an explicitly linked message, render that message in the caller rather than displaying it twice.

```tsx
import { Input } from '@/components/ui';

<Input id="contact-email" name="email" type="email" label={emailLabel}
  required aria-invalid={Boolean(emailError)}
  aria-describedby={emailError ? 'contact-email-error' : undefined} />
{emailError && <p id="contact-email-error" role="alert" className="mt-1 text-sm text-red-700 dark:text-red-400">{emailError}</p>}
```

The darker error text here is a contrast-conscious treatment, not a new brand color. A future shared error-ID API should replace this caller wiring rather than spawning another Input component.

## Icons, illustrations and photography

Search `components/icons/index.ts` first. Existing families include UI, browser, social, feature, animated and pitch icons. Preserve recognizable third-party logos. Decorative icons belong in an `aria-hidden` wrapper; an icon-only control needs a localized accessible name.

The approved illustrated-page direction is **tactile indigo enamel objects, pale lavender backgrounds, fine orbit lines, restrained mint and coral accents**. Follow `docs/design/illustrated-page-images.md`, `illustration-manifest.json` and `illustration-prompts.json`. Keep generated art free of text and logos; compose localized text and original brand vectors through the website renderer.

- Reuse `lib/social-art.ts` route/guide mappings and aliases before adding another asset.
- Page assets are 1600×900 WebP; social-renderer assets use JPEG. Use `scripts/export-page-illustrations.mjs` for that workflow.
- Use `lib/social-image.tsx` and `lib/metadata-policy.ts` for previews. Do not bake English headlines into art shared across locales.
- Preserve actual product screenshots and explanatory diagrams. Illustration must not impersonate a current product screenshot.
- Existing vector art (`HeroAnimation`, `WotGraphIllustration`, `PqcIllustrations`, pitch illustrations) serves explanatory roles. It is not automatically inconsistent with the tactile page art.

## Theme, interaction and motion

Theme state belongs to `ThemeProvider` and `ThemeToggle`. Use `dark:` variants tied to the root class. Test manual light with a dark OS and manual dark with a light OS, not only matching system themes. Labs defaults to dark when no manual preference exists; preserve that behavior unless changing the Labs product itself.

Reuse `.card-interactive`, `.reveal-in`, `.animated-disclosure` and the existing Header behavior as appropriate. Essential information must remain available in server HTML and under reduced motion. `ScrollReveal` and `StaggerContainer` currently hide content with inline styles until an observer runs; their reduced-motion/no-JavaScript behavior is an audit item, not a pattern to expand onto critical content. `Tabs` documents why it uses `.reveal-in` instead.

Verify actual focus treatment, hover, active/selected, disabled, pending, empty, error and success states relevant to the control. Never rely only on color. A `Card` styled as interactive is still a div; use a real link or button for its action and avoid nested interactive elements.

## Localization, routes and content infrastructure

- Supported locales come from `i18n/config.ts`: en, es, pt, ru, it, fr, de. Use `getTranslations` on the server and `useTranslations` in client components.
- Internal navigation uses `Link` from `@/i18n/routing`. Static public files, such as this Markdown guide, use a normal `<a href="/brand-guidelines.md">`; do not prepend a locale to the asset.
- A new public page needs all seven message files/registrations where applicable and a sitemap entry. Reuse `withMetadataPolicy`, metadata helpers and `lib/sitemap-routes.mjs` instead of creating an independent SEO pattern.
- Use `ArticleLayout` for blog/guide reading layouts; reuse the current docs layout and `.docs-content` rhythm for documentation.
- Canonical public URLs default to `https://nostrwot.com` in `lib/metadata.ts`. Do not rename GitHub repositories, npm packages, email addresses or historical URLs just because they contain `nostr-wot`.
- Respect existing newsroom/newsletter rules and immutable sent archives. A branding cleanup is not permission to rewrite historical publications.

## Before handing off

- Compare the diff with the closest existing page and shared components; check for copied logos, style maps or translations.
- Verify each new example uses real exports/props and each referenced asset/path exists.
- Check layouts at narrow mobile and desktop widths, text expansion, both themes, keyboard focus, reduced motion and collapsed/expanded controls.
- For code changes, use the repo's current tests and typecheck/build as appropriate. `package.json` still contains `next lint`; check tooling support before claiming that script validates the site.
- Report observed limitations and owner decisions separately. Do not present scan counts as a visual audit or claim screenshots were checked when only source was inspected.
- Keep this file, the media kit and shared components aligned when a decision changes. Avoid duplicating this guide into another independently maintained document.
