import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mergeGraphData, displayedPath, applyGraphProfiles } from '../lib/graph/merge';
import type { GraphNode, GraphEdge } from '../lib/graph/types';
const node = (id: string): GraphNode => ({ id, distance: 2, pathCount: 3, trustScore: 0.7, isRoot: false });
const edge = (source: string | GraphNode, target: string | GraphNode): GraphEdge => ({ source, target, type: 'follow', strength: 0.5, bidirectional: false });
test('merges force-graph object endpoints and duplicate pages without inflating paths', () => {
  const a = node('a'), b = node('b');
  const data = mergeGraphData({ nodes: [a,b], links: [edge(a,b)] }, { nodes: [b,b], links: [edge('a','b'),edge('a','b')] });
  assert.equal(data.nodes.length, 2);
  assert.equal(data.links.length, 1);
  assert.equal(data.nodes[1].pathCount, 3);
  assert.equal(data.links[0].source, 'a');
});
test('accepts corrected metrics without losing simulated positions or fabricating paths', () => {
  const data = mergeGraphData({ nodes: [{...node('a'),x:12},node('b')], links: [] }, {nodes:[{...node('a'),distance:1,pathCount:1,trustScore:1}],links:[edge('b','a'),edge('absent','a')]});
  assert.equal(data.nodes[0].x,12);
  assert.equal(data.nodes[0].pathCount,1);
  assert.equal(data.nodes[0].distance,1);
  assert.equal(data.links.length,1);
});

test('displayed paths follow actual directed edges, never stale discovery parents', () => {
  const root={...node('root'),isRoot:true};
  const a={...node('a'),expandedFrom:'root'}, b=node('b');
  assert.deepEqual(displayedPath({nodes:[root,a,b],links:[edge('a','root')]},'a'),[]);
  assert.deepEqual(displayedPath({nodes:[root,a,b],links:[edge('root','b'),edge('b','a')]},'a').map(n=>n.id),['root','b','a']);
});


test('verified profile names and avatars reach rendered nodes without changing graph metrics', () => {
  const before = { ...node('a'), x: 12, label: 'npub…', picture: 'https://old.example/avatar' };
  const updated = applyGraphProfiles({ nodes: [before], links: [] }, new Map([['a', { pubkey: 'a', displayName: 'Alice' }]]));
  assert.equal(updated.nodes[0].label, 'Alice');
  assert.equal(updated.nodes[0].picture, undefined);
  assert.equal(updated.nodes[0].x, 12);
  assert.equal(updated.nodes[0].trustScore, before.trustScore);
});
