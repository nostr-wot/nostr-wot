# Nostr ecosystem watch: 2026-09-22

Evidence window: 2026-09-08 08:00 UTC through 2026-09-22 08:00 UTC, matching 10:00 Europe/Zurich boundaries.

## Selected story

Amber v6.6.5 was published on September 21 with downloadable APKs, per-asset SHA-256 digests and signed checksum manifests. The release moves kind 30078 backup encryption to a dedicated key derived through HKDF outside the NIP-44 derive-key namespace. Its notes say remembered `nip44_decrypt` permissions can no longer decrypt backups containing per-app NIP-46 secrets and local keys. Version 6.6.4, published September 14, separately fixed a startup race in which network activity could reach relays over clearnet before the Tor setting finished loading.

Classification: security hardening and privacy fix. The reviewed releases do not report exploitation or an affected-user count.

## Directory maintenance

- Amber: advance latest verified release to v6.6.5 and record the two security-relevant releases.
- Amethyst: advance latest verified release to v1.16.0 and record the release as an active maintenance signal. The article does not combine it with Amber because that would dilute the security boundary being explained.
- No new project was added.

## Pending work preserved

Nostr WoT PR #9 remains open. Its Gittr adoption entry depends on corrections in upstream Gittr PR #46, which is still unmerged. Gittr is therefore not described as a completed integration, new launch or verified directory addition.

## Limits

The release metadata establishes published artifacts and hashes. The described runtime behavior was not independently reproduced, store rollout was not used as proof of installation, and no exploitation claim is made.
