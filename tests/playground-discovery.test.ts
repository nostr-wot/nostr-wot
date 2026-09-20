import assert from "node:assert/strict";
import { test } from "node:test";
import { finalizeEvent, getPublicKey, type SimplePool } from "nostr-tools";
import { discoveryPool, authorWriteRelays } from "../lib/graph/discovery";
const secret = Uint8Array.from({ length: 32 }, (_, i) => i === 31 ? 7 : 0), pubkey = getPublicKey(secret);
const signed = (kind: number, tags: string[][], created_at = 100) => finalizeEvent({ kind, tags, content: "", created_at }, secret);
test("relay discovery validates write URLs and excludes read-only relays", () => {
  assert.deepEqual(authorWriteRelays(signed(10002, [["r", "wss://write.example/", "write"], ["r", "wss://read.example", "read"], ["r", "https://web.example"], ["r", "wss://user:pass@example.com"], ["r", "wss://both.example"]])), ["wss://write.example", "wss://both.example"]);
});
test("Purple Pages discovery is batched and verified before using an author's write relay", async () => {
  const calls: { urls: string[]; kinds: number[] }[] = [];
  const relay = signed(10002, [["r", "wss://author.example", "write"]]);
  const badRelay = { ...JSON.parse(JSON.stringify(relay)), tags: [["r", "wss://forged.example"]], sig: "0".repeat(128) };
  const follows = signed(3, [["p", "b".repeat(64)], ["p", "invalid"]]);
  const pool = { subscribeMany(urls, filter, handlers) {
    calls.push({ urls, kinds: filter.kinds! });
    queueMicrotask(() => {
      if (filter.kinds?.includes(10002)) { handlers.onevent?.(badRelay); handlers.onevent?.(relay); }
      if (urls.includes("wss://author.example")) handlers.onevent?.(follows);
      handlers.oneose?.();
    });
    return { close() {} };
  } } as Pick<SimplePool, "subscribeMany">;
  const events: unknown[] = [];
  await new Promise<void>(resolve => { discoveryPool(pool).subscribe({ authors: [pubkey], kinds: [3] }, { onEvent: e => events.push(e), onEose: resolve }); });
  assert.ok(calls[0].urls.includes("wss://purplepag.es"));
  assert.ok(calls.some(c => c.urls.includes("wss://author.example")));
  assert.ok(!calls.some(c => c.urls.includes("wss://forged.example")));
  assert.equal(events.length, 1);
  assert.deepEqual((events[0] as {tags:string[][]}).tags, [["p", "b".repeat(64)]]);
});
