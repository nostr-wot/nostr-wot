import { focusRing } from './focus-ring';

export type Crumb = {
  name: string;
  /** Locale-prefixed site path, e.g. "" for the home page or "/es/projects". */
  path: string;
};

/**
 * The trail from the home page to this one.
 *
 * The directory already emitted a `BreadcrumbList` for crawlers on every
 * project and person page while showing readers nothing but a single "back to
 * the directory" link, which is a structured-data claim the page did not back
 * up. Both now render from the SAME list (see `projectCrumbs` and
 * `personCrumbs`), so they cannot describe different trails.
 *
 * The last crumb is this page: it is not a link, and it carries
 * `aria-current="page"`. The separators are decorative and hidden, so a screen
 * reader hears the list structure rather than a run of slashes.
 */
export default function Breadcrumbs({ items, label, className = '' }: {
  items: Crumb[];
  /** The accessible name of the navigation region, e.g. "Breadcrumb". */
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
        {items.map((crumb, index) => {
          const last = index === items.length - 1;
          return (
            <li key={crumb.path + crumb.name} className="flex items-center gap-x-2">
              {index > 0 && <span aria-hidden="true" className="text-gray-400 dark:text-gray-600">/</span>}
              {last
                ? <span aria-current="page" className="font-medium text-gray-900 dark:text-gray-100">{crumb.name}</span>
                : <a href={crumb.path || '/'} className={`rounded underline underline-offset-4 hover:text-primary ${focusRing}`}>{crumb.name}</a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
