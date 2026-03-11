# Scroll-Reveal Article Sections

**Date**: 2026-03-11
**Status**: Approved

## Problem

Blog and guide articles wrap the entire article body in a single `ScrollReveal`, so when entering the page, the content area is invisible until the user scrolls to it. The hero section also waits for scroll, even though it's above the fold.

## Design

### Behavior

1. **Hero section** (title, tags, excerpt, author, date, featured image): Stagger-animates immediately on page load without waiting for scroll.
2. **First content section** (everything before the first h2/h3 heading): Visible immediately, no animation.
3. **Subsequent content sections** (each h2 or h3 heading + content until the next heading): Scroll-reveals with staggered fade-up animation (heading first, then body content with +100ms delay).

### Content Splitting

A utility function `splitContentBySections(content: string)` splits the raw markdown string:

- Scans line by line
- Tracks fenced code block state (``` or ~~~) to avoid splitting on headings inside code blocks
- Splits on lines matching `^## ` or `^### `
- Returns `string[]` where the first element is intro content (before first heading) and each subsequent element starts with its heading line

### Component Changes

**`ScrollReveal.tsx`** — Add `immediate?: boolean` prop:
- When `true`, sets `isVisible = true` on mount (after a requestAnimationFrame to ensure CSS transition triggers)
- Skips IntersectionObserver entirely
- Same animation styles and timing apply

**`BlogContent.tsx`** — Split and render sections:
- Accepts `firstSectionImmediate?: boolean` prop (default `true`)
- Calls `splitContentBySections(content)` to get sections array
- First section: rendered without `ScrollReveal` wrapper
- Subsequent sections: each wrapped in a container with two `ScrollReveal`s:
  - Heading line rendered in `ScrollReveal` with `animation="fade-up"`
  - Body content rendered in `ScrollReveal` with `animation="fade-up"` and `delay={100}`
- Each section rendered as its own `<MDXRemote>` call

**`blog/[slug]/page.tsx`** — Hero changes:
- All hero `ScrollReveal` wrappers get `immediate` prop added
- The `ScrollReveal` wrapper around `<BlogContent>` is removed (BlogContent handles its own reveals now)

**`guides/[slug]/page.tsx`** — Same changes as blog page.

### Files Modified

| File | Change |
|------|--------|
| `components/ui/ScrollReveal.tsx` | Add `immediate` prop |
| `components/blog/BlogContent.tsx` | Split content, per-section scroll-reveal |
| `app/[locale]/blog/[slug]/page.tsx` | `immediate` on hero, remove content wrapper |
| `app/[locale]/guides/[slug]/page.tsx` | Same as blog page |

### Edge Cases

- **No headings in content**: Entire content renders as the first (immediate) section
- **Heading inside code block**: Code block tracking prevents false splits
- **Empty sections**: Skipped (no empty wrappers rendered)
- **Content before any heading**: Rendered as first section (immediate)

### Not in Scope

- Changing animation types or durations
- Modifying sidebar behavior
- Changing related posts / newsletter section animations
- Changes to markdown content files
