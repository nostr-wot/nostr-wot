"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useWoTContext } from "nostr-wot-sdk/react";
import { formatPubkey, npubToHex } from "@/lib/graph/transformers";
import NoteCard from "@/components/playground/profile/NoteCard";
import { Button } from "@/components/ui";
import {
  TrustData,
  getCachedTrust,
  getCachedTrustBatch,
  cacheTrust,
  cacheTrustBatch,
} from "@/lib/cache/profileCache";
import type { ServerProfileMetadata } from "@/lib/server/fetchNostrMetadata";
import {
  useProfile,
  useFollows,
  useAuthorNotes,
  useEngagementBatch,
  useNote,
} from "nostr-wot-sdk/react";
import { _profileStore } from "nostr-wot-sdk/data/cache";
import { fetchReplyParents, type ParentRef } from "@/lib/client/noteEnrichments";

interface TrustInfo extends TrustData {
  isLoading?: boolean;
}

interface ProfilePageContentProps {
  pubkey: string;
  initialProfile?: ServerProfileMetadata | null;
}

export default function ProfilePageContent({
  pubkey: pubkeyParam,
  initialProfile,
}: ProfilePageContentProps) {
  // Normalize pubkey: convert npub to hex if needed
  const pubkey = useMemo(() => npubToHex(pubkeyParam), [pubkeyParam]);

  const t = useTranslations("profile");
  const router = useRouter();
  const { wot, isReady: isWotReady } = useWoTContext();

  // SWR-style cached fetches (profile, follows, paged notes) — populate
  // from localStorage if present, then refresh in the background as relays
  // respond. Components subscribe via useSyncExternalStore so each piece
  // updates independently as data arrives.
  const profileEntry = useProfile(pubkey);
  const followsEntry = useFollows(pubkey);
  const { entry: notesEntry, loadMore: loadMoreNotes, isLoading: isLoadingNotes } =
    useAuthorNotes(pubkey);

  const profile = useMemo(
    () =>
      profileEntry
        ? {
            pubkey: profileEntry.pubkey,
            name: profileEntry.name ?? undefined,
            displayName: profileEntry.displayName ?? undefined,
            picture: profileEntry.picture ?? undefined,
            about: profileEntry.about ?? undefined,
            nip05: profileEntry.nip05 ?? undefined,
          }
        : null,
    [profileEntry],
  );
  const follows = useMemo(() => followsEntry?.follows ?? [], [followsEntry]);
  const noteIds = useMemo(() => notesEntry?.noteIds ?? [], [notesEntry]);
  const isLoading = !profile && !profileEntry;
  const error: string | null = null;
  const hasMoreNotes = noteIds.length > 0;
  const fetchMoreNotes = loadMoreNotes;
  const fetchUserData = (_pk: string) => Promise.resolve();
  // Kick batch engagement (reactions/reposts/zaps) for visible note ids
  useEngagementBatch(noteIds);

  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Trust data from WoT extension (SDK now provides scores directly)
  const [profileTrust, setProfileTrust] = useState<TrustInfo | null>(null);
  const [isLoadingTrust, setIsLoadingTrust] = useState(false);
  const [followersTrust, setFollowersTrust] = useState<Map<string, TrustInfo>>(new Map());
  const [reactionsByNote, setReactionsByNote] = useState<Record<string, number>>({});
  const [parentByNote, setParentByNote] = useState<Record<string, ParentRef>>({});
  const noteSentinelRef = useRef<HTMLDivElement | null>(null);
  const enrichedIdsRef = useRef<Set<string>>(new Set());

  // Pagination state for followers
  const PAGE_SIZE = 20;
  const [visibleFollowersCount, setVisibleFollowersCount] = useState(PAGE_SIZE);
  const [isLoadingMoreFollowers, setIsLoadingMoreFollowers] = useState(false);

  const wotRef = useRef(wot);
  wotRef.current = wot;

  // Fetch trust data for profile when WoT is ready
  useEffect(() => {
    const fetchProfileTrust = async () => {
      if (!wotRef.current || !pubkey) return;

      // Check cache first - getCachedTrust returns null if cache is invalid/old format
      const cached = getCachedTrust(pubkey);
      if (cached) {
        setProfileTrust(cached);
        return;
      }

      setIsLoadingTrust(true);
      try {
        // Use getDistanceBatch with includePaths and includeScores
        const results = await wotRef.current.getDistanceBatch([pubkey], { includePaths: true, includeScores: true });
        console.log("[ProfilePageContent] SDK getDistanceBatch response for profile:", JSON.stringify(results, null, 2));
        const result = results[pubkey];

        // Expecting { hops, paths, score } | null from SDK
        const trustData: TrustData = result !== null && result !== undefined
          ? {
              distance: (result as { hops: number; paths: number; score: number }).hops,
              paths: (result as { hops: number; paths: number; score: number }).paths,
              score: (result as { hops: number; paths: number; score: number }).score,
            }
          : {
              distance: null,
              paths: null,
              score: null,
            };

        // Cache the result
        cacheTrust(pubkey, trustData);
        setProfileTrust(trustData);
      } catch (err) {
        console.warn("[ProfilePageContent] Failed to get trust:", err);
      } finally {
        setIsLoadingTrust(false);
      }
    };

    if (isWotReady && pubkey) {
      fetchProfileTrust();
    }
  }, [isWotReady, pubkey]);

  // Fetch trust data for a batch of followers
  const fetchFollowersTrustBatch = useCallback(async (pubkeys: string[]) => {
    if (!wotRef.current || pubkeys.length === 0) return;

    // Get cached data first
    const cachedTrust = getCachedTrustBatch(pubkeys);
    const pubkeysNeedingFetch = pubkeys.filter(pk => !cachedTrust.has(pk));

    // Set cached data immediately
    if (cachedTrust.size > 0) {
      setFollowersTrust((prev) => {
        const updated = new Map(prev);
        cachedTrust.forEach((trust, pk) => {
          updated.set(pk, { ...trust, isLoading: false });
        });
        return updated;
      });
    }

    // Mark uncached as loading
    if (pubkeysNeedingFetch.length > 0) {
      setFollowersTrust((prev) => {
        const updated = new Map(prev);
        for (const pk of pubkeysNeedingFetch) {
          if (!updated.has(pk)) {
            updated.set(pk, {
              distance: null,
              paths: null,
              score: null,
              isLoading: true,
            });
          }
        }
        return updated;
      });
    }

    if (pubkeysNeedingFetch.length === 0) return;

    const BATCH_SIZE = 50;
    const newTrustData = new Map<string, TrustData>();

    for (let i = 0; i < pubkeysNeedingFetch.length; i += BATCH_SIZE) {
      const batch = pubkeysNeedingFetch.slice(i, i + BATCH_SIZE);

      try {
        const results = await wotRef.current.getDistanceBatch(batch, { includePaths: true, includeScores: true });
        console.log(`[ProfilePageContent] SDK getDistanceBatch batch ${i / BATCH_SIZE} response (first 3):`,
          JSON.stringify(Object.fromEntries(Object.entries(results).slice(0, 3)), null, 2));

        const batchTrust = new Map<string, TrustInfo>();
        for (const pk of batch) {
          const result = results[pk];
          let distance: number | null = null;
          let paths: number | null = null;
          let score: number | null = null;

          if (result !== null && result !== undefined) {
            const resultData = result as { hops: number; paths: number; score: number };
            distance = resultData.hops;
            paths = resultData.paths;
            score = resultData.score;
          }

          const trust: TrustInfo = {
            distance,
            paths,
            score,
            isLoading: false,
          };
          batchTrust.set(pk, trust);
          newTrustData.set(pk, { distance, paths, score });
        }

        setFollowersTrust((prev) => {
          const updated = new Map(prev);
          batchTrust.forEach((trust, pk) => {
            updated.set(pk, trust);
          });
          return updated;
        });
      } catch (err) {
        console.warn(`[ProfilePageContent] Batch ${i / BATCH_SIZE} failed:`, err);
        setFollowersTrust((prev) => {
          const updated = new Map(prev);
          for (const pk of batch) {
            const existing = updated.get(pk);
            if (existing?.isLoading) {
              updated.set(pk, { ...existing, isLoading: false });
            }
          }
          return updated;
        });
      }

      if (i + BATCH_SIZE < pubkeysNeedingFetch.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    if (newTrustData.size > 0) {
      cacheTrustBatch(newTrustData);
    }
  }, []);

  // Fetch trust data for initially visible followers when follows change
  useEffect(() => {
    if (isWotReady && follows.length > 0) {
      // Only fetch for the first page of followers
      const initialBatch = follows.slice(0, PAGE_SIZE);
      fetchFollowersTrustBatch(initialBatch);
    }
  }, [isWotReady, follows, fetchFollowersTrustBatch]);

  // Reset pagination when pubkey changes
  useEffect(() => {
    setVisibleFollowersCount(PAGE_SIZE);
    setFollowersTrust(new Map());
    setReactionsByNote({});
    setParentByNote({});
    enrichedIdsRef.current = new Set();
  }, [pubkey]);

  // Engagement (reactions/reposts/zaps) is fetched via useEngagementBatch
  // above. Reply parents are still enriched here in batch — the per-id
  // note + profile caches receive incremental updates when each parent
  // resolves, so the visible affordance ("Replying to @X") shows up as
  // soon as we know it.
  useEffect(() => {
    if (noteIds.length === 0) return;
    // Read tag arrays from the note cache (populated by useAuthorNotes as
    // events arrive). If a note hasn't landed yet we'll re-enrich next render.
    import("nostr-wot-sdk/data/cache").then(({ _noteStore }) => {
      const store = _noteStore();
      const fresh: { id: string; tags: string[][] }[] = [];
      for (const id of noteIds) {
        if (enrichedIdsRef.current.has(id)) continue;
        const e = store.get(id).value;
        if (!e) continue;
        enrichedIdsRef.current.add(id);
        fresh.push({ id, tags: e.tags });
      }
      if (fresh.length === 0) return;
      fetchReplyParents(fresh)
        .then((parents) => setParentByNote((prev) => ({ ...prev, ...parents })))
        .catch(() => undefined);
    });
  }, [noteIds]);

  // Auto-load more notes when sentinel scrolls into view
  useEffect(() => {
    if (!hasMoreNotes || isLoadingNotes) return;
    const node = noteSentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) fetchMoreNotes();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMoreNotes, isLoadingNotes, fetchMoreNotes]);

  // Load more followers handler
  const handleLoadMoreFollowers = useCallback(async () => {
    if (isLoadingMoreFollowers) return;

    setIsLoadingMoreFollowers(true);
    const nextCount = visibleFollowersCount + PAGE_SIZE;
    const newFollowers = follows.slice(visibleFollowersCount, nextCount);

    await fetchFollowersTrustBatch(newFollowers);
    setVisibleFollowersCount(nextCount);
    setIsLoadingMoreFollowers(false);
  }, [follows, visibleFollowersCount, fetchFollowersTrustBatch, isLoadingMoreFollowers]);

  // Fetch user data on mount or pubkey change
  useEffect(() => {
    if (pubkey) {
      fetchUserData(pubkey);
    }
  }, [pubkey, fetchUserData]);

  const handleCopyPubkey = async () => {
    try {
      await navigator.clipboard.writeText(pubkey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle npub or hex pubkey
      let targetPubkey = searchQuery.trim();

      // If it starts with npub, we'd need to decode it
      // For simplicity, assume hex pubkey or redirect with the query
      if (targetPubkey.startsWith("npub1")) {
        // Simple decode - in production use a proper library
        // For now, just navigate with the npub
        router.push(`/profile/${targetPubkey}`);
      } else {
        router.push(`/profile/${targetPubkey}`);
      }
    }
  };

  const handleFollowClick = (followPubkey: string) => {
    router.push(`/profile/${followPubkey}`);
  };

  const fallbackFromInitial = useMemo(
    () =>
      initialProfile
        ? {
            displayName: initialProfile.displayName ?? undefined,
            name: initialProfile.name ?? undefined,
            picture: initialProfile.picture ?? undefined,
            nip05: initialProfile.nip05 ?? undefined,
            about: initialProfile.about ?? undefined,
          }
        : null,
    [initialProfile],
  );
  const effectiveProfile = profile ?? fallbackFromInitial;
  const displayName =
    effectiveProfile?.displayName ||
    effectiveProfile?.name ||
    formatPubkey(pubkey);

  // Filter follows based on search (within sidebar) and deduplicate
  const [followSearch, setFollowSearch] = useState("");
  // Search reads display-name / nip-05 from the SDK's profile cache
  // synchronously — each FollowRow has already populated it on mount.
  const filteredFollows = useMemo(() => {
    const dedup = [...new Set(follows)];
    if (!followSearch) return dedup;
    const q = followSearch.toLowerCase();
    return dedup.filter((pk) => {
      if (pk.toLowerCase().includes(q)) return true;
      const p = _profileStore().get(pk).value;
      if (!p) return false;
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.displayName && p.displayName.toLowerCase().includes(q)) ||
        (p.nip05 && p.nip05.toLowerCase().includes(q))
      );
    });
  }, [follows, followSearch]);

  // Fetch trust data for visible followers that don't have it yet
  // This handles the case when searching shows followers outside the initial batch
  useEffect(() => {
    if (!isWotReady || filteredFollows.length === 0) return;

    // Get currently visible followers
    const visibleFollowers = followSearch
      ? filteredFollows
      : filteredFollows.slice(0, visibleFollowersCount);

    // Find followers without trust data (not in state)
    const missingTrust = visibleFollowers.filter(
      (pk) => !followersTrust.has(pk)
    );

    if (missingTrust.length > 0) {
      fetchFollowersTrustBatch(missingTrust);
    }
  }, [
    isWotReady,
    filteredFollows,
    followSearch,
    visibleFollowersCount,
    followersTrust,
    fetchFollowersTrustBatch,
  ]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <svg
            className="w-16 h-16 text-trust-red mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t("error")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={() => router.back()}>
            {t("goBack")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top search bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-600 rounded-lg outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <Button type="submit" size="sm">
              {t("search")}
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Profile header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {isLoading && !effectiveProfile ? (
                <ProfileHeaderSkeleton />
              ) : (
                <>
                  {/* Banner */}
                  {initialProfile?.banner ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={initialProfile.banner}
                      alt=""
                      className="h-32 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="h-32 bg-gradient-to-r from-primary/20 to-purple-500/20" />
                  )}

                  {/* Profile info */}
                  <div className="px-6 pb-6">
                    {/* Avatar */}
                    <div className="-mt-16 mb-4">
                      {effectiveProfile?.picture ? (
                        <img
                          src={effectiveProfile.picture}
                          alt={`${displayName} avatar`}
                          className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-gray-200 dark:bg-gray-700"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-4xl text-gray-500">
                            {displayName[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name and info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {displayName}
                        </h1>
                        {effectiveProfile?.name &&
                          effectiveProfile.name !== effectiveProfile.displayName && (
                            <p className="text-gray-600 dark:text-gray-400">
                              @{effectiveProfile.name}
                            </p>
                          )}
                        {effectiveProfile?.nip05 && (
                          <div className="flex items-center gap-1 mt-1">
                            <svg
                              className="w-4 h-4 text-primary"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm text-primary">
                              {effectiveProfile.nip05}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleCopyPubkey}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                      >
                        <span className="font-mono">{formatPubkey(pubkey)}</span>
                        {copied ? (
                          <svg
                            className="w-4 h-4 text-trust-green"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 mt-4">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {follows.length}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          {t("following")}
                        </span>
                      </div>
                    </div>

                    {/* Trust info from WoT extension */}
                    {isWotReady && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          {t("trustInfo")}
                        </h3>
                        {isLoadingTrust ? (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            {t("loadingTrust")}
                          </div>
                        ) : profileTrust ? (() => {
                          // Use SDK-provided score directly
                          const score = profileTrust.score;
                          return (
                          <div className="flex flex-wrap gap-4">
                            {/* Distance (hops) */}
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t("hops")}</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {profileTrust.distance !== null ? profileTrust.distance : "—"}
                                </p>
                              </div>
                            </div>

                            {/* Paths */}
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t("paths")}</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {profileTrust.paths !== null ? profileTrust.paths : "—"}
                                </p>
                              </div>
                            </div>

                            {/* Trust score */}
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                score !== null && score >= 0.7
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : score !== null && score >= 0.3
                                  ? "bg-yellow-100 dark:bg-yellow-900/30"
                                  : "bg-red-100 dark:bg-red-900/30"
                              }`}>
                                <svg className={`w-4 h-4 ${
                                  score !== null && score >= 0.7
                                    ? "text-green-600 dark:text-green-400"
                                    : score !== null && score >= 0.3
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-red-600 dark:text-red-400"
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t("trustScore")}</p>
                                <p className={`font-semibold ${
                                  score !== null && score >= 0.7
                                    ? "text-green-600 dark:text-green-400"
                                    : score !== null && score >= 0.3
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}>
                                  {score !== null ? `${Math.round(score * 100)}%` : "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                          );
                        })() : (
                          <p className="text-sm text-gray-500">{t("notInNetwork")}</p>
                        )}
                      </div>
                    )}

                    {/* About */}
                    {effectiveProfile?.about && (
                      <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {effectiveProfile.about}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Notes section */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("recentNotes")}
              </h2>

              {isLoading ? (
                <NotesSkeleton />
              ) : noteIds.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500">{t("noNotes")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {noteIds.map((id) => (
                    <NoteRow key={id} id={id} parent={parentByNote[id]} />
                  ))}

                  {hasMoreNotes && (
                    <div
                      ref={noteSentinelRef}
                      className="py-6 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400"
                    >
                      {isLoadingNotes ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          {t("loading")}
                        </span>
                      ) : (
                        <span>{t("loadMore")}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Following */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-20">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t("following")} ({follows.length})
                  </h3>

                  {/* Search within follows */}
                  <div className="mt-3 relative">
                    <input
                      type="text"
                      value={followSearch}
                      onChange={(e) => setFollowSearch(e.target.value)}
                      placeholder={t("searchFollowing")}
                      className="w-full pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <svg
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                  {isLoading ? (
                    <FollowsSkeleton />
                  ) : filteredFollows.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">
                      {followSearch ? t("noResults") : t("noFollowing")}
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {/* When searching, show all matching results from loaded data; otherwise paginate */}
                      {(followSearch ? filteredFollows : filteredFollows.slice(0, visibleFollowersCount)).map((followPubkey) => (
                        <FollowRow
                          key={followPubkey}
                          pubkey={followPubkey}
                          trust={followersTrust.get(followPubkey)}
                          onClick={() => handleFollowClick(followPubkey)}
                        />
                      ))}
                      {/* Load more button - only show when not searching and there are more to load */}
                      {!followSearch && follows.length > visibleFollowersCount && (
                        <button
                          onClick={handleLoadMoreFollowers}
                          disabled={isLoadingMoreFollowers}
                          className="w-full p-3 text-sm text-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isLoadingMoreFollowers ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              {t("loading")}
                            </>
                          ) : (
                            <>
                              {t("loadMore")} ({follows.length - visibleFollowersCount} {t("more")})
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wraps a follow-list row so each one independently subscribes to its
// follower's profile via useProfile. As kind-0 events land from relays
// the avatar + display name fill in without re-rendering siblings.
function FollowRow({
  pubkey,
  trust,
  onClick,
}: {
  pubkey: string;
  trust: TrustInfo | undefined;
  onClick: () => void;
}) {
  const profile = useProfile(pubkey);
  const displayName =
    profile?.displayName?.trim() ||
    profile?.name?.trim() ||
    formatPubkey(pubkey);
  const score = trust?.score ?? null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left cursor-pointer"
    >
      {profile?.picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.picture}
          alt={`${displayName} avatar`}
          className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-sm text-gray-500">
            {(displayName[0] || "?").toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {displayName}
        </p>
        {profile?.nip05 && (
          <p className="text-xs text-gray-500 truncate">{profile.nip05}</p>
        )}
      </div>
      {trust?.isLoading ? (
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      ) : trust && trust.distance !== null ? (
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
            score !== null && score >= 0.7
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : score !== null && score >= 0.3
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
          }`}
        >
          <span>{trust.distance}h</span>
          {trust.paths !== null && <span>·{trust.paths}p</span>}
          {score !== null && <span>·{Math.round(score * 100)}%</span>}
        </div>
      ) : trust && trust.distance === null ? (
        <div className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
          —
        </div>
      ) : (
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
}

// Wraps NoteCard so each row reactively pulls its NoteEntry from the
// shared note cache. The author cache pushes events into the per-id
// store as they arrive from relays.
function NoteRow({ id, parent }: { id: string; parent: ParentRef | undefined }) {
  const note = useNote(id);
  if (!note) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    );
  }
  return (
    <NoteCard
      note={{
        id: note.id,
        pubkey: note.pubkey,
        content: note.content,
        created_at: note.createdAt,
        tags: note.tags,
        kind: 1,
      }}
      parent={parent}
    />
  );
}

// Skeleton components
function ProfileHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-gray-700" />
      <div className="px-6 pb-6">
        <div className="-mt-16 mb-4">
          <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>
    </div>
  );
}

function NotesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
        >
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

function FollowsSkeleton() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
