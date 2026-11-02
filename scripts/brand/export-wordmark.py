"""Generate fixed outlines: python export-wordmark.py /path/to/Inter[opsz,wght].ttf.
Source: google/fonts/ofl/inter, SIL OFL (included alongside the exported assets).
Requires fonttools. Run from repository root; font is a build input, not a runtime dependency.
"""
import re
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

font = instantiateVariableFont(TTFont(sys.argv[1]), {'wght': 600, 'opsz': 20})
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
scale = 20 / font['head'].unitsPerEm
x = 34
paths = []
for char in 'Nostr WoT':
    glyph = glyphs[cmap[ord(char)]]
    pen = SVGPathPen(glyphs, ntos=lambda v: str(round(v, 4)))
    glyph.draw(TransformPen(pen, (scale, 0, 0, -scale, x, 20)))
    if pen.getCommands():
        paths.append(pen.getCommands())
    x += glyph.width * scale
wordmark = ''.join(f'<path d="{p}"/>' for p in paths)
source = Path('components/icons/Logo.tsx').read_text()
mark = source[source.index('      <g stroke='):source.index('    </svg>')]
mark = mark.replace('strokeOpacity', 'stroke-opacity').replace('strokeWidth', 'stroke-width').replace('fillOpacity', 'fill-opacity')
width = round(x + 1, 3)
for mode, color, ink in [('light', '#6366F1', '#111827'), ('dark', '#A5B4FC', '#FFFFFF')]:
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="26" viewBox="0 0 {width} 26" role="img" aria-label="Nostr WoT"><g transform="scale(0.5416666667)" color="{color}">{mark}</g><g fill="{ink}">{wordmark}</g></svg>\n'
    Path(f'public/brand/nostr-wot/lockup-{mode}.svg').write_text(svg)
    Path(f'public/brand/nostr-wot/symbol-{mode}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" role="img" aria-label="Nostr WoT" color="{color}">{mark}</svg>\n')
Path('components/icons/BrandLockup.tsx').write_text(f'''/** Fixed Inter Semibold outlines; regenerate with scripts/brand/export-wordmark.py. */
export function BrandLockup({{ className = "h-[26px] w-auto", tone = "auto" }}: {{ className?: string; tone?: "auto" | "light" | "dark" }}) {{
  return <span className={{`inline-flex shrink-0 ${{className}}`}}>
    {{/* Public SVGs contain paths only, so no device font or font loading is involved. */}}
    {{tone !== "dark" && <img src="/brand/nostr-wot/lockup-light.svg" width={{{width}}} height={{26}} alt="Nostr WoT" className={{`h-full w-auto max-w-full ${{tone === "auto" ? "dark:hidden" : ""}}`}} />}}
    {{tone !== "light" && <img src="/brand/nostr-wot/lockup-dark.svg" width={{{width}}} height={{26}} alt="Nostr WoT" className={{`h-full w-auto max-w-full ${{tone === "auto" ? "hidden dark:block" : ""}}`}} />}}
  </span>;
}}
''')
