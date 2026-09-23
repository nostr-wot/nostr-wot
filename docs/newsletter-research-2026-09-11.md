# Nostr weekly review: 11 September 2026

Status: drafted for review only. No email, social post, DM, subscriber lookup or sent-archive record was made.

## Window and deduplication

Coverage: [2026-09-04T08:07:05.572Z, 2026-09-11T08:07:05.572Z), displayed in Europe/Zurich. Friday 10:07 local wakeup. This is the first weekly issue: no prior newsletter manifest exists on current origin/master. Compare against the 8 September release baseline only as background, not as a previous issue. Existing unrelated .gitignore and website work were preserved in an isolated board worktree.

## Evidence and limits

- GitHub structured release metadata confirms extension 0.7.0 published 10 September at 22:29:29 UTC, non-draft and non-prerelease, with uploaded Chrome/Firefox ZIPs, source and checksums. Read CHANGELOG.md at v0.7.0, not local unreleased changes. The tag ref points to an annotated tag object; its SHA in the manifest is labeled accordingly, not claimed as a commit.
- Direct current Chrome Web Store HTML shows version 0.7.0 and Updated September 11, 2026. The search/browser fetch cache instead showed 0.1.2 from February and was rejected as stale. Store display date is retained without inventing an exact approval timestamp.
- Both Firefox Add-ons listing and official AMO API return 404. Store status is unknown. A GitHub ZIP does not establish Mozilla approval or successful installation. No installation was attempted. The tagged changelog requires desktop 140+ / Android 142+ and describes renewed consent. Existing standard keys remain unchanged, but no blanket no-breaking-changes guarantee is made.
- Discovered all 12 non-private packages from current public SDK tree ce8e4c1981fac1400d8a39877a366e4a095d0ed2 and compared against local candidate manifests. Checked official npm version records, all publication timestamps in the window, dist-tags, deprecation and integrity. None were published in-window. Each latest version and exact timestamp is retained in the manifest. No SDK feature is attributed to the extension release.
- NIP-A3 PR 2463 merged 9 September 18:29:36 UTC. Read the patch: bitcoincash/tron list additions and URI disambiguation for unknown payment types. Do not infer client adoption. NIP-01 PR 2460 is excluded because its 4 September 04:19 merge predates the window.
- relayer v2.2.19 published 8 September 04:35:28 UTC. Read structured compare files: FiltersCounter union path and legacy additive fallback. The release body is empty; changes are attributed to the diff. This is conditional on backend implementation, not a universal fix.
- Directory commit 979e9e7 adds both EN/ES JSON files on 8 September, establishing the six first index entries. No earlier issue exists. This issue links the directory but does not repeat unresearched founder biographies or label projects new launches. It does not modify directory data.
- Security coverage is the tagged extension hardening work. The public extension advisory endpoint returned an empty list; absence does not prove no vulnerabilities. No exploitation or victim count claimed. Older strfry coverage was checked and excluded: its release and article are outside the window. This is a selected review, not comprehensive monitoring.

## Review and validation

All seven editions carry equivalent claims, release versions, caveats and source links. Original source URLs are preserved across translations. The companion MDX remains published: false. The hand-authored SVG illustrates one seed branching into identities, without exposing keys; rendered PNG inspected locally. Captions remain drafts and explicitly require review and a live URL. No newsletter files are placed in the public /newsletters sent archive.

Structured retrieval records, publication times and content hashes are in the manifest. Public evidence snapshots used for review remain in /private/tmp/nostr-newsletter-evidence; no credentials were accessed.
