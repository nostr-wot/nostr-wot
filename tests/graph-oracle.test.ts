import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchDistances, fetchFollowPage } from "../lib/graph/oracle";

const root = "a".repeat(64);
const target = "b".repeat(64);
const signal = () => new AbortController().signal;
const response = (value: unknown) => new Response(JSON.stringify(value), { status: 200 });

test("follows pagination advances by server rows, with deduplicated display keys", async t => {
  const calls: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: string) => {
    calls.push(url);
    return response({ pubkey: root, follows: calls.length === 1 ? [target, target] : [], total: 2 });
  });
  const first = await fetchFollowPage(root, 0, signal(), 2);
  assert.deepEqual(first, { follows: [target], total: 2, nextOffset: 2, hasMore: false });
  assert.match(calls[0], /limit=2&offset=0$/);
});

test("follows validates owner, pubkeys and pagination progress", async t => {
  for (const invalid of [
    { pubkey: target, follows: [], total: 0 },
    { pubkey: root, follows: ["invalid"], total: 1 },
    { pubkey: root, follows: [], total: 1 },
    { pubkey: root, follows: [], total: -1 },
  ]) {
    const mock = t.mock.method(globalThis, "fetch", async () => response(invalid));
    await assert.rejects(fetchFollowPage(root, 0, signal()));
    mock.mock.restore();
  }
});

test("follows supports continuation and propagates HTTP errors", async t => {
  const mock = t.mock.method(globalThis, "fetch", async () => response({ pubkey: root, follows: [target], total: 3 }));
  assert.deepEqual(await fetchFollowPage(root, 1, signal(), 1), {
    follows: [target], total: 3, nextOffset: 2, hasMore: true,
  });
  mock.mock.restore();
  t.mock.method(globalThis, "fetch", async () => new Response("", { status: 503 }));
  await assert.rejects(fetchFollowPage(root, 0, signal()), /503/);
});

test("distance request is root-scoped and preserves unknown distances", async t => {
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
    assert.deepEqual(JSON.parse(init.body as string), { from: root, targets: [target], max_hops: 4 });
    return response({ from: root, results: [{ from: root, to: target, hops: null, path_count: 0, mutual_follow: false }] });
  });
  assert.deepEqual((await fetchDistances(root, [target], signal())).get(target), {
    hops: null, pathCount: 0, mutual: false,
  });
});

test("distance validation rejects foreign, duplicate and missing targets", async t => {
  const valid = { from: root, to: target, hops: 1, path_count: 1, mutual_follow: false };
  for (const results of [[{ ...valid, to: root }], [valid, valid], [], [{ ...valid, hops: 7 }], [{ ...valid, path_count: -1 }]]) {
    const mock = t.mock.method(globalThis, "fetch", async () => response({ from: root, results }));
    await assert.rejects(fetchDistances(root, [target], signal()), /distance response/);
    mock.mock.restore();
  }
});

test("distance requests split into bounded batches", async t => {
  const targets = Array.from({ length: 201 }, (_, index) => index.toString(16).padStart(64, "0"));
  const sizes: number[] = [];
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
    const body = JSON.parse(init.body as string);
    sizes.push(body.targets.length);
    return response({ from: root, results: body.targets.map((to: string) => ({
      from: root, to, hops: 2, path_count: 3, mutual_follow: false,
    })) });
  });
  assert.equal((await fetchDistances(root, targets, signal())).size, 201);
  assert.deepEqual(sizes, [100, 100, 1]);
});

test("cancellation reaches fetch and aborts the operation", async t => {
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
    return new Promise<Response>((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
    });
  });
  const pending = fetchFollowPage(root, 0, controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});

test("expansion excludes unknown distances and uses oracle metrics without invented paths", async () => {
  const { buildExpansion } = await import("../lib/graph/expansion");
  const parent = { id: root, isRoot: true, distance: 0, pathCount: 1, trustScore: 1 };
  const unknown = "c".repeat(64);
  const data = buildExpansion(parent, root, [target, unknown, target], new Map([
    [target, { hops: 2, pathCount: 3, mutual: true }],
    [unknown, { hops: null, pathCount: 0, mutual: false }],
  ]), [parent]);
  assert.equal(data.nodes.length, 1);
  assert.equal(data.links.length, 1);
  assert.equal(data.nodes[0].id, target);
  assert.equal(data.nodes[0].distance, 2);
  assert.equal(data.nodes[0].pathCount, 3);
  assert.equal(data.links[0].bidirectional, true);
});

test("expansion keeps shared-node links and does not treat root-relative mutuals as mutual edges", async () => {
  const { buildExpansion } = await import("../lib/graph/expansion");
  const parent = { id: "c".repeat(64), isRoot: false, distance: 1, pathCount: 1, trustScore: 1 };
  const old = { id: target, isRoot: false, distance: 3, pathCount: 1, trustScore: 0.3, expandedFrom: root, x: 12 };
  const data = buildExpansion(parent, root, [target, root, parent.id], new Map([
    [target, { hops: 2, pathCount: 4, mutual: true }],
  ]), [parent, old]);
  assert.equal(data.nodes[0].expandedFrom, root);
  assert.equal(data.nodes[0].x, 12);
  assert.equal(data.nodes[0].distance, 2);
  assert.equal(data.nodes[0].pathCount, 4);
  assert.equal(data.links.length, 1);
  assert.equal(data.links[0].bidirectional, false);
});


test("expansion preserves a follow back to the root without requiring a distance query", async () => {
  const { buildExpansion } = await import("../lib/graph/expansion");
  const rootNode = { id: root, isRoot: true, distance: 0, pathCount: 1, trustScore: 1 };
  const parent = { id: target, isRoot: false, distance: 2, pathCount: 1, trustScore: 0.5 };
  const data = buildExpansion(parent, root, [root], new Map(), [rootNode, parent]);
  assert.equal(data.nodes.length, 0);
  assert.deepEqual(data.links, [{ source: target, target: root, type: "follow", strength: 1, bidirectional: false }]);
  const mutual = buildExpansion({ ...parent, isMutual: true }, root, [root], new Map(), [rootNode, parent]);
  assert.equal(mutual.links.length, 0);
});
