'use client';

import { localePrefix } from '@/lib/metadata';
import { useMemo, useState } from 'react';
import { coverageLabel, ecosystemCopy, projectCountLine, ecosystemDate, isCommitDate, reportTypeLabel, dateBasisLabel, categoryLabel, newsDateLabel, filterProjects, isSafeExternalUrl, PROJECT_STATUSES, type EcosystemData, type EcosystemNews, type EcosystemProject } from '@/lib/ecosystem-projects';
import { ExternalLink, focus } from './shared';
import ProjectCard from './ProjectCard';

function NewsPanel({ title, items, locale }: { title: string; items: EcosystemNews[]; locale: string }) {
  const t = ecosystemCopy(locale);
  if (!items.length) return null;
  return <section className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t.reportsNotice}</p>
    <ul className="mt-5 space-y-6">{[...items].sort((a, b) => b.date.localeCompare(a.date)).map((item, index) => <li key={`${item.url}-${index}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        {item.type && <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold dark:bg-gray-800">{reportTypeLabel(item.type, locale)}</span>}
        <span>{newsDateLabel(item.dateBasis, locale)}: <time dateTime={item.date}>{ecosystemDate(item.date, locale)}</time></span>
      </div>
      <h3 className="mt-1 font-semibold"><ExternalLink locale={locale} url={item.url}>{item.title}</ExternalLink></h3>
      <details className="mt-2 text-sm">
        <summary className={`cursor-pointer rounded py-1 ${focus}`}>{t.summaryEvidence}<span className="sr-only"> {t.for} {item.title}</span></summary>
        <div className="mt-2 space-y-2 text-gray-600 dark:text-gray-300">
          <p>{item.summary}</p>
          {item.coverage && <p><strong>{t.coverage}</strong> {coverageLabel(item.coverage, locale)}</p>}
          {item.dateBasis && <p><strong>{t.dateBasis}</strong> {dateBasisLabel(item.dateBasis, locale)}{isCommitDate(item.dateBasis) && t.commitNotice}</p>}
          {!!item.sources?.length && <ul className="space-y-2">{item.sources.map((source, i) => <li key={`${source.url}-${i}`}><ExternalLink locale={locale} url={source.url}>{source.label}</ExternalLink></li>)}</ul>}
        </div>
      </details>
    </li>)}</ul>
  </section>;
}

export default function EcosystemDirectory({ data, blogHref, newsHref, peopleLink, locale = 'en' }: { data: EcosystemData; blogHref: string; newsHref: string; peopleLink: { href: string; label: string }; locale?: string }) {
  const t = ecosystemCopy(locale);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const categories = useMemo(() => [...new Set(data.projects.map(project => project.category))].sort(), [data.projects]);
  const projects = useMemo(() => filterProjects(data.projects, { query, category, status }), [data.projects, query, category, status]);
  const control = `mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base dark:border-gray-700 dark:bg-gray-900 ${focus}`;
  return <div lang={locale} className="mx-auto max-w-6xl px-6 py-12">
    <section aria-labelledby="ecosystem-heading">
      <h2 id="ecosystem-heading" className="text-3xl font-bold">{t.heading}</h2>
      <p className="mt-3 max-w-3xl text-gray-600 dark:text-gray-300">{t.intro}</p>
      {/* The people credited here each had one inbound link, inside a tab panel
          on one project page. This is the directory's path to the hub that
          lists them all. The label is passed in rather than read from
          `peopleCopy`, so this client component does not pull seven more
          message files into the browser bundle. */}
      <p className="mt-3 text-sm">
        <a className={`rounded underline underline-offset-4 hover:text-primary ${focus}`} href={peopleLink.href}>{peopleLink.label}</a>
      </p>
      <div role="search" aria-label={t.searchRegion} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <label className="text-sm font-medium" htmlFor="project-search">{t.search}<input id="project-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t.placeholder} className={control} /></label>
        <label className="text-sm font-medium" htmlFor="project-category">{t.category}<select id="project-category" value={category} onChange={event => setCategory(event.target.value)} className={control}><option value="">{t.allCategories}</option>{categories.map(value => <option key={value} value={value}>{categoryLabel(value, locale)}</option>)}</select></label>
        <label className="text-sm font-medium" htmlFor="project-status">{t.status}<select id="project-status" value={status} onChange={event => setStatus(event.target.value)} className={control}><option value="">{t.allStatuses}</option>{PROJECT_STATUSES.map(value => <option key={value} value={value}>{t.statuses[value]}</option>)}</select></label>
      </div>
      <div className="my-5 flex min-h-10 flex-wrap items-center justify-between gap-3 text-sm">
        <p role="status" aria-live="polite" aria-atomic="true">{projectCountLine(projects.length, data.projects.length, locale)}</p>
        {(query || category || status) && <button type="button" className={`rounded px-3 py-2 underline ${focus}`} onClick={() => { setQuery(''); setCategory(''); setStatus(''); document.getElementById('project-search')?.focus(); }}>{t.clear}</button>}
      </div>
      {projects.length ? <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{projects.map((project, index) => (
        // CSS-only entrance, not ScrollReveal: the cards are the content a
        // crawler and a no-JS reader came for, and ScrollReveal would ship them
        // as inline opacity:0 until an observer fired. The delay is capped to
        // the row, so each row cascades over 180ms rather than the last card
        // waiting on all forty before it.
        <div
          key={project.id}
          className="reveal-in h-full"
          style={{ animationDelay: `${(index % 4) * 60}ms` }}
        >
          <ProjectCard locale={locale} project={project} projectHref={`${localePrefix(locale)}/projects/${project.id}`} />
        </div>
      ))}</div> : <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">{data.projects.length ? t.noMatches : t.empty}</p>}
    </section>
    {(data.news.length > 0 || data.security.length > 0) && <div className="mt-12 grid items-start gap-6 md:grid-cols-2"><NewsPanel locale={locale} title={t.newsTitle} items={data.news} /><NewsPanel locale={locale} title={t.securityTitle} items={data.security} /></div>}
    {/* How this directory is maintained. It belongs after the records it
        describes, not above them, where it pushed the projects below the fold. */}
    <aside className="mt-12 rounded-xl bg-gray-50 p-5 dark:bg-gray-900">
      <h3 className="font-semibold">{t.roundup}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t.roundupStart} <a className={`rounded underline ${focus}`} href={blogHref}>{t.blog}</a> {t.roundupMiddle} <a className={`rounded underline ${focus}`} href={newsHref}>{t.newsroom}</a> {t.roundupEnd}</p>
    </aside>
  </div>;
}
