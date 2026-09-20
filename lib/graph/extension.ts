import { isPubkey } from "./oracle";

export type GraphExtension = {
  getPublicKey: () => Promise<string>;
  wot?: {
    getStatus: () => Promise<{ mode?: string; hasLocalGraph?: boolean; updatedAt?: number | null }>;
    getFollows: (pubkey: string) => Promise<string[]>;
    getDistanceBatch: (pubkeys: string[], options: { includePaths: boolean; includeScores: boolean }) => Promise<Record<string, { hops: number; paths: number | null; score: number } | null>>;
  };
};

export async function connectGraphExtension(provider?: GraphExtension): Promise<string> {
  if (!provider || typeof provider.getPublicKey !== "function") throw new Error("extensionMissing");
  const pubkey = await provider.getPublicKey();
  if (!isPubkey(pubkey)) throw new Error("extensionInvalid");
  return pubkey;
}
