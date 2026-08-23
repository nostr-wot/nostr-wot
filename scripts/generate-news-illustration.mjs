#!/usr/bin/env node
/**
 * Deterministically generates a per-article featured-image SVG for a news
 * post, so every article gets its own illustration instead of falling back
 * to public/images/news/default-featured.svg.
 *
 * Usage:
 *   node scripts/generate-news-illustration.mjs <slug>
 *   node scripts/generate-news-illustration.mjs --all
 *
 * Writes public/images/news/<slug>.svg.
 *
 * Determinism contract: every visual choice (palette, node-graph layout,
 * numeral rotation, headline wrap) is derived from an FNV-1a hash of the
 * slug fed into a seeded PRNG (mulberry32). No Math.random(), no Date, no
 * filesystem timestamps enter the output, so re-running this script for the
 * same slug must byte-for-byte reproduce the same file. That is what makes
 * it safe to run daily for newly published articles without churning
 * previously generated images, and what a `git status` check after a
 * re-run of --all is verifying.
 *
 * Two different slugs are not merely re-tinted: the palette, the node-graph
 * layout, the watermark rotation/position, and the wrapped headline text
 * all vary independently per slug, so cards stay visually distinguishable
 * at thumbnail size, not just in hue.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'news');
const EN_NEWS_DIR = path.join(ROOT, 'content', 'news', 'en');

const WIDTH = 1200;
const HEIGHT = 630;

// ---------------------------------------------------------------------------
// Deterministic hash + PRNG. No Math.random(), no Date — every bit of
// pseudo-randomness below traces back to fnv1a(slug).
// ---------------------------------------------------------------------------

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: small, fast, deterministic PRNG seeded by a 32-bit integer. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Palette family — all dark, all high-contrast against white overlay text,
// same visual family as public/images/news/default-featured.svg (which uses
// #0f172a -> #312e81 with #a5b4fc accent, first entry below). Dark
// backgrounds keep contrast solid whether the surrounding page is in light
// or dark mode, since the card art supplies its own background rather than
// depending on the page's.
// ---------------------------------------------------------------------------

const PALETTES = [
  { from: '#0f172a', to: '#312e81', accent: '#a5b4fc', node: '#818cf8' }, // indigo (default family)
  { from: '#0c1c2e', to: '#0e4a5c', accent: '#7dd3fc', node: '#38bdf8' }, // cyan
  { from: '#1a0f2e', to: '#5b1a6e', accent: '#e9a5f1', node: '#d946ef' }, // magenta
  { from: '#1c1206', to: '#5c3a0e', accent: '#fcd34d', node: '#f59e0b' }, // amber
  { from: '#05261c', to: '#0f5c3a', accent: '#6ee7b7', node: '#34d399' }, // emerald
  { from: '#1a0e1c', to: '#5c0e2e', accent: '#fda4af', node: '#fb7185' }, // rose
  { from: '#12102b', to: '#3b1e6e', accent: '#c4b5fd', node: '#a78bfa' }, // violet
  { from: '#0a1a1c', to: '#0e4a4a', accent: '#5eead4', node: '#2dd4bf' }, // teal
];

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Rough width estimate for bold system-ui text, in px, since we have no
 * real font metrics available to a static-asset generator. Wide enough
 * margin of error that wrapped lines never overflow the canvas.
 */
function estimateTextWidth(text, fontSize) {
  return text.length * fontSize * 0.58;
}

function wrapWords(words, fontSize, maxWidth, maxLines) {
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (estimateTextWidth(candidate, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) {
        // Last allowed line: dump the rest of the words onto it, even if
        // it runs long — better than silently truncating content.
        const rest = words.slice(words.indexOf(word)).join(' ');
        lines.push(rest);
        return lines;
      }
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function titleWordsFromSlug(slug) {
  return slug.split('-').map((w) => {
    if (/^\d+$/.test(w)) return w;
    if (w.toLowerCase() === 'nip') return 'NIP';
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
}

/** Deterministic node-graph texture: a small web of connected nodes. */
function buildNodeGraph(rng, palette) {
  const nodeCount = 6 + Math.floor(rng() * 4); // 6..9
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.round(60 + rng() * (WIDTH - 120)),
      y: Math.round(60 + rng() * (HEIGHT - 120)),
      r: 3 + Math.round(rng() * 5),
    });
  }
  const edges = [];
  for (let i = 0; i < nodeCount; i++) {
    edges.push([i, (i + 1) % nodeCount]);
    if (rng() > 0.5) {
      const skip = (i + 2 + Math.floor(rng() * (nodeCount - 3))) % nodeCount;
      edges.push([i, skip]);
    }
  }
  const lines = edges
    .map(([a, b]) => {
      const na = nodes[a];
      const nb = nodes[b];
      return `<line x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}" stroke="${palette.node}" stroke-width="1.5" opacity="0.16"/>`;
    })
    .join('\n    ');
  const circles = nodes
    .map((n) => `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${palette.node}" opacity="0.28"/>`)
    .join('\n    ');
  return `${lines}\n    ${circles}`;
}

/** Watermark: a big NIP number when the slug has one, else a merge-graph glyph. */
function buildWatermark(rng, palette, nipNumber) {
  const rotation = Math.round(rng() * 10 - 5); // -5..5 degrees
  const cx = 900 + Math.round(rng() * 140);
  const cy = 260 + Math.round(rng() * 140);
  if (nipNumber) {
    const fontSize = nipNumber.length > 2 ? 300 : 340;
    return `<g transform="rotate(${rotation} ${cx} ${cy})">
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="${fontSize}" font-weight="800" fill="${palette.accent}" opacity="0.16">${escapeXml(nipNumber)}</text>
    </g>`;
  }
  // Digest / non-NIP article: a stylised merge glyph (three nodes, two
  // converging curves) standing in for "multiple items merged together".
  const scale = 1.6 + rng() * 0.5;
  return `<g transform="translate(${cx} ${cy}) rotate(${rotation}) scale(${scale.toFixed(2)})" opacity="0.18">
      <circle cx="-70" cy="-60" r="14" fill="${palette.accent}"/>
      <circle cx="-70" cy="60" r="14" fill="${palette.accent}"/>
      <circle cx="50" cy="0" r="18" fill="${palette.accent}"/>
      <path d="M -70 -60 C 10 -60, 10 0, 50 0" stroke="${palette.accent}" stroke-width="10" fill="none"/>
      <path d="M -70 60 C 10 60, 10 0, 50 0" stroke="${palette.accent}" stroke-width="10" fill="none"/>
    </g>`;
}

export function generateSvg(slug) {
  const seed = fnv1a(slug);
  const rng = mulberry32(seed);

  const palette = PALETTES[seed % PALETTES.length];
  const nipMatch = slug.match(/nip-(\d+)/i);
  const nipNumber = nipMatch ? nipMatch[1] : null;

  const gradAngle = Math.round(rng() * 360);
  const gx2 = (0.5 + 0.5 * Math.cos((gradAngle * Math.PI) / 180)).toFixed(3);
  const gy2 = (0.5 + 0.5 * Math.sin((gradAngle * Math.PI) / 180)).toFixed(3);

  const nodeGraph = buildNodeGraph(rng, palette);
  const watermark = buildWatermark(rng, palette, nipNumber);

  const badgeLabel = nipNumber ? `NIP-${nipNumber}` : 'DIGEST';
  const badgeWidth = 40 + badgeLabel.length * 17;

  const headlineWords = titleWordsFromSlug(slug);
  const headlineFontSize = headlineWords.join(' ').length > 40 ? 46 : 54;
  const headlineLines = wrapWords(headlineWords, headlineFontSize, 980, 3);
  const lineHeight = Math.round(headlineFontSize * 1.18);
  const headlineStartY = HEIGHT - 96 - (headlineLines.length - 1) * lineHeight;
  const headlineText = headlineLines
    .map(
      (line, i) =>
        `<tspan x="80" y="${headlineStartY + i * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="${escapeXml(headlineWords.join(' '))}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${gx2}" y2="${gy2}">
      <stop offset="0%" stop-color="${palette.from}"/>
      <stop offset="100%" stop-color="${palette.to}"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <g>
    ${nodeGraph}
  </g>
  ${watermark}
  <text x="80" y="72" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="20" font-weight="700" fill="${palette.accent}" letter-spacing="4" opacity="0.85">NOSTR WOT NEWS</text>
  <rect x="80" y="96" width="${badgeWidth}" height="44" rx="22" fill="${palette.accent}"/>
  <text x="${80 + badgeWidth / 2}" y="124" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="22" font-weight="800" fill="${palette.from}" letter-spacing="1">${escapeXml(badgeLabel)}</text>
  <text font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="${headlineFontSize}" font-weight="700" fill="#ffffff">
      ${headlineText}
  </text>
</svg>
`;
}

function writeIllustration(slug) {
  const svg = generateSvg(slug);
  const outPath = path.join(OUT_DIR, `${slug}.svg`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(outPath, svg, 'utf8');
  return outPath;
}

function slugsFromEnNews() {
  return fs
    .readdirSync(EN_NEWS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.slice(0, -'.mdx'.length))
    .sort();
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--all')) {
    const slugs = slugsFromEnNews();
    for (const slug of slugs) {
      const outPath = writeIllustration(slug);
      console.log(`wrote ${path.relative(ROOT, outPath)}`);
    }
    return;
  }
  const slug = args[0];
  if (!slug) {
    console.error('Usage: node scripts/generate-news-illustration.mjs <slug>');
    console.error('       node scripts/generate-news-illustration.mjs --all');
    process.exit(1);
  }
  const outPath = writeIllustration(slug);
  console.log(`wrote ${path.relative(ROOT, outPath)}`);
}

main();
