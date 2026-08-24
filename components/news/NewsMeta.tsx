function InfoGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9v5" strokeLinecap="round" />
      <path d="M10 6.2h.01" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Presentational byline block for one news entry.
 *
 * The date rendered here is the EVENT date (`post.date`), which is what a
 * reader cares about. The real ship date (`publishedAt`) is what goes into
 * structured data as `datePublished` — see `lib/jsonld.tsx`. The two are
 * deliberately different for backfilled archive entries; the article page
 * separately renders a "Published <date>" line so a reader can still see
 * that, which is why no extra notice is rendered here.
 */
export interface NewsMetaPost {
  type: 'digest' | 'story';
  /** Event date, ISO. */
  date: string;
  readingTime: string;
}

interface NewsMetaProps {
  post: NewsMetaPost;
  /** Translated `news.types.digest` / `news.types.story`. */
  typeLabel: string;
  /** Event date, already formatted for the active locale. */
  formattedDate: string;
  /** Translated `news.disclosure`. Always rendered. */
  disclosure: string;
  className?: string;
}

const typeBadgeStyles: Record<NewsMetaPost['type'], string> = {
  digest: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  story: 'bg-primary/10 text-primary',
};

export function NewsMeta({
  post,
  typeLabel,
  formattedDate,
  disclosure,
  className = '',
}: NewsMetaProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span
          className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${typeBadgeStyles[post.type]}`}
        >
          {typeLabel}
        </span>
        <time dateTime={post.date}>{formattedDate}</time>
        <span aria-hidden="true">·</span>
        <span>{post.readingTime}</span>
      </div>

      <p className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <InfoGlyph className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
        <span>{disclosure}</span>
      </p>
    </div>
  );
}
