import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import { generateAlternates, generateOpenGraph, getFullUrl, localePrefix } from '@/lib/metadata';
import { JsonLd } from '@/lib/jsonld';
import { locales, type Locale } from '@/i18n/config';
import { getPeople, getPerson, personDescription, personJsonLd, personTitle } from '@/lib/people';
import PersonDetail from '@/components/people/PersonDetail';
import { ecosystemDataFor } from '@/lib/ecosystem-data';


type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  // A person's name is the same string in all seven locale datasets, so one
  // slug list is correct for every locale. Child params do not inherit the
  // parent segment's locale, so the locales are enumerated again here.
  const slugs = getPeople(ecosystemDataFor('en')).map(person => person.slug);
  return locales.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const person = getPerson(ecosystemDataFor(locale), slug);
  // A bare title on a miss, rather than notFound() here: the page component
  // below is what answers 404, and this only has to avoid composing metadata
  // for a record that does not exist.
  if (!person) return { title: 'Person Not Found' };
  const title = personTitle(person, locale);
  const description = personDescription(person, locale);
  return {
    title,
    description,
    // The slug is the kebab-cased name, which is locale invariant, so the
    // alternates are the plain per-locale form of one path.
    alternates: generateAlternates(`/people/${slug}`, locale as Locale),
    // No `type`: the helper offers 'website' and 'article', and this is
    // neither an article nor a profile the site owns, so the default stands.
    openGraph: generateOpenGraph({ title, description, path: `/people/${slug}`, locale: locale as Locale }),
  };
}

export default async function PersonPage({ params }: Props) {
  const { locale, slug } = await params;
  const person = getPerson(ecosystemDataFor(locale), slug);
  if (!person) notFound();

  const url = getFullUrl(`/people/${slug}`, locale as Locale);

  return (
    <>
      <JsonLd data={personJsonLd({ person, url, locale })} />
      <main>
        <PersonDetail person={person} locale={locale} pathPrefix={localePrefix(locale)} />
      </main>
    </>
  );
}

export const generateMetadata = withMetadataPolicy(pageMetadata);
