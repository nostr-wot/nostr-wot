import { localePrefix } from '@/lib/metadata';
import { categoryLabel, ecosystemCopy, ecosystemDate, relatedReports, splitLabelNote, type EcosystemData, type EcosystemNews, type EcosystemProject, isSafeExternalUrl } from '@/lib/ecosystem-projects';
import { ecosystemDetail, projectCrumbs } from '@/lib/project-seo';
import { getProjectSnapshot, snapshotGeneratedAt, type ProjectSnapshot } from '@/lib/ecosystem-snapshot';
import { ExternalIconLink, ExternalLink, ProjectLogo, StatusBadge, focus, projectLinks } from './shared';
import PersonCard from '@/components/people/PersonCard';
import SimilarProjects from './SimilarProjects';
import ProjectStory from './ProjectStory';
import ProjectInfobox from './ProjectInfobox';
import { Breadcrumbs, Tabs, Tooltip, type TabItem } from '@/components/ui';
import { similarProjects } from '@/lib/similar-projects';

function Reports({ title, items, locale }: { title: string; items: EcosystemNews[]; locale: string }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-xl font-bold">{title}</h2>
      <ul className="mt-3 space-y-3 text-sm">
        {items.map((item, index) => (
          <li key={`${item.url}-${index}`}>
            <time dateTime={item.date}>{ecosystemDate(item.date, locale)}</time>
            {' · '}
            <ExternalLink locale={locale} url={item.url}>{item.title}</ExternalLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ProjectDetail({ project, data, locale, snapshot = getProjectSnapshot(project.id) }: {
  project: EcosystemProject;
  data: EcosystemData;
  locale: string;
  snapshot?: ProjectSnapshot;
}) {
  const t = ecosystemCopy(locale);
  const d = ecosystemDetail(locale);
  const reports = relatedReports(project, data);
  const people = project.people.filter(person => isSafeExternalUrl(person.sourceUrl));
  const similar = similarProjects(project, data);
  // Distinct people, not credits. Obelisk credits one person with two roles, and
  // "People credited: 3" for two people is wrong. The People tab still shows one
  // card per credited role, which is what a reader wants there.
  // Grouped by person, in first-appearance order. The dataset records one entry
  // per credited ROLE, so a person credited twice on one project appeared as
  // two identical cards side by side.
  const credited = people.reduce<{ name: string; credits: { role: typeof people[number]['role']; sourceUrl: string }[]; profiles: typeof people[number]['profiles'] }[]>((all, person) => {
    const existing = all.find(entry => entry.name === person.name);
    if (existing) {
      existing.credits.push({ role: person.role, sourceUrl: person.sourceUrl });
      existing.profiles = [...existing.profiles, ...person.profiles];
      return all;
    }
    return [...all, { name: person.name, credits: [{ role: person.role, sourceUrl: person.sourceUrl }], profiles: [...person.profiles] }];
  }, []);
  const creditedPeople = credited.length;

  const prefix = localePrefix(locale);

  // The story is the lead and the facts sit beside it: the licence, language and
  // repository dates used to be a prose list a few lines above the infobox, and
  // keeping both would have printed every one of them twice on the same tab.
  const overview = (
    <div className="text-sm leading-relaxed lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-8">
      <div className="space-y-8">
      <ProjectStory
        project={project}
        locale={locale}
        labels={{
          heading: d.storyHeading, launched: d.launchedLabel, nameOrigin: d.nameOriginLabel,
          motivation: d.motivationLabel, milestones: d.milestonesLabel,
          nothingFound: d.storyNothingFound, source: d.source,
        }}
      />

      <section>
        <h2 className="text-xl font-bold">{d.releaseHistory}</h2>
        {snapshot?.releases.length
          ? <ol className="mt-3 space-y-2">
              {snapshot.releases.map(release => (
                <li key={release.url}>
                  <time dateTime={release.date}>{ecosystemDate(release.date, locale)}</time>
                  {' · '}
                  <ExternalLink locale={locale} url={release.url}>{release.tag}</ExternalLink>
                  {release.prerelease && <span className="ml-2 text-gray-600 dark:text-gray-300">({d.prerelease})</span>}
                </li>
              ))}
            </ol>
          : <p className="mt-3">{d.noReleases}</p>}
      </section>

      {snapshot && (
        <p className="text-gray-600 dark:text-gray-300">
          {d.snapshotTaken} <time dateTime={snapshotGeneratedAt()}>{ecosystemDate(snapshotGeneratedAt(), locale)}</time>.
        </p>
      )}
      </div>

      <ProjectInfobox
        project={project}
        snapshot={snapshot}
        locale={locale}
        peopleCount={creditedPeople}
        labels={{
          quickFacts: d.quickFacts, category: d.categoryFact, status: d.statusFact,
          launched: d.launchedLabel, license: d.license, primaryLanguage: d.primaryLanguage,
          latestRelease: d.latestRelease, firstPublished: d.firstPublished, lastPush: d.lastPush,
          topics: d.topics, renamedFrom: d.renamedFrom, peopleCredited: d.peopleCredited,
          lastChecked: d.lastCheckedFact, notStated: d.notStated,
        }}
      />
    </div>
  );

  const evidence = (
    <div className="space-y-8 text-sm leading-relaxed">
      <section>
        <h2 className="text-xl font-bold">{d.evidenceHeading}</h2>
        <p className="mt-3">{project.statusNote || t.notVerified}</p>
        {project.latestUpdate && (
          <p className="mt-3">
            <strong>{t.latestUpdate}</strong>{' '}
            <time dateTime={project.latestUpdate.date}>{ecosystemDate(project.latestUpdate.date, locale)}</time>
            {' · '}
            <ExternalLink locale={locale} url={project.latestUpdate.url}>{project.latestUpdate.title}</ExternalLink>
          </p>
        )}
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          {t.lastChecked}{' '}
          {project.lastVerified
            ? <time dateTime={project.lastVerified}>{ecosystemDate(project.lastVerified, locale)}</time>
            : t.unverified}. {t.statusNotice}
        </p>
        {/* Both verification dates: when this record was last checked, and when
          * the directory as a whole was. */}
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {t.directoryChecked} <time dateTime={data.checkedAt}>{ecosystemDate(data.checkedAt, locale)}</time>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold">{t.sources}</h2>
        {project.sources.length
          ? <ul className="mt-3 space-y-2">
              {project.sources.map((source, index) => {
                const { text, note } = splitLabelNote(source.label);
                const link = <ExternalLink locale={locale} url={source.url}>{text}</ExternalLink>;
                return <li key={`${source.url}-${index}`}>{note ? <Tooltip label={note} trigger="child">{link}</Tooltip> : link}</li>;
              })}
            </ul>
          : <p className="mt-3">{t.noSources}</p>}
      </section>
    </div>
  );

  const peoplePanel = (
    <section>
      {/* The other panels each open with an h2. Without one here the people
        * were the only content on this page absent from its heading outline. */}
      <h2 className="text-xl font-bold">{d.tabPeople}</h2>
      {!people.some(person => person.role === 'founder') && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{t.unknownFounder}</p>
      )}
      {credited.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {credited.map(person => (
            <PersonCard
              key={person.name}
              person={person}
              locale={locale}
              localePrefix={prefix}
              labels={{ roleEvidence: t.roleEvidence, nostrProfile: d.nostrProfile, source: d.source, website: t.website }}
            />
          ))}
        </div>
      )}
    </section>
  );

  // Tabs split a page that had grown into six stacked sections. Every panel
  // stays in the HTML, so none of this content is hidden from a crawler.
  const tabs: TabItem[] = [
    { id: 'overview', label: d.tabOverview, content: overview },
    { id: 'evidence', label: d.tabEvidence, content: evidence },
    { id: 'people', label: d.tabPeople, content: peoplePanel },
  ];
  if (reports.news.length > 0 || reports.security.length > 0) {
    tabs.push({
      id: 'reports',
      label: d.tabReports,
      content: (
        <div className="space-y-8 text-sm leading-relaxed">
          <Reports title={d.relatedNews} items={reports.news} locale={locale} />
          <Reports title={d.relatedSecurity} items={reports.security} locale={locale} />
        </div>
      ),
    });
  }

  return (
    <article lang={locale} className="mx-auto max-w-4xl px-6 py-12">
      <Breadcrumbs items={projectCrumbs(project, locale)} label={d.breadcrumb} />

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-gray-600 dark:text-gray-300">{categoryLabel(project.category, locale)}</span>
          <StatusBadge status={project.status} locale={locale} />
        </div>
        <div className="mt-3 flex items-center gap-4">
          <ProjectLogo id={project.id} className="size-14" />
          <h1 className="text-3xl font-bold md:text-4xl">{project.name}</h1>
        </div>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">{project.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {projectLinks(project, { website: d.visitWebsite, repository: d.visitRepository }).map(link => (
            <ExternalIconLink key={link.url} url={link.url} label={link.label} locale={locale} />
          ))}
        </div>
      </header>

      <Tabs items={tabs} label={d.tabsLabel} className="mt-8" />

      {similar.length > 0 && (
        <SimilarProjects
          projects={similar}
          locale={locale}
          labels={{ title: d.similarTitle, intro: d.similarIntro, prev: d.scrollPrev, next: d.scrollNext }}
          localePrefix={prefix}
        />
      )}
    </article>
  );
}
