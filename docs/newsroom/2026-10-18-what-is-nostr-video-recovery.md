# What Is Nostr? tutorial recovery evidence

Verified 18 October 2026. This is a published educational resource from the Nostr WoT team, not an announcement of new software functionality.

## Public publication

- [Official Nostr WoT channel](https://www.youtube.com/@nostr-wot/videos) lists video `eFoC8i0G4Fk`.
- [Published video](https://www.youtube.com/watch?v=eFoC8i0G4Fk) is public under the exact title “What Is Nostr? Keys, Relays and Clients Explained”.
- The public page identifies Nostr WoT as the publisher, dates the video 5 October 2026, and reports a duration of 4:38.
- The visible description and chapters cover open protocols, public and private keys, signatures, signed notes, relays, clients, switching apps with the same account and the limits of any one client or relay.
- [Companion guide](https://nostrwot.com/guides/what-is-nostr) exists in the repository in all seven supported locales under translation key `what-is-nostr`. The shared registry adds the verified English video to every localized edition.

## Deduplication and selection

- No `social/what-is-nostr.json` existed on main, and `data/social-posted.json` had no `what-is-nostr` receipt before this change.
- The latest ledger was read before selection. The 15 October site-permissions and what-is-a-nostr-event recoveries already have durable LinkedIn and Nostr receipts and must not be reposted.
- The channel also exposes Nostr Clients and Relays: How a Post Travels (`fx5km0YsXPg`) and Nostr WoT: One Identity, Wherever You Go (`O1rwlVWadqI`) outside the current registry. They remain separate recovery candidates and are not bundled into this publication.
- The backend and relay authentication tutorial already appears in a public Nostr WoT LinkedIn post, so it was not selected.
- Draft PR #67 is marked duplicate, remains a draft, and is not mergeable against current main. It overlaps account-setup guides, not this guide.

## Channel eligibility

The tutorial is substantive educational work produced and published by the Nostr WoT team. LinkedIn is eligible as `team-update`; Nostr is eligible under the normal guide policy. Copy describes the practical problem the lesson solves and makes no new-release claim.
