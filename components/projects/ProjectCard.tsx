import { categoryLabel, ecosystemCopy, type EcosystemProject } from '@/lib/ecosystem-projects';
import { ExternalIconLink, ProjectLogo, StatusBadge, focus, projectLinks } from './shared';
import { cardShell } from '@/components/ui';

/**
 * The directory's project tile. Used by the `/projects` grid and by the
 * similar-projects carousel on each project page, so the two cannot drift.
 *
 * No hooks, so it renders from a server or a client component either way.
 */
export default function ProjectCard({ project, locale, projectHref }: { project: EcosystemProject; locale: string; projectHref: string }) {
  const t = ecosystemCopy(locale);
  return (
    // The evidence trail (status reasoning, people, sources, releases) lives on
    // the project's own page. Repeating it inside every card made the grid
    // unscannable and duplicated the page it links to.
    <article className={`group relative flex h-full flex-col p-5 ${cardShell}`}>
      {/* z-10, not just `relative`: the title link's ::before overlay comes later
          in the tree, so with z-index auto it would paint over this row and swallow
          the status chip's tooltip hover. */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-gray-600 dark:text-gray-300">{categoryLabel(project.category, locale)}</span>
        <StatusBadge status={project.status} locale={locale} />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <ProjectLogo id={project.id} className="size-10 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none" />
        <h3 className="text-lg font-bold leading-tight">
          {/* Stretched link: the ::before overlay makes the whole card clickable
              without nesting the card's other links inside an anchor, which
              would be invalid HTML. The icon row below is given `relative` so it
              paints above this overlay and stays clickable. */}
          <a href={projectHref} className={`rounded before:absolute before:inset-0 before:rounded-2xl group-hover:text-primary group-hover:underline underline-offset-4 ${focus}`}>
            {project.name}
          </a>
        </h3>
      </div>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{project.summary}</p>
      <div className="relative z-10 mt-4 flex items-center gap-2">
        {projectLinks(project, { website: t.website, repository: t.repository }).map(link => (
          <ExternalIconLink key={link.url} url={link.url} label={`${link.label} ${t.for} ${project.name}`} locale={locale} />
        ))}
      </div>
    </article>
  );
}
