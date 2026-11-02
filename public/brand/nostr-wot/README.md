# Nostr WoT brand vectors

`lockup-light.svg` and `lockup-dark.svg` contain the existing connected-node symbol and the Nostr WoT wordmark as fixed paths. `symbol-light.svg` and `symbol-dark.svg` contain the standalone symbol. SVG exports require no installed or downloaded font.

The wordmark is Inter Semibold (weight 600, optical size 20). Source: https://github.com/google/fonts/tree/main/ofl/inter. The SIL Open Font License and copyright notice are in `Inter-OFL.txt`. Keep that notice with copies of the assets. The original Apple system font is not bundled or exported.

Regenerate from the repository root with `python scripts/brand/export-wordmark.py /path/to/Inter[opsz,wght].ttf` using fonttools. The generator reads the canonical symbol from `components/icons/Logo.tsx` and writes the four SVGs plus `components/icons/BrandLockup.tsx`.

Source font SHA-256: `29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031`.
