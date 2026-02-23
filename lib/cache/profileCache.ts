/**
 * Local cache for user profile information and trust data
 * Stores profiles in localStorage with 30-minute expiration
 */

import { NodeProfile } from "@/lib/graph/types";

const CACHE_KEY = "nostr-wot-profile-cache";
const TRUST_CACHE_KEY = "nostr-wot-trust-cache";
const TRUST_CACHE_VERSION_KEY = "nostr-wot-trust-cache-version";
const CURRENT_CACHE_VERSION = 2; // Bump this when cache format changes
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Check and migrate trust cache if version changed
 * This clears old cache when the format changes (e.g., adding score field)
 */
function checkAndMigrateTrustCache(): void {
  if (typeof window === "undefined") return;

  try {
    const storedVersion = localStorage.getItem(TRUST_CACHE_VERSION_KEY);
    const version = storedVersion ? parseInt(storedVersion, 10) : 0;

    if (version < CURRENT_CACHE_VERSION) {
      // Clear old cache format
      localStorage.removeItem(TRUST_CACHE_KEY);
      localStorage.setItem(TRUST_CACHE_VERSION_KEY, String(CURRENT_CACHE_VERSION));
      console.log("[profileCache] Cleared old trust cache (version upgrade)");
    }
  } catch {
    // Ignore errors
  }
}

// Run migration check on module load
if (typeof window !== "undefined") {
  checkAndMigrateTrustCache();
}

export interface TrustData {
  distance: number | null;
  paths: number | null;
  score: number | null;
}

interface CachedProfile extends NodeProfile {
  cachedAt: number;
}

interface CachedTrust extends TrustData {
  cachedAt: number;
}

interface ProfileCache {
  profiles: Record<string, CachedProfile>;
}

interface TrustCache {
  trust: Record<string, CachedTrust>;
  lastSyncedAt?: number;
}

/**
 * Get the cache from localStorage
 */
function getCache(): ProfileCache {
  if (typeof window === "undefined") {
    return { profiles: {} };
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore parse errors
  }

  return { profiles: {} };
}

/**
 * Save the cache to localStorage
 */
function saveCache(cache: ProfileCache): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

/**
 * Check if a cached profile is still valid (not expired)
 */
function isValid(cachedProfile: CachedProfile): boolean {
  return Date.now() - cachedProfile.cachedAt < CACHE_EXPIRY_MS;
}

/**
 * Get a profile from cache if it exists and is not expired
 */
export function getCachedProfile(pubkey: string): NodeProfile | null {
  const cache = getCache();
  const cached = cache.profiles[pubkey];

  if (cached && isValid(cached)) {
    // Return without cachedAt
    const { cachedAt, ...profile } = cached;
    return profile;
  }

  return null;
}

/**
 * Get multiple profiles from cache
 * Returns a Map of pubkey -> profile for profiles that are cached and valid
 */
export function getCachedProfiles(pubkeys: string[]): Map<string, NodeProfile> {
  const cache = getCache();
  const result = new Map<string, NodeProfile>();

  for (const pubkey of pubkeys) {
    const cached = cache.profiles[pubkey];
    if (cached && isValid(cached)) {
      const { cachedAt, ...profile } = cached;
      result.set(pubkey, profile);
    }
  }

  return result;
}

/**
 * Save a profile to the cache
 */
export function cacheProfile(profile: NodeProfile): void {
  const cache = getCache();

  cache.profiles[profile.pubkey] = {
    ...profile,
    cachedAt: Date.now(),
  };

  saveCache(cache);
}

/**
 * Save multiple profiles to the cache
 */
export function cacheProfiles(profiles: Map<string, NodeProfile> | NodeProfile[]): void {
  const cache = getCache();

  if (profiles instanceof Map) {
    profiles.forEach((profile, pubkey) => {
      cache.profiles[pubkey] = {
        ...profile,
        cachedAt: Date.now(),
      };
    });
  } else {
    for (const profile of profiles) {
      cache.profiles[profile.pubkey] = {
        ...profile,
        cachedAt: Date.now(),
      };
    }
  }

  saveCache(cache);
}

/**
 * Filter pubkeys to only those that need to be fetched (not in cache or expired)
 */
export function getPubkeysToFetch(pubkeys: string[]): string[] {
  const cache = getCache();

  return pubkeys.filter((pubkey) => {
    const cached = cache.profiles[pubkey];
    return !cached || !isValid(cached);
  });
}

/**
 * Clear expired profiles from the cache
 */
export function clearExpiredProfiles(): void {
  const cache = getCache();
  const now = Date.now();

  for (const pubkey of Object.keys(cache.profiles)) {
    if (now - cache.profiles[pubkey].cachedAt >= CACHE_EXPIRY_MS) {
      delete cache.profiles[pubkey];
    }
  }

  saveCache(cache);
}

/**
 * Clear the entire cache
 */
export function clearProfileCache(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { total: number; valid: number; expired: number } {
  const cache = getCache();
  let valid = 0;
  let expired = 0;

  for (const pubkey of Object.keys(cache.profiles)) {
    if (isValid(cache.profiles[pubkey])) {
      valid++;
    } else {
      expired++;
    }
  }

  return { total: valid + expired, valid, expired };
}

// ============================================
// Trust Cache Functions
// ============================================

/**
 * Get the trust cache from localStorage
 */
function getTrustCache(): TrustCache {
  if (typeof window === "undefined") {
    return { trust: {} };
  }

  try {
    const cached = localStorage.getItem(TRUST_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore parse errors
  }

  return { trust: {} };
}

/**
 * Save the trust cache to localStorage
 */
function saveTrustCache(cache: TrustCache): void {
  if (typeof window === "undefined") return;

  try {
    cache.lastSyncedAt = Date.now();
    localStorage.setItem(TRUST_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

/**
 * Get the last time the trust cache was synced
 */
export function getTrustCacheLastSyncedAt(): number | null {
  const cache = getTrustCache();
  return cache.lastSyncedAt ?? null;
}

/**
 * Check if the trust cache is stale (older than CACHE_EXPIRY_MS)
 */
export function isTrustCacheStale(): boolean {
  const lastSynced = getTrustCacheLastSyncedAt();
  if (!lastSynced) return true;
  return Date.now() - lastSynced >= CACHE_EXPIRY_MS;
}

/**
 * Check if cached trust data is still valid
 * Also checks that score is present (new format)
 */
function isTrustValid(cachedTrust: CachedTrust): boolean {
  // Check expiry
  if (Date.now() - cachedTrust.cachedAt >= CACHE_EXPIRY_MS) {
    return false;
  }
  // Check that it has the new format with score field
  // (score can be null for entries not in WoT, but the field must exist)
  if (!("score" in cachedTrust)) {
    return false;
  }
  return true;
}

/**
 * Get trust data from cache if it exists and is not expired
 */
export function getCachedTrust(pubkey: string): TrustData | null {
  const cache = getTrustCache();
  const cached = cache.trust[pubkey];

  if (cached && isTrustValid(cached)) {
    const { cachedAt, ...trust } = cached;
    return trust;
  }

  return null;
}

/**
 * Get multiple trust data entries from cache
 */
export function getCachedTrustBatch(pubkeys: string[]): Map<string, TrustData> {
  const cache = getTrustCache();
  const result = new Map<string, TrustData>();

  for (const pubkey of pubkeys) {
    const cached = cache.trust[pubkey];
    if (cached && isTrustValid(cached)) {
      const { cachedAt, ...trust } = cached;
      result.set(pubkey, trust);
    }
  }

  return result;
}

/**
 * Save trust data to the cache
 */
export function cacheTrust(pubkey: string, trust: TrustData): void {
  const cache = getTrustCache();

  cache.trust[pubkey] = {
    ...trust,
    cachedAt: Date.now(),
  };

  saveTrustCache(cache);
}

/**
 * Save multiple trust data entries to the cache
 */
export function cacheTrustBatch(trustMap: Map<string, TrustData>): void {
  const cache = getTrustCache();

  trustMap.forEach((trust, pubkey) => {
    cache.trust[pubkey] = {
      ...trust,
      cachedAt: Date.now(),
    };
  });

  saveTrustCache(cache);
}

/**
 * Filter pubkeys to only those that need trust data fetched
 */
export function getPubkeysNeedingTrust(pubkeys: string[]): string[] {
  const cache = getTrustCache();

  return pubkeys.filter((pubkey) => {
    const cached = cache.trust[pubkey];
    return !cached || !isTrustValid(cached);
  });
}

/**
 * Clear the trust cache
 */
export function clearTrustCache(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(TRUST_CACHE_KEY);
  } catch {
    // Ignore
  }
}

// ============================================
// WoT Scoring Config Types (aligned with SDK)
// ============================================

/**
 * Scoring config structure from nostr-wot-sdk
 */
export interface WoTScoringConfig {
  /** Score multiplier per hop distance */
  distanceWeights: Record<number, number>;
  /** Bonus multiplier for mutual follows (e.g., 0.5 = +50%) */
  mutualBonus: number;
  /** Bonus multiplier per additional path (e.g., 0.1 = +10% per path) */
  pathBonus: number;
  /** Maximum total path bonus (e.g., 0.5 = cap at +50%) */
  maxPathBonus: number;
}

/**
 * Default scoring config (fallback if SDK config not available)
 */
export const DEFAULT_SCORING_CONFIG: WoTScoringConfig = {
  distanceWeights: {
    0: 1.0,
    1: 1.0,
    2: 0.5,
    3: 0.25,
    4: 0.1,
  },
  mutualBonus: 0.5,
  pathBonus: 0.1,
  maxPathBonus: 0.5,
};
