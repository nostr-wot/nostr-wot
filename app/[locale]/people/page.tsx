import type { Metadata } from 'next';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import { generateAlternates, generateOpenGraph, getFullUrl, localePrefix } from '@/lib/metadata';
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/jsonld';
import { type Locale } from '@/i18n/config';
import { ecosystemDataFor } from '@/lib/ecosystem-data';
import { getPeople, peopleCopy, peopleCrumbs } from '@/lib/people';
import { pluralForm } from '@/lib/plural';
import { ecosystemCopy } from '@/lib/ecosystem-projects';
import PeopleIndex from '@/components/people/PeopleIndex';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostrwot.com';

type Props = { params: Promise<{ locale: string }> };

async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { index } = peopleCopy(locale);
  return {
    title: index.title,
    description: index.description,
    alternates: generateAlternates('/people', locale as Locale),
    openGraph: generateOpenGraph({ title: index.title, description: index.description, path: '/people', locale: locale as Locale }),
  };
}

export default async function PeoplePage({ params }: Props) {
  const { locale } = await params;
  const data = ecosystemDataFor(locale);
  const people = getPeople(data);
  const copy = peopleCopy(locale);
  const prefix = localePrefix(locale);
  const url = getFullUrl('/people', locale as Locale);

  // The projects a credit can point at, counted once each: a person credited
  // twice on one project does not make it two projects.
  const projectCount = new Set(people.flatMap(person => person.roles.map(role => role.projectId))).size;
  const countLine = copy.index.countLine
    .replace('{people}', String(people.length))
    .replace('{peopleWord}', pluralForm(locale, people.length, copy.peoplePlural))
    .replace('{projects}', String(projectCount))
    .replace('{projectsWord}', pluralForm(locale, projectCount, ecosystemCopy(locale).projectsPlural));

  return (
    <>
      <JsonLd data={[
        collectionPageJsonLd({
          name: copy.index.title,
          description: copy.index.description,
          url,
          // Named `Person` entries, so the list states what it lists rather
          // than being an untyped set of links.
          items: people.map(person => ({ name: person.name, url: getFullUrl(`/people/${person.slug}`, locale as Locale) })),
        }),
        // The same list the page renders, so the two cannot drift.
        breadcrumbJsonLd(peopleCrumbs(locale).map(crumb => ({ name: crumb.name, url: `${BASE_URL}${crumb.path}` }))),
      ]} />
      <main>
        <PeopleIndex
          people={people}
          locale={locale}
          pathPrefix={prefix}
          labels={{
            heading: copy.breadcrumbPeople,
            intro: copy.index.intro,
            countLine,
            projects: copy.index.projectsLabel,
            breadcrumb: ecosystemCopy(locale, 'detail').breadcrumb,
          }}
        />
      </main>
    </>
  );
}

export const generateMetadata = withMetadataPolicy(pageMetadata);
