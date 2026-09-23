"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SimplePool, type Event } from "nostr-tools";
import type { NodeProfile } from "@/lib/graph/types";
import { selectProfileEvent, profileFromEvent, followingCountFromEvent } from "@/lib/graph/profile-events";

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://purplepag.es",
];
const FETCH_TIMEOUT = 5000;

interface UseProfileDataResult {
  profile: NodeProfile | null;
  followingCount: number | null;
  isLoadingProfile: boolean;
  isLoadingFollowing: boolean;
  fetchProfile: (pubkey: string) => void;
  reset: () => void;
}

/** Fetch verified profile and following events progressively across relays. */
export function useProfileData(): UseProfileDataResult {
  const [profile, setProfile] = useState<NodeProfile | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const poolRef = useRef<SimplePool | null>(null);
  const generationRef = useRef(0);
  const cancelRef = useRef<(() => void) | null>(null);

  const cancelFetch = useCallback(() => {
    generationRef.current++;
    cancelRef.current?.();
    cancelRef.current = null;
  }, []);

  const fetchProfile = useCallback((pubkey: string) => {
    cancelFetch();
    setProfile(null);
    setFollowingCount(null);
    const validPubkey = /^[0-9a-f]{64}$/.test(pubkey);
    setIsLoadingProfile(validPubkey);
    setIsLoadingFollowing(validPubkey);
    if (!validPubkey) return;

    const generation = generationRef.current;
    const pool = poolRef.current ?? (poolRef.current = new SimplePool());
    const abort = new AbortController();
    let subscription: { close: () => void } | undefined;
    let newestProfile: Event | null = null;
    let newestFollows: Event | null = null;
    let finished = false;
    const isCurrent = () => !finished && generationRef.current === generation;

    const cleanup = () => {
      finished = true;
      clearTimeout(timeout);
      abort.abort();
      subscription?.close();
    };
    const finish = () => {
      if (!isCurrent()) return;
      cleanup();
      cancelRef.current = null;
      setIsLoadingProfile(false);
      setIsLoadingFollowing(false);
    };
    // Always retain the deadline until every relay completes, even after data arrives.
    const timeout = setTimeout(finish, FETCH_TIMEOUT);
    cancelRef.current = cleanup;

    try {
      subscription = pool.subscribeMany(RELAYS, { authors: [pubkey], kinds: [0, 3] }, {
        maxWait: FETCH_TIMEOUT,
        abort: abort.signal,
        onevent(event) {
          if (!isCurrent()) return;
          if (event.kind === 0) {
            const selected = selectProfileEvent(newestProfile, event, pubkey, 0);
            if (selected !== newestProfile && selected) {
              newestProfile = selected;
              setProfile(profileFromEvent(selected));
              setIsLoadingProfile(false);
            }
          } else if (event.kind === 3) {
            const selected = selectProfileEvent(newestFollows, event, pubkey, 3);
            if (selected !== newestFollows && selected) {
              newestFollows = selected;
              setFollowingCount(followingCountFromEvent(selected));
              setIsLoadingFollowing(false);
            }
          }
        },
        oneose: finish,
        onclose: finish,
      });
      if (finished) subscription.close();
    } catch {
      finish();
    }
  }, [cancelFetch]);

  const reset = useCallback(() => {
    cancelFetch();
    setProfile(null);
    setFollowingCount(null);
    setIsLoadingProfile(false);
    setIsLoadingFollowing(false);
  }, [cancelFetch]);

  useEffect(() => () => {
    cancelFetch();
    poolRef.current?.destroy();
    poolRef.current = null;
  }, [cancelFetch]);

  return { profile, followingCount, isLoadingProfile, isLoadingFollowing, fetchProfile, reset };
}
