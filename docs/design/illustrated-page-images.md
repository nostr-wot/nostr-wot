# Illustrated guide and page images

Extend the approved onboarding thumbnail style across all guide featured/preview images and the main page illustrations and sharing previews. The approved direction is tactile indigo enamel objects, pale lavender backgrounds, fine orbit lines, restrained mint and coral accents.

Illustrations contain no generated text or brand marks. Localized site titles and original vector logo are composed by the website. Preserve original SVG geometry and colors. Keep explanatory diagrams and actual screenshots, especially product UI and post-quantum derivation diagrams.

Scope: 26 guide topics, all existing translations, and 8 reusable main-page illustration themes. Existing main route previews use the same art selected from their canonical path. Dynamic user content uses a neutral fallback. No news/blog editorial article illustrations are replaced.

Original generated PNGs are local in out/illustration-originals. Public exports are 1600×900 WebP for page images and JPEG for the social-image renderer. Exact generation prompts are in illustration-prompts.json. Export script: scripts/export-page-illustrations.mjs. Generation uses the built-in image tool with the approved first video thumbnail as visual reference.

Validation: source-to-art inventory, localized guide mappings, original logo preservation, metadata tests, TypeScript, production build, and desktop/mobile visual checks with social card examples.
