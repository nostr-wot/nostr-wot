import { useTranslations } from "next-intl";
import Image from 'next/image';

/**
 * Inline citation marker that links to a bibliography entry.
 * Usage in MDX: <Citation id={1} />
 */
export function Citation({ id }: { id: number }) {
  const u = useTranslations("ui");
  return (
    <sup className="inline-flex">
      <a
        href={`#ref-${id}`}
        id={`cite-${id}`}
        className="text-primary hover:underline text-xs font-medium ml-0.5"
        aria-label={u("citation", { id })}
      >
        [{id}]
      </a>
    </sup>
  );
}

/**
 * Single bibliography entry.
 * Usage in MDX:
 * <BibEntry id={1} authors="Zimmermann, P." title="PGP User's Guide" source="MIT Press" year="1994" url="https://..." />
 */
export function BibEntry({
  id,
  authors,
  title,
  source,
  year,
  url,
}: {
  id: number;
  authors: string;
  title: string;
  source?: string;
  year?: string;
  url?: string;
}) {
  const u = useTranslations("ui");
  return (
    <li
      id={`ref-${id}`}
      className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 py-2"
    >
      <span className="flex-shrink-0 font-medium text-gray-500 dark:text-gray-500">
        <a href={`#cite-${id}`} className="hover:text-primary" aria-label={u("backCitation", { id })}>
          [{id}]
        </a>
      </span>
      <span>
        <span className="text-gray-700 dark:text-gray-300">{authors}</span>
        {year && <span> ({year})</span>}
        {'. '}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            <cite>{title}</cite>
          </a>
        ) : (
          <cite className="text-gray-700 dark:text-gray-300">{title}</cite>
        )}
        {source && <span>. <em>{source}</em></span>}
        {'.'}
      </span>
    </li>
  );
}

/**
 * Bibliography/references section wrapper.
 * Usage in MDX:
 * <Bibliography>
 *   <BibEntry id={1} ... />
 *   <BibEntry id={2} ... />
 * </Bibliography>
 */
export function Bibliography({ children }: { children: React.ReactNode }) {
  const u = useTranslations("ui");
  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {u("references")}
      </h3>
      <ol className="space-y-1 list-none pl-0">
        {children}
      </ol>
    </section>
  );
}

/**
 * Highlighted statistic with source attribution.
 * Usage in MDX:
 * <Statistic value="2.3M+" label="Nostr users worldwide" source="Nostr Analytics" sourceUrl="https://..." />
 */
export function Statistic({
  value,
  label,
  source,
  sourceUrl,
}: {
  value: string;
  label: string;
  source?: string;
  sourceUrl?: string;
}) {
  const u = useTranslations("ui");
  return (
    <div className="my-6 p-6 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl border border-primary/20">
      <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
        {value}
      </div>
      <div className="text-gray-700 dark:text-gray-300 font-medium">
        {label}
      </div>
      {source && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {u("source")}{' '}
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {source}
            </a>
          ) : (
            <span>{source}</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Expert quote with attribution.
 * Usage in MDX:
 * <ExpertQuote
 *   quote="The Web of Trust is a game-changer for decentralized identity."
 *   author="Dr. Jane Doe"
 *   title="Lead Researcher"
 *   organization="MIT Media Lab"
 *   avatar="/authors/jane-doe.jpg"
 * />
 */
export function ExpertQuote({
  quote,
  author,
  title,
  organization,
  avatar,
}: {
  quote: string;
  author: string;
  title?: string;
  organization?: string;
  avatar?: string;
}) {
  return (
    <figure className="my-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-l-4 border-primary">
      <blockquote className="text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed mb-4">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3">
        {avatar && (
          <Image
            src={avatar}
            alt={author}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <div>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            {author}
          </span>
          {(title || organization) && (
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              {title}
              {title && organization && ', '}
              {organization && <em>{organization}</em>}
            </span>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
