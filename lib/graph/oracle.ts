/** Public oracle adapter. All responses are untrusted until validated here. */
export const ORACLE_URL = "https://wot-oracle.mappingbitcoin.com";
export const FOLLOW_PAGE_SIZE = 250;
export const isPubkey = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);

export interface FollowPage { follows: string[]; total: number; nextOffset: number; hasMore: boolean }
export interface OracleDistance { hops: number | null; pathCount: number; mutual: boolean }

async function request(path: string, signal: AbortSignal, init?: RequestInit): Promise<unknown> {
  const timeout = AbortSignal.timeout(15000);
  const response = await fetch(`${ORACLE_URL}${path}`, {
    ...init, signal: AbortSignal.any([signal, timeout]),
  });
  if (!response.ok) throw new Error(`Oracle request failed (${response.status})`);
  return response.json();
}

export async function fetchFollowPage(pubkey: string, offset: number, signal: AbortSignal, limit = FOLLOW_PAGE_SIZE): Promise<FollowPage> {
  if (!isPubkey(pubkey) || !Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > FOLLOW_PAGE_SIZE) {
    throw new Error("Invalid follows request");
  }
  const data = await request(`/follows?pubkey=${pubkey}&limit=${limit}&offset=${offset}`, signal) as Record<string, unknown>;
  if (!data || data.pubkey !== pubkey || !Array.isArray(data.follows) ||
      !data.follows.every(isPubkey) || data.follows.length > limit ||
      !Number.isSafeInteger(data.total) || (data.total as number) < 0) {
    throw new Error("Invalid follows response");
  }
  const nextOffset = offset + data.follows.length;
  if (!data.follows.length && offset < (data.total as number)) throw new Error("Incomplete follows response");
  return { follows: [...new Set(data.follows as string[])], total: data.total as number,
    nextOffset, hasMore: nextOffset < (data.total as number) };
}

export async function fetchDistances(from: string, targets: string[], signal: AbortSignal): Promise<Map<string, OracleDistance>> {
  if (!isPubkey(from) || targets.length > FOLLOW_PAGE_SIZE || !targets.every(isPubkey)) throw new Error("Invalid distance request");
  const result = new Map<string, OracleDistance>();
  // Keep requests below the oracle's batch limit and cancel the whole expansion together.
  for (let index = 0; index < targets.length; index += 100) {
    const batch = targets.slice(index, index + 100);
    const data = await request("/distance/batch", signal, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, targets: batch, max_hops: 4 }),
    }) as Record<string, unknown>;
    if (!data || data.from !== from || !Array.isArray(data.results)) throw new Error("Invalid distance response");
    const expected = new Set(batch);
    for (const row of data.results) {
      if (!row || row.from !== from || !expected.has(row.to) || result.has(row.to) ||
          !(row.hops === null || (Number.isInteger(row.hops) && row.hops >= 0 && row.hops <= 4)) ||
          !Number.isSafeInteger(row.path_count) || row.path_count < 0 || typeof row.mutual_follow !== "boolean") {
        throw new Error("Invalid distance response");
      }
      result.set(row.to, { hops: row.hops, pathCount: row.path_count, mutual: row.mutual_follow });
    }
    if (batch.some(key => !result.has(key))) throw new Error("Incomplete distance response");
  }
  return result;
}
