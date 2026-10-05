import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { withMetadataPolicy } from '@/lib/metadata-policy';
import { generateAlternates, generateOpenGraph, getFullUrl } from '@/lib/metadata';
import { JsonLd } from '@/lib/jsonld';
import { locales, type Locale } from '@/i18n/config';
import { findProject } from '@/lib/ecosystem-projects';
import { getProjectSnapshot } from '@/lib/ecosystem-snapshot';
import { projectDescription, projectJsonLd, projectTitle } from '@/lib/project-seo';
import ProjectDetail from '@/components/projects/ProjectDetail';
import { ecosystemDataFor } from '@/lib/ecosystem-data';


type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateStaticParams() {
  // The seven locale datasets are asserted to carry identical, index-aligned
  // id lists, so one id list is correct for every locale.
  const ids = ecosystemDataFor('en').projects.map(project => project.id);
  return locales.flatMap(locale => ids.map(id => ({ locale, id })));
}

async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const project = findProject(ecosystemDataFor(locale), id);
  if (!project) return { title: 'Project Not Found' };
  const title = projectTitle(project, locale);
  const description = projectDescription(project, locale);
  return {
    title,
    description,
    alternates: generateAlternates(`/projects/${id}`, locale as Locale),
    // No `type`: this is an evidence record about a piece of software, not an
    // article. `article` carries authorship and publication semantics for the
    // TEXT, which this page does not have and does not claim. The person pages
    // omit it for the same reason, so the two are consistent.
    openGraph: generateOpenGraph({ title, description, path: `/projects/${id}`, locale: locale as Locale }),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, id } = await params;
  const data = ecosystemDataFor(locale);
  const project = findProject(data, id);
  if (!project) notFound();

  const url = getFullUrl(`/projects/${id}`, locale as Locale);
  const graphs = projectJsonLd({ project, snapshot: getProjectSnapshot(id), url, locale });

  return (
    <>
      <JsonLd data={graphs} />
      <main>
        <ProjectDetail project={project} data={data} locale={locale} />
      </main>
    </>
  );
}

export const generateMetadata = withMetadataPolicy(pageMetadata);
