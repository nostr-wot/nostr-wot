'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type EcosystemProject } from '@/lib/ecosystem-projects';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { focus } from './shared';
import ProjectCard from './ProjectCard';

/**
 * A horizontally scrolling strip of related projects.
 *
 * Built on native overflow scrolling with CSS scroll-snap, so it works with a
 * trackpad, a touch swipe and the keyboard before any JavaScript runs; each
 * tile is a link, so tabbing through them scrolls them into view on its own.
 * The arrow buttons are an enhancement on top of that, and they hide
 * themselves at each end rather than sitting there disabled.
 */
export default function SimilarProjects({ projects, locale, labels, localePrefix }: {
  projects: EcosystemProject[];
  locale: string;
  labels: { title: string; intro: string; prev: string; next: string };
  /**
   * "" for English, "/<locale>" otherwise. A prefix rather than a function,
   * because a server component cannot pass a function across the client
   * boundary; the serialiser rejects it at request time.
   */
  localePrefix: string;
}) {
  const strip = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const node = strip.current;
    if (!node) return;
    setAtStart(node.scrollLeft <= 1);
    setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 1);
  }, []);

  useEffect(() => {
    sync();
    const node = strip.current;
    if (!node) return;
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, [sync]);

  const nudge = (direction: 1 | -1) => {
    const node = strip.current;
    // No `behavior` option on purpose. Smoothness comes from the container's
    // `scroll-smooth` class, so the browser decides: it animates where it can,
    // jumps where it cannot, and `motion-reduce:scroll-auto` turns the
    // animation off for anyone who asked for reduced motion. Passing
    // `behavior: 'smooth'` here instead meant the scroll did nothing at all in
    // an environment that could not run the animation.
    if (node) node.scrollBy({ left: direction * Math.max(node.clientWidth * 0.8, 240) });
  };

  const arrow = `hidden size-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-primary hover:text-primary sm:inline-flex dark:border-gray-700 dark:text-gray-400 ${focus}`;

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{labels.title}</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{labels.intro}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {/* Dimmed and aria-disabled at the ends rather than hidden or
              disabled: both of those drop focus out from under the user, and
              `invisible` removes the control from the accessibility tree so a
              screen reader never learns it exists. */}
          <button
            type="button"
            onClick={() => { if (!atStart) nudge(-1); }}
            aria-disabled={atStart}
            aria-label={labels.prev}
            className={`${arrow} ${atStart ? 'opacity-40' : ''}`}
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => { if (!atEnd) nudge(1); }}
            aria-disabled={atEnd}
            aria-label={labels.next}
            className={`${arrow} ${atEnd ? 'opacity-40' : ''}`}
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      </div>
      <ul
        ref={strip}
        role="list"
        onScroll={sync}
        className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-3 pt-2 motion-reduce:scroll-auto [scrollbar-width:thin]"
      >
        {projects.map(project => (
          // The same card the directory grid renders, not a lookalike.
          <li key={project.id} className="w-72 shrink-0 snap-start">
            <ProjectCard
              project={project}
              locale={locale}
              projectHref={`${localePrefix}/projects/${project.id}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
