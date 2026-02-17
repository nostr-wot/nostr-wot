"use client";

import { useState, useCallback, useRef } from "react";
import { useWoTContext } from "nostr-wot-sdk/react";
import { NodeProfile, NostrNote } from "@/lib/graph/types";
import {
  getCachedProfile,
  getCachedProfiles,
  cacheProfile,
  cacheProfiles,
  getPubkeysToFetch,
} from "@/lib/cache/profileCache";

// Relays for profile and notes fetching (follows come from SDK)
const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
];

const RELAY_TIMEOUT = 5000;

interface UseUserProfileResult {
  profile: NodeProfile | null;
  follows: string[];
  followProfiles: Map<string, NodeProfile>;
  notes: NostrNote[];
  isLoading: boolean;
  isLoadingNotes: boolean;
  error: string | null;
  fetchUserData: (pubkey: string) => Promise<void>;
  fetchMoreNotes: () => Promise<void>;
  hasMoreNotes: boolean;
}

/**
 * Hook to fetch complete user data
 * Uses SDK for follows, relays for profile and notes
 */
export function useUserProfile(): UseUserProfileResult {
  const { wot } = useWoTContext();

  const [profile, setProfile] = useState<NodeProfile | null>(null);
  const [follows, setFollows] = useState<string[]>([]);
  const [followProfiles, setFollowProfiles] = useState<Map<string, NodeProfile>>(
    new Map()
  );
  const [notes, setNotes] = useState<NostrNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreNotes, setHasMoreNotes] = useState(true);

  const currentPubkeyRef = useRef<string | null>(null);
  const oldestNoteTimestampRef = useRef<number | null>(null);
  const wotRef = useRef(wot);
  wotRef.current = wot;

  /**
   * Fetch profile (kind 0) - checks cache first
   */
  const fetchProfile = useCallback(
    async (pubkey: string): Promise<NodeProfile | null> => {
      // Check cache first
      const cached = getCachedProfile(pubkey);
      if (cached) {
        return cached;
      }

      return new Promise((resolve) => {
        let profile: NodeProfile | null = null;
        let resolved = false;
        let completedRelays = 0;

        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            if (profile) cacheProfile(profile);
            resolve(profile);
          }
        }, RELAY_TIMEOUT);

        for (const relayUrl of RELAYS.slice(0, 2)) {
          try {
            const ws = new WebSocket(relayUrl);
            const subId = `profile-${Date.now()}-${Math.random()}`;

            ws.onopen = () => {
              ws.send(
                JSON.stringify([
                  "REQ",
                  subId,
                  { kinds: [0], authors: [pubkey], limit: 1 },
                ])
              );
            };

            ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data[0] === "EVENT" && data[2]?.kind === 0) {
                  const content = JSON.parse(data[2].content);
                  profile = {
                    pubkey,
                    name: content.name,
                    displayName: content.display_name,
                    picture: content.picture,
                    about: content.about,
                    nip05: content.nip05,
                  };
                } else if (data[0] === "EOSE") {
                  ws.close();
                }
              } catch {
                // Ignore parse errors
              }
            };

            ws.onerror = () => {
              completedRelays++;
              if (completedRelays >= 2 && !resolved) {
                clearTimeout(timeoutId);
                resolved = true;
                if (profile) cacheProfile(profile);
                resolve(profile);
              }
            };

            ws.onclose = () => {
              completedRelays++;
              if (completedRelays >= 2 && !resolved) {
                clearTimeout(timeoutId);
                resolved = true;
                if (profile) cacheProfile(profile);
                resolve(profile);
              }
            };
          } catch {
            completedRelays++;
          }
        }
      });
    },
    []
  );

  /**
   * Fetch follows from relays (fallback when SDK not available)
   */
  const fetchFollowsFromRelays = useCallback(async (pubkey: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const follows = new Set<string>();
      let resolved = false;
      let completedRelays = 0;

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(Array.from(follows));
        }
      }, RELAY_TIMEOUT);

      for (const relayUrl of RELAYS) {
        try {
          const ws = new WebSocket(relayUrl);
          const subId = `follows-${Date.now()}-${Math.random()}`;

          ws.onopen = () => {
            ws.send(
              JSON.stringify([
                "REQ",
                subId,
                { kinds: [3], authors: [pubkey], limit: 1 },
              ])
            );
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data[0] === "EVENT" && data[2]?.kind === 3) {
                const tags = data[2].tags || [];
                for (const tag of tags) {
                  if (tag[0] === "p" && tag[1]) {
                    follows.add(tag[1]);
                  }
                }
              } else if (data[0] === "EOSE") {
                ws.close();
              }
            } catch {
              // Ignore
            }
          };

          ws.onerror = () => {
            completedRelays++;
            if (completedRelays >= RELAYS.length && !resolved) {
              clearTimeout(timeoutId);
              resolved = true;
              resolve(Array.from(follows));
            }
          };

          ws.onclose = () => {
            completedRelays++;
            if (completedRelays >= RELAYS.length && !resolved) {
              clearTimeout(timeoutId);
              resolved = true;
              resolve(Array.from(follows));
            }
          };
        } catch {
          completedRelays++;
        }
      }
    });
  }, []);

  /**
   * Fetch follows - tries SDK first, falls back to relays
   */
  const fetchFollows = useCallback(async (pubkey: string): Promise<string[]> => {
    // Capture WoT instance to avoid race conditions
    const wotInstance = wotRef.current;

    // Try SDK first if available
    if (wotInstance) {
      try {
        console.log("[useUserProfile] Fetching follows via SDK...");
        const follows = await wotInstance.getFollows(pubkey);
        if (follows && follows.length > 0) {
          console.log("[useUserProfile] Got", follows.length, "follows from SDK");
          return follows;
        }
      } catch (err) {
        console.warn("[useUserProfile] SDK getFollows failed, falling back to relays:", err);
      }
    } else {
      console.log("[useUserProfile] SDK not ready, fetching follows from relays...");
    }

    // Fall back to relay fetching
    const follows = await fetchFollowsFromRelays(pubkey);
    console.log("[useUserProfile] Got", follows.length, "follows from relays");
    return follows;
  }, [fetchFollowsFromRelays]);

  /**
   * Fetch all user data - streams progressively as data arrives
   */
  const fetchUserData = useCallback(
    async (pubkey: string) => {
      // Reset state
      setIsLoading(true);
      setError(null);
      setProfile(null);
      setFollows([]);
      setFollowProfiles(new Map());
      setNotes([]);
      setHasMoreNotes(true);
      currentPubkeyRef.current = pubkey;
      oldestNoteTimestampRef.current = null;

      // Track completion for loading state
      let profileDone = false;
      let followsDone = false;
      let notesDone = false;

      const checkAllDone = () => {
        if (profileDone && followsDone && notesDone) {
          setIsLoading(false);
        }
      };

      // Fetch profile - show immediately when received
      fetchProfile(pubkey).then((fetchedProfile) => {
        profileDone = true;
        setProfile(
          fetchedProfile || {
            pubkey,
            name: undefined,
            displayName: undefined,
            picture: undefined,
            about: undefined,
            nip05: undefined,
          }
        );
        checkAllDone();
      });

      // Fetch follows - show immediately and start loading profiles
      fetchFollows(pubkey).then((fetchedFollows) => {
        followsDone = true;
        setFollows(fetchedFollows);
        checkAllDone();

        // Start streaming follow profiles (don't wait)
        if (fetchedFollows.length > 0) {
          streamFollowProfiles(fetchedFollows.slice(0, 100));
        }
      });

      // Fetch notes - stream as they arrive
      fetchNotesStreaming(pubkey);
      // Mark notes as done after timeout (streaming continues)
      setTimeout(() => {
        notesDone = true;
        checkAllDone();
      }, RELAY_TIMEOUT);
    },
    [fetchProfile, fetchFollows]
  );

  /**
   * Stream notes as they arrive from relays
   */
  const fetchNotesStreaming = useCallback((pubkey: string, until?: number) => {
    const notesBuffer: NostrNote[] = [];
    const seenIds = new Set<string>();
    let completedRelays = 0;

    for (const relayUrl of RELAYS) {
      try {
        const ws = new WebSocket(relayUrl);
        const subId = `notes-${Date.now()}-${Math.random()}`;

        ws.onopen = () => {
          const filter: Record<string, unknown> = {
            kinds: [1],
            authors: [pubkey],
            limit: 20,
          };
          if (until) filter.until = until;
          ws.send(JSON.stringify(["REQ", subId, filter]));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data[0] === "EVENT" && data[2]?.kind === 1) {
              const note: NostrNote = {
                id: data[2].id,
                pubkey: data[2].pubkey,
                content: data[2].content,
                created_at: data[2].created_at,
                tags: data[2].tags || [],
                kind: 1,
                sig: data[2].sig,
              };

              if (!seenIds.has(note.id)) {
                seenIds.add(note.id);
                notesBuffer.push(note);

                // Update UI with sorted notes
                const sorted = [...notesBuffer].sort(
                  (a, b) => b.created_at - a.created_at
                );
                setNotes(sorted);

                // Update oldest timestamp
                if (sorted.length > 0) {
                  oldestNoteTimestampRef.current =
                    sorted[sorted.length - 1].created_at;
                }
              }
            } else if (data[0] === "EOSE") {
              ws.close();
            }
          } catch {
            // Ignore
          }
        };

        ws.onerror = () => {
          completedRelays++;
          if (completedRelays >= RELAYS.length) {
            setHasMoreNotes(notesBuffer.length >= 20);
          }
        };

        ws.onclose = () => {
          completedRelays++;
          if (completedRelays >= RELAYS.length) {
            setHasMoreNotes(notesBuffer.length >= 20);
          }
        };
      } catch {
        completedRelays++;
      }
    }
  }, []);

  /**
   * Stream follow profiles progressively - uses cache
   */
  const streamFollowProfiles = useCallback((pubkeys: string[]) => {
    // First, load cached profiles immediately
    const cachedProfiles = getCachedProfiles(pubkeys);
    if (cachedProfiles.size > 0) {
      setFollowProfiles(new Map(cachedProfiles));
    }

    // Filter to only uncached pubkeys
    const pubkeysToFetch = getPubkeysToFetch(pubkeys);
    if (pubkeysToFetch.length === 0) {
      return; // All profiles are cached
    }

    const profiles = new Map(cachedProfiles);
    const newProfiles: NodeProfile[] = [];
    let completedRelays = 0;

    // Batch in chunks of 50
    const chunks: string[][] = [];
    for (let i = 0; i < pubkeysToFetch.length; i += 50) {
      chunks.push(pubkeysToFetch.slice(i, i + 50));
    }

    for (const relayUrl of RELAYS.slice(0, 2)) {
      try {
        const ws = new WebSocket(relayUrl);

        ws.onopen = () => {
          for (let i = 0; i < chunks.length; i++) {
            const subId = `profiles-${Date.now()}-${i}`;
            ws.send(
              JSON.stringify([
                "REQ",
                subId,
                { kinds: [0], authors: chunks[i], limit: chunks[i].length },
              ])
            );
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data[0] === "EVENT" && data[2]?.kind === 0) {
              const pubkey = data[2].pubkey;
              const content = JSON.parse(data[2].content);
              const profile: NodeProfile = {
                pubkey,
                name: content.name,
                displayName: content.display_name,
                picture: content.picture,
                about: content.about,
                nip05: content.nip05,
              };

              profiles.set(pubkey, profile);
              newProfiles.push(profile);

              // Update UI progressively
              setFollowProfiles(new Map(profiles));
            }
          } catch {
            // Ignore
          }
        };

        ws.onerror = () => {
          completedRelays++;
          if (completedRelays >= 2 && newProfiles.length > 0) {
            cacheProfiles(newProfiles);
          }
        };

        ws.onclose = () => {
          completedRelays++;
          if (completedRelays >= 2 && newProfiles.length > 0) {
            cacheProfiles(newProfiles);
          }
        };

        setTimeout(() => ws.close(), RELAY_TIMEOUT - 1000);
      } catch {
        completedRelays++;
      }
    }
  }, []);

  /**
   * Load more notes - streams progressively
   */
  const fetchMoreNotes = useCallback(async () => {
    if (
      !currentPubkeyRef.current ||
      !oldestNoteTimestampRef.current ||
      isLoadingNotes ||
      !hasMoreNotes
    ) {
      return;
    }

    setIsLoadingNotes(true);

    const pubkey = currentPubkeyRef.current;
    const until = oldestNoteTimestampRef.current - 1;
    const existingIds = new Set(notes.map((n) => n.id));
    const newNotesBuffer: NostrNote[] = [];
    let completedRelays = 0;

    for (const relayUrl of RELAYS) {
      try {
        const ws = new WebSocket(relayUrl);
        const subId = `more-notes-${Date.now()}-${Math.random()}`;

        ws.onopen = () => {
          ws.send(
            JSON.stringify([
              "REQ",
              subId,
              { kinds: [1], authors: [pubkey], limit: 20, until },
            ])
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data[0] === "EVENT" && data[2]?.kind === 1) {
              const note: NostrNote = {
                id: data[2].id,
                pubkey: data[2].pubkey,
                content: data[2].content,
                created_at: data[2].created_at,
                tags: data[2].tags || [],
                kind: 1,
                sig: data[2].sig,
              };

              if (!existingIds.has(note.id) && !newNotesBuffer.some(n => n.id === note.id)) {
                existingIds.add(note.id);
                newNotesBuffer.push(note);

                // Update UI progressively
                setNotes((prev) => {
                  const combined = [...prev, ...newNotesBuffer];
                  return combined.sort((a, b) => b.created_at - a.created_at);
                });

                // Update oldest timestamp
                const sorted = [...newNotesBuffer].sort((a, b) => b.created_at - a.created_at);
                if (sorted.length > 0) {
                  oldestNoteTimestampRef.current = sorted[sorted.length - 1].created_at;
                }
              }
            } else if (data[0] === "EOSE") {
              ws.close();
            }
          } catch {
            // Ignore
          }
        };

        ws.onerror = () => {
          completedRelays++;
          if (completedRelays >= RELAYS.length) {
            setIsLoadingNotes(false);
            setHasMoreNotes(newNotesBuffer.length >= 20);
          }
        };

        ws.onclose = () => {
          completedRelays++;
          if (completedRelays >= RELAYS.length) {
            setIsLoadingNotes(false);
            setHasMoreNotes(newNotesBuffer.length >= 20);
          }
        };
      } catch {
        completedRelays++;
      }
    }
  }, [notes, isLoadingNotes, hasMoreNotes]);

  return {
    profile,
    follows,
    followProfiles,
    notes,
    isLoading,
    isLoadingNotes,
    error,
    fetchUserData,
    fetchMoreNotes,
    hasMoreNotes,
  };
}
