'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { categoryLabel, newsDateLabel, filterProjects, isSafeExternalUrl, PROJECT_STATUSES, type EcosystemData, type EcosystemNews, type EcosystemProject } from '@/lib/ecosystem-projects';

const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950';
const statusStyles = {
  active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  beta: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  archived: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  unknown: 'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200',
};

function ExternalLink({ url, children }: { url: string; children: ReactNode }) {
  return isSafeExternalUrl(url)
    ? <a href={url} className={`rounded underline underline-offset-4 hover:text-primary break-words ${focus}`}>{children}</a>
    : <span>{children} (link unavailable)</span>;
}

function ProjectCard({ project }: { project: EcosystemProject }) {
  const evidencedPeople = project.people.filter(person => isSafeExternalUrl(person.sourceUrl));
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-gray-600 dark:text-gray-300">{categoryLabel(project.category)}</span>
        <span className={`rounded-full px-3 py-1 font-semibold capitalize ${statusStyles[project.status]}`}>{project.status}</span>
      </div>
      <h3 className="mt-4 text-xl font-bold">{project.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{project.summary}</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
        {project.website && <ExternalLink url={project.website}>Website<span className="sr-only"> for {project.name}</span></ExternalLink>}
        {project.repository && <ExternalLink url={project.repository}>Repository<span className="sr-only"> for {project.name}</span></ExternalLink>}
      </div>
      <details className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-800">
        <summary className={`cursor-pointer rounded py-1 text-sm font-semibold ${focus}`}>People, status &amp; sources<span className="sr-only"> for {project.name}</span></summary>
        <div className="mt-4 space-y-4 text-sm leading-relaxed">
          <p><strong>Status evidence:</strong> {project.statusNote || 'Not verified.'}</p>
          <div>
            <h4 className="font-semibold">People</h4>
            {!evidencedPeople.some(person => person.role === 'founder') && <p className="mt-1 text-gray-600 dark:text-gray-300">Founder: not verified.</p>}
            {evidencedPeople.length > 0 && <ul className="mt-2 space-y-3">{evidencedPeople.map((person, index) => (
              <li key={`${person.name}-${index}`}>
                <p><strong>{person.name}</strong> <span className="capitalize">· {person.role}</span></p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
                  <ExternalLink url={person.sourceUrl}>Role evidence<span className="sr-only"> for {person.name}</span></ExternalLink>
                  {person.profiles.map((profile, i) => <ExternalLink key={`${profile.url}-${i}`} url={profile.url}>{profile.label}<span className="sr-only"> for {person.name}</span></ExternalLink>)}
                </div>
              </li>
            ))}</ul>}
          </div>
          {project.latestUpdate && <p><strong>Latest recorded update:</strong> <time dateTime={project.latestUpdate.date}>{project.latestUpdate.date}</time> · <ExternalLink url={project.latestUpdate.url}>{project.latestUpdate.title}</ExternalLink></p>}
          <div>
            <h4 className="font-semibold">Sources</h4>
            {project.sources.length ? <ul className="mt-1 space-y-2">{project.sources.map((source, index) => <li key={`${source.url}-${index}`}><ExternalLink url={source.url}>{source.label}</ExternalLink></li>)}</ul> : <p>Sources not yet recorded.</p>}
          </div>
          <p className="text-gray-600 dark:text-gray-300">Last checked: {project.lastVerified ? <time dateTime={project.lastVerified}>{project.lastVerified}</time> : 'not verified'}. Status reflects the cited evidence at that time.</p>
        </div>
      </details>
    </article>
  );
}

function NewsPanel({ title, items }: { title: string; items: EcosystemNews[] }) {
  if (!items.length) return null;
  return <section className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Selected reports from cited sources; this is not a complete incident or industry record.</p>
    <ul className="mt-5 space-y-6">{[...items].sort((a, b) => b.date.localeCompare(a.date)).map((item, index) => <li key={`${item.url}-${index}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        {item.type && <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold dark:bg-gray-800">{categoryLabel(item.type)}</span>}
        <span>{newsDateLabel(item.dateBasis)}: <time dateTime={item.date}>{item.date}</time></span>
      </div>
      <h3 className="mt-1 font-semibold"><ExternalLink url={item.url}>{item.title}</ExternalLink></h3>
      <details className="mt-2 text-sm">
        <summary className={`cursor-pointer rounded py-1 ${focus}`}>Summary &amp; evidence<span className="sr-only"> for {item.title}</span></summary>
        <div className="mt-2 space-y-2 text-gray-600 dark:text-gray-300">
          <p>{item.summary}</p>
          {item.coverage && <p><strong>Coverage:</strong> {item.coverage}</p>}
          {item.dateBasis && <p><strong>Date basis:</strong> {item.dateBasis}{newsDateLabel(item.dateBasis) === 'Commit date' && ' — a commit date, not a verified release date.'}</p>}
          {!!item.sources?.length && <ul className="space-y-2">{item.sources.map((source, i) => <li key={`${source.url}-${i}`}><ExternalLink url={source.url}>{source.label}</ExternalLink></li>)}</ul>}
        </div>
      </details>
    </li>)}</ul>
  </section>;
}

export default function EcosystemDirectory({ data, blogHref, newsHref }: { data: EcosystemData; blogHref: string; newsHref: string }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const categories = useMemo(() => [...new Set(data.projects.map(project => project.category))].sort(), [data.projects]);
  const projects = useMemo(() => filterProjects(data.projects, { query, category, status }), [data.projects, query, category, status]);
  const control = `mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base dark:border-gray-700 dark:bg-gray-900 ${focus}`;
  return <div lang="en" className="mx-auto max-w-6xl px-6 py-12">
    <section aria-labelledby="ecosystem-heading">
      <p className="text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">Curated content · English</p>
      <h2 id="ecosystem-heading" className="mt-3 text-3xl font-bold">Explore the Nostr ecosystem</h2>
      <p className="mt-3 max-w-3xl text-gray-600 dark:text-gray-300">Discover projects, their current status and the people behind them. Inclusion in this directory does not imply a Nostr WoT integration or endorsement.</p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Directory checked: <time dateTime={data.checkedAt}>{data.checkedAt}</time>. Expand a project to inspect its evidence. Unknown means status could not be verified.</p>
      <div className="mt-6 rounded-xl bg-gray-50 p-5 dark:bg-gray-900">
        <h3 className="font-semibold">Fortnightly new-project roundup</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">The planned editorial cadence is every two weeks, covering new projects and notable updates. Browse the <a className={`rounded underline ${focus}`} href={blogHref}>blog</a> for published articles and the <a className={`rounded underline ${focus}`} href={newsHref}>newsroom</a> for industry reporting.</p>
      </div>
      <div role="search" aria-label="Search ecosystem projects" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <label className="text-sm font-medium" htmlFor="project-search">Search projects or people<input id="project-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, description or person" className={control} /></label>
        <label className="text-sm font-medium" htmlFor="project-category">Category<select id="project-category" value={category} onChange={event => setCategory(event.target.value)} className={control}><option value="">All categories</option>{categories.map(value => <option key={value} value={value}>{categoryLabel(value)}</option>)}</select></label>
        <label className="text-sm font-medium" htmlFor="project-status">Status<select id="project-status" value={status} onChange={event => setStatus(event.target.value)} className={control}><option value="">All statuses</option>{PROJECT_STATUSES.map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
      </div>
      <div className="my-5 flex min-h-10 flex-wrap items-center justify-between gap-3 text-sm">
        <p role="status" aria-live="polite" aria-atomic="true">{projects.length} of {data.projects.length} projects</p>
        {(query || category || status) && <button type="button" className={`rounded px-3 py-2 underline ${focus}`} onClick={() => { setQuery(''); setCategory(''); setStatus(''); }}>Clear filters</button>}
      </div>
      {projects.length ? <div className="grid items-start gap-5 md:grid-cols-2">{projects.map(project => <ProjectCard key={project.id} project={project} />)}</div> : <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">{data.projects.length ? 'No projects match these filters. Try another search or clear the filters.' : 'The researched directory is being prepared. Project entries will appear here once their sources have been checked.'}</p>}
    </section>
    {(data.news.length > 0 || data.security.length > 0) && <div className="mt-12 grid items-start gap-6 md:grid-cols-2"><NewsPanel title="Recent ecosystem news" items={data.news} /><NewsPanel title="Security reports" items={data.security} /></div>}
  </div>;
}
