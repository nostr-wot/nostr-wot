# SDK documentation topic structure

The approved SDK consolidation defines eight responsibility groups. Use those groups as package pages, with focused integration workflows below each package. Keep technical API references linked from each workflow. Reuse existing localized explanations and examples, shared navigation, code blocks, metadata helpers and sitemap infrastructure.

The implementation registry is `lib/sdk-docs.mjs`. It defines package/version metadata, topic URLs, translation keys and the eleven compatibility mappings. The page renderer uses that registry for headings, breadcrumbs and related links. The sitemap includes every package and topic page in all seven locales. Physical route wrappers preserve existing git-based modification tracking.

The `/docs/sdk` page is the package chooser and migration table. Existing hash anchors remain as accessible links to their dedicated pages. Sidebar search covers all topics while ordinary navigation shows subtopics for the current package. Existing extension, Oracle and proxy pages remain intact.

Further function-level documentation, particularly account derivation, permission policies and individual relay/data operations, should grow from the detailed SDK README contracts. Do not claim that this initial split exhausts every function. Each additional topic requires meaningful examples, runtime requirements, errors and cleanup guidance, plus translations, metadata and sitemap coverage.
