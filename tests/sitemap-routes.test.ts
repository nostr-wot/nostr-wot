import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  routes,
  sourceFileSegments,
  messageFileSegments,
  resolveRouteLastModified,
} from '../lib/sitemap-routes.mjs';

test('sourceFileSegments maps the homepage to app/[locale]/page.tsx', () => {
  assert.deepEqual(sourceFileSegments(''), ['app', '[locale]', 'page.tsx']);
});

test('sourceFileSegments maps nested paths to their nested page.tsx', () => {
  assert.deepEqual(
    sourceFileSegments('/docs/getting-started'),
    ['app', '[locale]', 'docs', 'getting-started', 'page.tsx']
  );
});

test('messageFileSegments points at the English message file for a known key', () => {
  assert.deepEqual(
    messageFileSegments('mediaKit'),
    ['messages', 'en', 'mediaKit.json']
  );
});

test('messageFileSegments returns null when a route has no message namespace', () => {
  assert.equal(messageFileSegments(null), null);
});

test('every static route resolves to a distinct, existing page.tsx path shape', () => {
  // Guards against the route list and the resolver silently drifting apart.
  for (const route of routes) {
    const segments = sourceFileSegments(route.path);
    assert.equal(segments[segments.length - 1], 'page.tsx');
    assert.equal(segments[0], 'app');
    assert.equal(segments[1], '[locale]');
  }
});

test('resolveRouteLastModified returns the mapped date for a route that has one', () => {
  const map = { '/features': '2026-07-02T21:20:06+07:00' };
  const result = resolveRouteLastModified('/features', map);
  assert.ok(result instanceof Date);
  assert.equal(result?.toISOString(), new Date('2026-07-02T21:20:06+07:00').toISOString());
});

test('resolveRouteLastModified returns undefined for a route missing from the map', () => {
  const map = { '/features': '2026-07-02T21:20:06+07:00' };
  assert.equal(resolveRouteLastModified('/pitch', map), undefined);
});

test('resolveRouteLastModified returns undefined for every route when the map is empty', () => {
  // This is the shape scripts/generate-route-modified.mjs writes when it
  // detects a shallow clone (or git is unavailable): {} rather than uniform
  // fallback dates. Confirms the lookup treats that honestly for every
  // route, not just some.
  const emptyMap = {};
  for (const route of routes) {
    assert.equal(resolveRouteLastModified(route.path, emptyMap), undefined);
  }
});

test('resolveRouteLastModified returns undefined when the map itself is missing', () => {
  assert.equal(resolveRouteLastModified('/features', null), undefined);
  assert.equal(resolveRouteLastModified('/features', undefined), undefined);
});
