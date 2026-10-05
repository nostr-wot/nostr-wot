import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ecosystemDataFor } from '../lib/ecosystem-data';
import { ecosystemJsonLd } from '../lib/ecosystem-projects';
import { projectJsonLd, schemaApplicationCategory } from '../lib/project-seo';
import { getProjectSnapshot } from '../lib/ecosystem-snapshot';
import { locales } from '../i18n/config';

const BASE = 'https://nostrwot.com';
const urlFor = (locale: string, id: string) => `${BASE}${locale === 'en' ? '' : `/${locale}`}/projects/${id}`;
const graphsFor = (locale: string, id: string) => {
  const project = ecosystemDataFor(locale).projects.find(p => p.id === id)!;
  return projectJsonLd({ project, snapshot: getProjectSnapshot(id), url: urlFor(locale, id), locale }) as Record<string, unknown>[];
};
const nodeOf = (graphs: Record<string, unknown>[], type: string) =>
  graphs.find(node => node['@type'] === type)!;

test('every dataset category maps to a schema.org application category', () => {
  const categories = new Set(ecosystemDataFor('en').projects.map(project => project.category));
  assert.ok(categories.size > 5, `only ${categories.size} categories found`);
  for (const category of categories) {
    const mapped = schemaApplicationCategory(category);
    assert.ok(mapped, `${category} has no schema.org applicationCategory mapping`);
    // Schema.org's documented values all end in "Application" except "Game",
    // which this directory has none of.
    assert.match(mapped, /Application$/, `${category} -> ${mapped}`);
  }
});

test('the machine-readable classification does not change with the page locale', () => {
  // It used to emit the TRANSLATED label, so one program was a "Social client"
  // to a crawler reading English and "Cliente social" to one reading Spanish.
  for (const id of ['damus', 'amber', 'khatru', 'zeus']) {
    const values = locales.map(locale => {
      const application = nodeOf(graphsFor(locale, id), 'SoftwareApplication');
      return `${application.applicationCategory}/${application.applicationSubCategory}`;
    });
    assert.equal(new Set(values).size, 1, `${id} is classified ${new Set(values).size} different ways: ${[...new Set(values)].join(', ')}`);
  }
});

test('inLanguage describes the page, never the software', () => {
  for (const locale of locales) {
    const graphs = graphsFor(locale, 'damus');
    const application = nodeOf(graphs, 'SoftwareApplication');
    const page = nodeOf(graphs, 'WebPage');
    // The program is not published in seven languages; the pages are.
    assert.ok(!('inLanguage' in application),
      `${locale}: the SoftwareApplication claims to be in a language`);
    assert.equal(page.inLanguage, locale, `${locale}: the WebPage does not state its language`);
  }
});

test('the page node and the software node are distinct and joined', () => {
  const url = urlFor('en', 'damus');
  const graphs = graphsFor('en', 'damus');
  const application = nodeOf(graphs, 'SoftwareApplication');
  const page = nodeOf(graphs, 'WebPage');

  assert.equal(page['@id'], url, 'the page node is not identified by its URL');
  assert.equal(application['@id'], `${url}#software`, 'the software node has no fragment id of its own');
  assert.notEqual(page['@id'], application['@id'], 'the page and the program are one node');
  // Joined in both directions, so a consumer reading either reaches the other.
  assert.deepEqual(page.about, { '@id': `${url}#software` });
  assert.deepEqual(application.mainEntityOfPage, { '@id': url });
});

test('the directory hub lists programs, and each one joins its own page graph', () => {
  const data = ecosystemDataFor('en');
  const hub = ecosystemJsonLd(data, `${BASE}/projects`, 'en') as unknown as {
    mainEntity: { numberOfItems: number; itemListElement: { position: number; item: Record<string, string> }[] };
  };
  const items = hub.mainEntity.itemListElement;
  assert.equal(items.length, data.projects.length);
  assert.equal(hub.mainEntity.numberOfItems, data.projects.length);

  for (const [index, entry] of items.entries()) {
    const project = data.projects[index];
    assert.equal(entry.position, index + 1);
    // `CreativeWork` said nothing: every entry in this directory is a program.
    assert.equal(entry.item['@type'], 'SoftwareApplication', project.id);
    // The same id the project's own page gives its software node, so the two
    // graphs describe one thing rather than two unrelated ones.
    const own = nodeOf(graphsFor('en', project.id), 'SoftwareApplication');
    assert.equal(entry.item['@id'], own['@id'], `${project.id}: the hub and the page disagree on its id`);
  }
});

test('the graph states no date, licence or version the record does not hold', () => {
  for (const project of ecosystemDataFor('en').projects) {
    const snapshot = getProjectSnapshot(project.id);
    const application = nodeOf(graphsFor('en', project.id), 'SoftwareApplication');

    if (!snapshot?.license) assert.ok(!('license' in application), `${project.id}: invented a licence`);
    if (!snapshot?.language) assert.ok(!('programmingLanguage' in application), `${project.id}: invented a language`);
    // `datePublished` is the researched launch date, falling back to the
    // repository creation date, and is absent when there is neither.
    const expected = project.story?.launched ?? snapshot?.createdAt;
    assert.equal(application.datePublished, expected, `${project.id}: datePublished`);
    if (!snapshot?.releases.some(release => !release.prerelease)) {
      assert.ok(!('softwareVersion' in application), `${project.id}: a prerelease is not a version`);
    }
  }
});
