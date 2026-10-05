import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const locales = ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de'] as const;
const read = (locale: string) => JSON.parse(readFileSync(
  new URL(`../data/ecosystem-projects${locale === 'en' ? '' : `.${locale}`}.json`, import.meta.url), 'utf8'));

type Story = {
  launched?: string;
  launchedNote?: string;
  launchedSourceUrl?: string;
  nameOrigin?: { text: string; sourceUrl: string };
  motivation?: { text: string; sourceUrl: string };
  milestones?: { date: string; title: string; sourceUrl: string }[];
};
type Project = { id: string; story?: Story };

/** Each date carries the precision its source gives. Ten launch dates are known
 * only to the month, and one to the year, so a day is never invented. */
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

const storyUrls = (story: Story) => [
  story.launchedSourceUrl, story.nameOrigin?.sourceUrl, story.motivation?.sourceUrl,
  ...(story.milestones ?? []).map(milestone => milestone.sourceUrl),
].filter((url): url is string => Boolean(url));

const storyProse = (story: Story) => [
  story.launchedNote, story.nameOrigin?.text, story.motivation?.text,
  ...(story.milestones ?? []).map(milestone => milestone.title),
].filter((text): text is string => Boolean(text));

test('every story claim carries a publishable https source', () => {
  for (const locale of locales) {
    for (const project of read(locale).projects as Project[]) {
      if (!project.story) continue;
      // A claim without a source is the one thing this directory must never
      // publish, so presence is asserted field by field rather than in bulk.
      if (project.story.launched) {
        assert.ok(project.story.launchedSourceUrl, `${locale}/${project.id}: launch date with no source`);
      }
      for (const field of ['nameOrigin', 'motivation'] as const) {
        const claim = project.story[field];
        if (!claim) continue;
        assert.ok(claim.text?.trim(), `${locale}/${project.id}: empty ${field}`);
        assert.ok(claim.sourceUrl, `${locale}/${project.id}: ${field} with no source`);
      }
      for (const milestone of project.story.milestones ?? []) {
        assert.ok(milestone.title?.trim(), `${locale}/${project.id}: empty milestone title`);
        assert.ok(milestone.sourceUrl, `${locale}/${project.id}: milestone with no source`);
      }
      for (const url of storyUrls(project.story)) {
        assert.match(url, /^https:\/\//, `${locale}/${project.id}: ${url} is not https`);
        assert.doesNotMatch(url, /\s/, `${locale}/${project.id}: whitespace in ${url}`);
      }
    }
  }
});

test('every story date is real, carries only the precision its source gives, and is not in the future', () => {
  const checkedAt: string = read('en').checkedAt;
  for (const locale of locales) {
    for (const project of read(locale).projects as Project[]) {
      if (!project.story) continue;
      const dates = [
        project.story.launched,
        ...(project.story.milestones ?? []).map(milestone => milestone.date),
      ].filter((date): date is string => Boolean(date));
      for (const date of dates) {
        assert.match(date, DATE, `${locale}/${project.id}: ${date} is not a date`);
        assert.ok(date.slice(0, 10) <= checkedAt,
          `${locale}/${project.id}: ${date} is after the directory was checked (${checkedAt})`);
        if (date.length === 10) {
          const parsed = new Date(`${date}T00:00:00Z`);
          assert.ok(!Number.isNaN(parsed.getTime()), `${locale}/${project.id}: ${date} is not a calendar date`);
          assert.equal(parsed.toISOString().slice(0, 10), date, `${locale}/${project.id}: ${date} does not round-trip`);
        }
      }
    }
  }
});

test('the seven datasets agree on every story fact, and differ only in prose', () => {
  const english = read('en').projects as Project[];
  for (const locale of locales.slice(1)) {
    const translated = new Map((read(locale).projects as Project[]).map(project => [project.id, project]));
    for (const source of english) {
      const target = translated.get(source.id);
      assert.ok(target, `${locale}: ${source.id} missing`);
      // Whether a project HAS a story is a fact about the sources, not about
      // the language, so it cannot differ per locale.
      assert.equal(Boolean(target.story), Boolean(source.story), `${locale}/${source.id}: story presence differs`);
      if (!source.story || !target.story) continue;

      assert.deepEqual(Object.keys(target.story).sort(), Object.keys(source.story).sort(),
        `${locale}/${source.id}: story fields differ`);
      assert.equal(target.story.launched, source.story.launched, `${locale}/${source.id}: launch date differs`);
      // Dates and URLs are copied from the English record rather than from the
      // translation, so a translator cannot move a date or repoint a citation.
      assert.deepEqual(storyUrls(target.story), storyUrls(source.story), `${locale}/${source.id}: sources differ`);
      assert.deepEqual(
        (target.story.milestones ?? []).map(milestone => milestone.date),
        (source.story.milestones ?? []).map(milestone => milestone.date),
        `${locale}/${source.id}: milestone dates differ`);

      // The prose, by contrast, must actually be translated.
      for (const [index, text] of storyProse(target.story).entries()) {
        assert.ok(text.trim(), `${locale}/${source.id}: empty prose at ${index}`);
      }
    }
  }
});

test('no story copy carries an em dash, in any locale', () => {
  for (const locale of locales) {
    for (const project of read(locale).projects as Project[]) {
      if (!project.story) continue;
      for (const text of storyProse(project.story)) {
        assert.doesNotMatch(text, /—/, `${locale}/${project.id}: em dash in story copy: ${text}`);
      }
    }
  }
});

test('the story is researched for every project, and the one project with nothing found says so in the research log', () => {
  const projects = read('en').projects as Project[];
  const without = projects.filter(project => !project.story).map(project => project.id);
  // Measured on the 2026-10-04 research pass. A project with no story at all is
  // one where no launch announcement, no explanation of the name and no
  // statement of motivation exists anywhere. If this list grows, the new entry
  // needs a line in the research log too.
  assert.deepEqual(without, ['go-nostr']);
  const log = readFileSync(new URL('../docs/ecosystem-story-research.md', import.meta.url), 'utf8');
  for (const id of without) {
    assert.ok(log.includes(`\`${id}\``),
      `${id} has no story and no line in docs/ecosystem-story-research.md explaining what was not found`);
  }
  // The name is the field the research refused most often, and that refusal is
  // the point: an unsourced etymology is an invention.
  const named = projects.filter(project => project.story?.nameOrigin).length;
  assert.equal(named, 6, 'the number of projects that publish an explanation of their own name changed');
});

test('ecosystemDate renders each precision with only the fields it has', async () => {
  const { ecosystemDate } = await import('../lib/ecosystem-projects');
  // English is passed through as the ISO string the dataset carries.
  assert.equal(ecosystemDate('2023-01-31', 'en'), '2023-01-31');
  assert.equal(ecosystemDate('2023-10', 'en'), '2023-10');

  // A month-precision date must never gain a day it does not have.
  assert.equal(ecosystemDate('2023-10', 'es'), 'octubre de 2023');
  assert.equal(ecosystemDate('2023-10', 'de'), 'Oktober 2023');
  assert.doesNotMatch(ecosystemDate('2023-10', 'es'), /\b1\b/);
  assert.doesNotMatch(ecosystemDate('2023-10', 'fr'), /\b1(er)?\b/);

  assert.equal(ecosystemDate('2023-01-31', 'de'), '31. Januar 2023');
  // A year stands on its own in every locale.
  assert.equal(ecosystemDate('2022', 'ru'), '2022');
  // Russian long dates end in "г.", which put a double stop in any sentence
  // that punctuates after a date.
  assert.doesNotMatch(ecosystemDate('2023-01-31', 'ru'), /г\.$/u);
  // Anything that is not a date is returned untouched rather than guessed at.
  assert.equal(ecosystemDate('not a date', 'de'), 'not a date');
});

test('the story section renders every claim with the link that evidences it', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: ProjectStory } = await import('../components/projects/ProjectStory');
  const { ecosystemDetail } = await import('../lib/project-seo');

  const d = ecosystemDetail('en');
  const labels = {
    heading: d.storyHeading, launched: d.launchedLabel, nameOrigin: d.nameOriginLabel,
    motivation: d.motivationLabel, milestones: d.milestonesLabel,
    nothingFound: d.storyNothingFound, source: d.source,
  };
  const project = (read('en').projects as Project[]).find(p => p.id === 'haven')!;
  const html = renderToStaticMarkup(createElement(ProjectStory, { project, locale: 'en', labels } as never));

  assert.ok(html.includes(d.storyHeading), 'heading missing');
  // haven is the project that carries all four kinds of claim.
  for (const label of [d.launchedLabel, d.nameOriginLabel, d.motivationLabel, d.milestonesLabel]) {
    assert.ok(html.includes(label), `${label} missing`);
  }
  // Each claim's own source is linked, and outbound links keep the directory's
  // policy: a new tab, nofollow, and noopener to make the new tab safe.
  for (const url of storyUrls(project.story!)) {
    assert.ok(html.includes(`href="${url}"`), `source ${url} is not linked`);
  }
  const links = html.match(/<a [^>]*>/g) ?? [];
  assert.equal(links.length, storyUrls(project.story!).length, 'unexpected number of links');
  for (const link of links) {
    assert.match(link, /target="_blank"/, link);
    assert.match(link, /rel="nofollow noopener"/, link);
  }
  // The date is machine readable at whatever precision it carries. React emits
  // the attribute as `dateTime`, which HTML parses the same way because
  // attribute names are case insensitive, so the match ignores case.
  assert.match(html, new RegExp(`<time datetime="${project.story!.launched}"`, 'i'),
    'launch date is not a <time>');
  // A source link butted straight against a milestone title read as part of the
  // sentence ("recorded in the project changelog Source"), so each one is
  // separated.
  assert.doesNotMatch(html, /[\p{L}\p{N}]<a /u, 'a source link is not separated from the text before it');
});

test('a project with nothing published says so instead of rendering an empty story', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: ProjectStory } = await import('../components/projects/ProjectStory');
  const { ecosystemDetail } = await import('../lib/project-seo');

  const d = ecosystemDetail('en');
  const labels = {
    heading: d.storyHeading, launched: d.launchedLabel, nameOrigin: d.nameOriginLabel,
    motivation: d.motivationLabel, milestones: d.milestonesLabel,
    nothingFound: d.storyNothingFound, source: d.source,
  };
  const project = (read('en').projects as Project[]).find(p => p.id === 'go-nostr')!;
  assert.equal(project.story, undefined, 'go-nostr gained a story; update this test and the research log');
  const html = renderToStaticMarkup(createElement(ProjectStory, { project, locale: 'en', labels } as never));
  assert.ok(html.includes(d.storyNothingFound), 'the notice is missing');
  assert.ok(!html.includes(d.milestonesLabel), 'an empty milestones label was rendered');
  assert.ok(!html.includes('<a '), 'a link was rendered with no claim behind it');
});

test('the infobox states only facts the record holds, and omits the rows it has nothing for', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: ProjectInfobox } = await import('../components/projects/ProjectInfobox');
  const { ecosystemDetail } = await import('../lib/project-seo');
  const { getProjectSnapshot } = await import('../lib/ecosystem-snapshot');

  const d = ecosystemDetail('en');
  const labels = {
    quickFacts: d.quickFacts, category: d.categoryFact, status: d.statusFact,
    launched: d.launchedLabel, license: d.license, primaryLanguage: d.primaryLanguage,
    latestRelease: d.latestRelease, firstPublished: d.firstPublished, lastPush: d.lastPush,
    topics: d.topics, renamedFrom: d.renamedFrom, peopleCredited: d.peopleCredited,
    lastChecked: d.lastCheckedFact, notStated: d.notStated,
  };
  const projects = read('en').projects as Project[];

  const haven = projects.find(p => p.id === 'haven')!;
  const html = renderToStaticMarkup(createElement(ProjectInfobox, {
    project: haven, snapshot: getProjectSnapshot('haven'), locale: 'en', peopleCount: 1, labels,
  } as never));
  assert.ok(html.includes(d.quickFacts), 'heading missing');
  for (const label of [d.categoryFact, d.statusFact, d.launchedLabel, d.license, d.primaryLanguage]) {
    assert.ok(html.includes(label), `${label} missing`);
  }
  // A `<dl>`, so the pairing of term and value is in the markup rather than
  // only in the layout.
  assert.match(html, /<dl[\s>]/);
  assert.equal((html.match(/<dt[\s>]/g) ?? []).length, (html.match(/<dd[\s>]/g) ?? []).length,
    'every term needs exactly one value');

  // No snapshot and nobody credited: the repository rows and the people row are
  // absent rather than rendered with a placeholder.
  const bare = renderToStaticMarkup(createElement(ProjectInfobox, {
    project: haven, snapshot: undefined, locale: 'en', peopleCount: 0, labels,
  } as never));
  for (const label of [d.license, d.primaryLanguage, d.firstPublished, d.lastPush, d.peopleCredited]) {
    assert.ok(!bare.includes(label), `${label} was rendered with nothing behind it`);
  }
  // The two facts that never depend on the snapshot are still there.
  assert.ok(bare.includes(d.categoryFact) && bare.includes(d.statusFact));
});

test('the overview tab states each repository fact once', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: ProjectDetail } = await import('../components/projects/ProjectDetail');
  const { ecosystemDetail } = await import('../lib/project-seo');

  const d = ecosystemDetail('en');
  const data = read('en');
  const project = (data.projects as Project[]).find(p => p.id === 'haven')!;
  const html = renderToStaticMarkup(createElement(ProjectDetail, {
    project, data, locale: 'en', directoryHref: '/projects',
  } as never));

  // The licence, language and repository dates were a prose list a few lines
  // above the infobox that now holds them. Printing both put every one of these
  // on the page twice.
  for (const label of [d.license, d.primaryLanguage, d.firstPublished, d.lastPush, d.quickFacts]) {
    const count = html.split(label).length - 1;
    assert.equal(count, 1, `"${label}" appears ${count} times on the overview tab`);
  }
});
