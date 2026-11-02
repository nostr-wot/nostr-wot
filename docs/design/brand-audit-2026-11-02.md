# Website brand consistency audit

Date: 2026-11-02. Baseline: `7521ca2` from `origin/main`. Scope: website source, shared components, English product/brand copy and the existing illustration workflow. This is a source audit, not a complete rendered accessibility audit or a verification of current extension/store releases.

## Summary

The site has a reusable foundation: named colors, system typography, shared controls, a shared article layout, seven locales and an approved illustration workflow. The main problems are conflicting product explanations, incomplete documentation of effective styles, duplicated definitions, and inconsistent semantics/accessibility in some examples. Several visual differences are intentional families rather than defects.

A scan of all 259 `.tsx`/`.css` files beneath `app/` and `components/` found:

| Signal | Occurrences | Files | Interpretation |
| --- | ---: | ---: | --- |
| Six-digit hex literals | 352 | 26 | Includes 123 in PitchIllustrations and 60 in Illustrations; not 352 defects. |
| Raw `<svg>` openings | 204 | 66 | Includes icon definitions and bespoke diagrams; review duplicates rather than banning SVG. |
| Raw `<button>` openings | 106 | 47 | Many are specialized controls; this is not a migration count. |
| Primary-token utility references | 444 | 110 | The shared palette already has broad adoption. |
| Purple/indigo/violet shade utilities | 148 | 24 | Includes purposeful feature/illustration colors as well as possible drift. |

Counts use regex occurrences, not distinct rendered elements. No subjective numerical design score is assigned.

## Findings and decisions

| ID | Priority | Evidence | Finding | Recommended correction / decision |
| --- | --- | --- | --- | --- |
| B01 | High | `messages/en/home.json` hero; `messages/en/about.json` hero; `messages/en/mediaKit.json` typography/integration notice; `public/llms.txt` SDK section | Home leads with identity/signer/wallet; About and much of the media kit describe a reputation/filtering system; agent-facing SDK prose is still narrow. | Apply the owner's signer/wallet, onboarding and interoperability direction consistently. Owner asked whether to migrate About/media kit now. |
| B02 | High | `messages/en/mediaKit.json` `logo.wotVerified`, `colors.distantRed.usage`; media-kit page's trust badges; `messages/en/about.json` `whyWorks.oneHop` | “WoT Verified”, “3+ hops, untrusted” and “High trust by definition” overstate what graph proximity establishes. | Replace with integration or social-distance descriptions after owner choice; preserve graph information. |
| B03 | Medium | `app/globals.css` initial theme/button rules and final `.btn-primary` rules; media-kit palette | The published palette says primary `#6366F1`, but actual CTA fills are `#4F46E5`, hover `#4338CA`. | Document brand/accent versus action colors; move action colors to named tokens in a subsequent implementation. Do not undo the darker buttons. Owner asked to confirm the distinction. |
| B04 | High | `components/ui/Badge.tsx`; `app/[locale]/media-kit/page.tsx` hop indicator | Media-kit chips use white small text on green/yellow/red fills. Calculated contrast against white is 2.28:1, 1.92:1 and 3.76:1 respectively, below 4.5:1 for normal text. Badge text on tinted backgrounds also needs per-state checks. | Keep the brand swatches but use accessible foreground/background pairs for UI. Verify rendered colors, dark mode and all badge variants before migration. |
| B05 | Medium | `components/icons/Logo.tsx`, media-kit's local `WotLogo`, `components/icons/SocialLogo.tsx`, `app/icon.svg`, raster icons | Logo geometry is maintained in several locations. Media kit repeats the UI mark; social/static copies may have renderer constraints. | Reuse LogoIcon on the media kit; establish documented export/parity checks for renderer-specific/static forms. Do not force client SVG components into server image renderers. Raster equivalence was not audited here. |
| B06 | Medium | `components/ui/Button.tsx`, `LinkButton.tsx`, `ExternalLinkButton.tsx`; unlayered `.btn` in `app/globals.css` | Three nearly identical style maps; white variants only on link components. Size utilities compete with unlayered padding/font-size declarations. | Extract shared class definitions while retaining action/internal/external semantics; inspect computed sm/md/lg styles before changing size behavior. |
| B07 | Medium | `components/ui/focus-ring.ts`, `Input.tsx`, `TextArea.tsx`, final `.btn:focus-visible` rule | Fields, general controls and buttons use different focus hues/geometries. Explicit theme fixes are appended after older OS media-query styles. | Document the existing families now. Consolidate into semantic focus/action tokens and one theme strategy without changing behavior accidentally. ThemeProvider already applies explicit root light/dark classes; the original theme mismatch has overrides. |
| B08 | High | `components/ui/ScrollReveal.tsx`, `app/globals.css` reduced-motion block, `components/ui/Tabs.tsx` comments | ScrollReveal/StaggerContainer emit inline hidden styles, but the reduced-motion visibility override targets classes those components do not automatically attach. Essential text depends on observer/hydration visibility. | Adopt visible-by-default entry motion for essential content, following Tabs' `.reveal-in` rationale. Test no-JavaScript and reduced-motion states. Source evidence is clear; rendered reproduction remains pending. |
| B09 | Medium | `components/ui/Input.tsx`, `TextArea.tsx` | Error/hint paragraphs have no IDs and are not automatically linked with `aria-describedby`; an omitted id/name also breaks the label association. | Add stable IDs and native ARIA linkage to shared fields, with focused behavior tests. The guide provides a caller-side wiring example meanwhile. |
| B10 | High | `messages/en/home.json` `identity.description`, `postQuantum.description`, `howItWorks.step3`; `public/llms.txt` post-quantum section | Copy promises every-client behavior and permanent confidentiality. These are broader than compatibility-bound functionality and experimental protocol claims. | Review exact capability wording against published implementations, then update all seven locales and agent-facing text. Do not copy these claims into new branded materials. |
| B11 | Low | `components/ui/Section.tsx` `bgStyles.white` | `background="white"` adds no background; the root page is gray-50. The prop name can mislead agents. | Document inheritance now. Later rename/add an explicit surface option with a call-site review rather than globally changing every section. |

## Differences to preserve unless a specific use is wrong

- `Card` uses rounded-xl/gray-800; `FeatureCard` uses rounded-2xl; `cardShell` uses rounded-2xl/gray-900 and explicitly documents the directory's established surface. Their roles differ.
- Marketing sections use max-w-6xl; the shared reading layout uses max-w-5xl with a sidebar. This is a content-width distinction.
- Tactile page art and explanatory vector diagrams coexist by design. `docs/design/illustrated-page-images.md` explicitly preserves diagrams and actual screenshots.
- Illustration hex values and third-party brand colors need not become UI theme tokens. Preserve original logos and necessary chart geometry.
- Labs has a distinct dark default when the user has not chosen a manual theme. This is implemented in ThemeProvider.

## Completed in this documentation change

- Added the canonical agent guide at `public/brand-guidelines.md`, available as `/brand-guidelines.md` after deployment.
- Added discovery from `AGENTS.md`, `public/llms.txt`, and a localized media-kit link in all seven languages.
- Documented real component APIs, styles, examples, current caveats and the illustration/metadata pipeline.
- Kept this audit separate from durable rules; no mass style migration or product-copy rewrite is included.

## Suggested implementation batches after decisions

1. Product story and terminology: B01, B02, B10; all seven locales and agent-facing descriptions. Verify product evidence before writing capability claims.
2. Shared UI consistency: B03, B04, B06, B07, B09, B11; contrast, explicit theme selection, sizes and keyboard checks.
3. Asset/motion cleanup: B05, B08; logo parity, reduced motion, content visibility and desktop/mobile screenshots.

## Reproduce the inventory

Run from the repository root. This intentionally measures source patterns rather than claiming a defect count.

```python
from pathlib import Path
import re

files = [p for root in ('app', 'components') for p in Path(root).rglob('*')
         if p.suffix in ('.tsx', '.css')]
patterns = {
    'hex': r'#[0-9A-Fa-f]{6}\b',
    'svg': r'<svg\b',
    'button': r'<button\b',
    'primary': r'\b(?:bg|text|border|ring)-primary\b',
    'purple_family': r'\b(?:bg|text|border|ring|from|to)-(?:violet|indigo|purple)-\d+',
}
print('Files:', len(files))
for label, pattern in patterns.items():
    counts = [len(re.findall(pattern, p.read_text())) for p in files]
    print(label, sum(counts), 'occurrences in', sum(n > 0 for n in counts), 'files')
```

Contrast calculations use sRGB relative luminance, `(Llighter + 0.05) / (Ldarker + 0.05)`. These are solid-color calculations, not measurements of every rendered state. `#6366F1` against white is 4.47:1; `#4F46E5` against white is 6.29:1, supporting the existing darker CTA treatment.

## Owner-approved corrections applied

The owner approved all three decisions: signer/wallet positioning with interoperability and easy onboarding; distinct brand indigo and darker action indigo; descriptive integration/distance labels instead of verification or distrust claims.

- B01: About now leads with four product capabilities and links to download/docs, before the retained Web of Trust explanation. Media-kit copy describes signer, access and payment integrations. All seven locales updated. Other surfaces, including the legacy SDK description in llms.txt, remain a separate copy review.
- B02: Media-kit verification badges now say Nostr WoT integration; distance examples show connections or no path found. About hop descriptions explain graph paths without certifying reliability. All seven locales updated.
- B03: The guide and media-kit palette distinguish brand #6366F1 from primary action #4F46E5 and hover #4338CA. Existing button styling is preserved; extracting further tokens remains optional follow-up work.
- B04 (media-kit examples only): Solid green/yellow/red chips use dark text; tinted green integration/distance labels use darker light-theme text and lighter dark-theme text. General shared Badge variants still need a broader audit.

Remaining findings are not silently marked fixed by these changes. Product metadata, existing screenshots, historical publications and unrelated feature copy have not been globally rewritten.

## Expanded kit and fixed wordmark

Owner requested light purple for the dark logo, a symbol-plus-name lockup with consistent lettering across devices, and practical component usage guidance. The media kit now uses the shared LogoIcon, removing its duplicated WotLogo geometry (part of B05). Header/footer use BrandLockup with path-only Inter Semibold SVG exports; dark assets use #A5B4FC. Added four live card patterns, action and status examples, linked field help/errors, spacing guidance and disclosures in all seven locales. The system font remains intentional for body text. Other logo renderers and remaining audit items retain their existing scope.
