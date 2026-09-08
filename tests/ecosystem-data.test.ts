import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PROJECT_STATUSES, isSafeExternalUrl } from '../lib/ecosystem-projects';

const data = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.json', import.meta.url), 'utf8'));
const date = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(value).toISOString().slice(0, 10) === value;
const link = (value: string) => assert.ok(isSafeExternalUrl(value) && value.startsWith('https://'), `Unsafe or missing URL: ${value}`);

test('published directory records have unique identities, dated status evidence and attributed people', () => {
  assert.ok(date(data.checkedAt));
  assert.ok(data.projects.length > 0, 'Do not publish the empty scaffold');
  const ids = new Set();
  for (const p of data.projects) {
    assert.match(p.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!ids.has(p.id), `Duplicate project ${p.id}`);
    ids.add(p.id);
    for (const field of ['name', 'summary', 'category', 'statusNote']) assert.ok(p[field]?.trim(), `${p.id}: ${field}`);
    assert.ok(PROJECT_STATUSES.includes(p.status));
    assert.ok(date(p.lastVerified) && p.lastVerified <= data.checkedAt);
    link(p.website);
    link(p.repository);
    assert.ok(p.sources.length > 0);
    for (const source of p.sources) { assert.ok(source.label); link(source.url); }
    for (const person of p.people) {
      assert.ok(person.name?.trim());
      assert.ok(['founder', 'maintainer', 'creator'].includes(person.role));
      link(person.sourceUrl);
      assert.ok(person.profiles.length > 0);
      for (const profile of person.profiles) { assert.ok(profile.label); link(profile.url); }
    }
    if (p.latestUpdate) { assert.ok(date(p.latestUpdate.date) && p.latestUpdate.date <= data.checkedAt); link(p.latestUpdate.url); }
  }
});

test('news and security records retain dates and source links without future claims', () => {
  for (const item of [...data.news, ...data.security]) {
    assert.ok(item.title?.trim() && item.summary?.trim());
    assert.ok(date(item.date) && item.date <= data.checkedAt);
    link(item.url);
    for (const source of item.sources ?? []) link(source.url);
  }
});

test('Spanish translation preserves record identities, roles, dates and evidence URLs', () => {
  const es = JSON.parse(readFileSync(new URL('../data/ecosystem-projects.es.json', import.meta.url), 'utf8'));
  const fixed = new Set(['id', 'name', 'status', 'role', 'category', 'date', 'lastVerified', 'url', 'website', 'repository', 'sourceUrl', 'checkedAt', 'type', 'coverage', 'dateBasis']);
  function compare(en: any, translated: any, path = '') {
    if (Array.isArray(en)) {
      assert.ok(Array.isArray(translated), path);
      assert.equal(translated.length, en.length, path);
      en.forEach((entry, index) => compare(entry, translated[index], `${path}/${index}`));
    } else if (en && typeof en === 'object') {
      assert.deepEqual(Object.keys(translated).sort(), Object.keys(en).sort(), path);
      for (const [key, value] of Object.entries(en)) {
        if (fixed.has(key)) assert.deepEqual(translated[key], value, `${path}/${key}`);
        else compare(value, translated[key], `${path}/${key}`);
      }
    } else {
      assert.equal(typeof translated, typeof en, path);
      if (typeof en === 'string') assert.ok(translated.trim(), path);
    }
  }
  compare(data, es);
  for (const section of ['projects', 'news', 'security']) {
    data[section].forEach((entry: any, index: number) => assert.notEqual(es[section][index].summary, entry.summary));
  }
});
