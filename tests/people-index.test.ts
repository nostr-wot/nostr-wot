import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getPeople, peopleCopy, peopleCrumbs, personCrumbs } from '../lib/people';
import { ecosystemDataFor } from '../lib/ecosystem-data';
import { ecosystemCopy } from '../lib/ecosystem-projects';
import { mergeProfileLinks, profileIdentity, profileLinkLabel, getPersonProfile } from '../lib/people-profiles';
import { pluralForm } from '../lib/plural';
import { locales } from '../i18n/config';
import PeopleIndex from '../components/people/PeopleIndex';
import PersonDetail from '../components/people/PersonDetail';

const render = (locale: string) => {
  const copy = peopleCopy(locale);
  const people = getPeople(ecosystemDataFor(locale));
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return {
    people,
    copy,
    prefix,
    html: renderToStaticMarkup(createElement(PeopleIndex, {
      people, locale, pathPrefix: prefix,
      labels: {
        heading: copy.breadcrumbPeople, intro: copy.index.intro, countLine: 'x',
        projects: copy.index.projectsLabel, breadcrumb: ecosystemCopy(locale, 'detail').breadcrumb,
      },
    } as never)),
  };
};

test('the index links to every credited person, so none of the pages is orphaned', () => {
  // WHY THIS EXISTS. Before the index, each person's page had exactly one
  // inbound link, inside a tab panel on a single project page. A crawler that
  // never opened that tab had no path to any of the 40.
  for (const locale of locales) {
    const { people, html, prefix } = render(locale);
    assert.ok(people.length >= 40, `${locale}: only ${people.length} people`);
    for (const person of people) {
      assert.ok(html.includes(`href="${prefix}/people/${person.slug}"`),
        `${locale}: no link to ${person.slug}`);
      assert.ok(html.includes(person.name), `${locale}: ${person.name} not named`);
    }
    // One link per person, not one per credit: fiatjaf holds six roles and is
    // one entry here.
    const links = html.match(new RegExp(`href="${prefix}/people/`, 'g')) ?? [];
    assert.equal(links.length, people.length, `${locale}: ${links.length} links for ${people.length} people`);
  }
});

test('the index names the projects behind each credit rather than only counting them', () => {
  const { people, html } = render('en');
  const fiatjaf = people.find(person => person.slug === 'fiatjaf')!;
  assert.ok(fiatjaf.roles.length > 1, 'fixture expects a multi-role person');
  for (const role of fiatjaf.roles) {
    assert.ok(html.includes(role.projectName), `${role.projectName} missing`);
  }
});

test('every person has an avatar or an initial, so no row sits out of line', () => {
  const { people, html } = render('en');
  const withImage = people.filter(person => getPersonProfile(person.name)?.avatar).length;
  // Only a handful publish a profile image; the rest fall back to an initial.
  assert.ok(withImage > 0 && withImage < people.length, `fixture expects a mix, got ${withImage}`);
  assert.equal((html.match(/<img /g) ?? []).length, withImage);
  // The placeholder is decorative: the name beside it already says who it is.
  const placeholders = html.match(/aria-hidden="true"[^>]*rounded-full/g) ?? [];
  assert.equal(placeholders.length, people.length - withImage);
});

test('the count line agrees with the data and inflects both nouns', () => {
  for (const locale of locales) {
    const copy = peopleCopy(locale);
    const people = getPeople(ecosystemDataFor(locale));
    const projects = new Set(people.flatMap(person => person.roles.map(role => role.projectId))).size;
    const line = copy.index.countLine
      .replace('{people}', String(people.length))
      .replace('{peopleWord}', pluralForm(locale, people.length, copy.peoplePlural))
      .replace('{projects}', String(projects))
      .replace('{projectsWord}', pluralForm(locale, projects, ecosystemCopy(locale).projectsPlural));
    assert.doesNotMatch(line, /[{}]/, `${locale}: unsubstituted placeholder in "${line}"`);
    assert.ok(line.includes(String(people.length)), `${locale}: people count missing`);
    assert.ok(line.includes(String(projects)), `${locale}: project count missing`);
    assert.doesNotMatch(line, /undefined/, `${locale}: ${line}`);
  }
});

test('the breadcrumb trail is translated and points at this locale on every level', () => {
  for (const locale of locales) {
    const { html, prefix } = render(locale);
    // React escapes `&`, `<`, `>` and `"` in attribute values, so the
    // expectation is escaped the same way rather than compared raw.
    const escaped = ecosystemCopy(locale, 'detail').breadcrumb
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    assert.ok(html.includes(`aria-label="${escaped}"`), `${locale}: nav label`);
    for (const crumb of peopleCrumbs(locale).slice(0, -1)) {
      assert.ok(html.includes(`href="${crumb.path || '/'}"`), `${locale}: ${crumb.path} not linked`);
    }
    // The last crumb is this page, so it is not a link.
    assert.ok(html.includes('aria-current="page"'), `${locale}: no current page marker`);
    assert.ok(!html.includes(`href="${prefix}/people"`), `${locale}: the current page links to itself`);
  }
});

test("a person's own page shows everything the profile record holds", () => {
  // Until this page read the profile record, it showed strictly LESS than the
  // card on a project page that links to it: no avatar, no self description,
  // no other projects, no talks and no Nostr profile link.
  const person = getPeople(ecosystemDataFor('en')).find(p => p.slug === 'hodlbod')!;
  const profile = getPersonProfile('hodlbod')!;
  assert.ok(profile.selfDescription && profile.alsoBuilt?.length && profile.talks?.length && profile.npub,
    'fixture expects a person with every optional field');

  const html = renderToStaticMarkup(createElement(PersonDetail, { person, locale: 'en', pathPrefix: '' } as never));
  assert.ok(html.includes(profile.selfDescription!.text), 'self description missing');
  assert.ok(html.includes(profile.selfDescription!.sourceUrl), 'self description source missing');
  // Their own words, in the language they wrote them, marked as a quotation.
  assert.match(html, /<blockquote lang="en"/);
  for (const built of profile.alsoBuilt!) {
    assert.ok(html.includes(built.name), `${built.name} missing`);
    assert.ok(html.includes(built.sourceUrl), `${built.name} source missing`);
  }
  for (const talk of profile.talks!) {
    assert.ok(html.includes(talk.url), `${talk.title} missing`);
  }
  // The npub goes to this site's own viewer, so it stays in the tab and is
  // crawlable.
  assert.ok(html.includes(`href="/profile/${profile.npub}"`), 'npub link missing');
  assert.ok(html.includes(`/images/people/${profile.avatar!.file.split('/').pop()}`), 'avatar missing');
});

test('one profile cited in several encodings is one link and one sameAs entry', async () => {
  const { personJsonLd } = await import('../lib/people');
  const person = getPeople(ecosystemDataFor('en')).find(p => p.slug === 'fiatjaf')!;

  // The dataset cites fiatjaf's Nostr profile three times: as an npub, as an
  // nprofile, and as a `nostr:`-prefixed nprofile. All three are the same
  // pubkey, and all three used to render as identical "Nostr" icons.
  const cited = person.roles.flatMap(role => role.profiles.map(profile => profile.url))
    .filter(url => url.includes('njump.me'));
  assert.ok(cited.length > 1, 'fixture expects several Nostr citations');
  assert.equal(new Set(cited.map(profileIdentity)).size, 1, 'the citations are not the same profile');

  const links = mergeProfileLinks(person.roles.map(role => role.profiles), getPersonProfile('fiatjaf')?.links);
  const labels = links.map(link => profileLinkLabel(link, ecosystemCopy('en').website));
  assert.equal(labels.length, new Set(labels).size, `duplicate labels: ${labels.join(' | ')}`);
  assert.equal(labels.filter(label => label === 'Nostr').length, 1);

  const graph = personJsonLd({ person, url: 'https://nostrwot.com/people/fiatjaf', locale: 'en' })[0] as { sameAs: string[] };
  assert.equal(graph.sameAs.length, new Set(graph.sameAs.map(profileIdentity)).size,
    `sameAs lists one profile more than once: ${graph.sameAs.join(', ')}`);
});

test('profileIdentity reads a public pointer and never a secret key', async () => {
  const npub = 'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6';
  const nprofile = 'nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpyfmhxue69uhkummnw3ez6an9wf5kv6t9vsh8wetvd3hhyer9wghxuet5fmsq8j';
  const identity = profileIdentity(`https://njump.me/${npub}`);
  assert.match(identity, /^nostr-pubkey:[0-9a-f]{64}$/);
  assert.equal(profileIdentity(`https://njump.me/${nprofile}`), identity);
  // The `nostr:` URI prefix is a spelling of the same pointer.
  assert.equal(profileIdentity(`https://njump.me/nostr:${nprofile}`), identity);

  // Any other host is identified by its URL: two pages on one site are two links.
  assert.equal(profileIdentity('https://fiatjaf.com'), 'https://fiatjaf.com');
  assert.equal(profileIdentity('https://github.com/fiatjaf'), 'https://github.com/fiatjaf');
  // Not a decodable pointer, so the URL stands rather than being guessed at.
  assert.equal(profileIdentity('https://njump.me/not-a-pointer'), 'https://njump.me/not-a-pointer');

  const { parsePublicPubkey } = await import('../lib/graph/parsePubkey');
  // A secret key is not a public pointer, whatever it is wrapped in.
  assert.equal(parsePublicPubkey('nsec1vl029mgpspedva04g90vltkh6fvh240zqtv9k0t9af8935ke9laqsnlfe5'), null);
  assert.equal(parsePublicPubkey('note1xxx'), null);
  assert.equal(parsePublicPubkey(''), null);
});

test('the crumb list the page renders is the crumb list the graph publishes', async () => {
  const { personJsonLd } = await import('../lib/people');
  for (const locale of locales) {
    const person = getPeople(ecosystemDataFor(locale))[0];
    const url = `https://nostrwot.com${locale === 'en' ? '' : `/${locale}`}/people/${person.slug}`;
    const graph = personJsonLd({ person, url, locale })[1] as { itemListElement: { name: string; item: string }[] };
    assert.deepEqual(
      graph.itemListElement.map(crumb => crumb.name),
      personCrumbs(person, locale).map(crumb => crumb.name), locale);
    assert.equal(graph.itemListElement.at(-1)!.item, url, `${locale}: the last crumb is not this page`);
  }
});
