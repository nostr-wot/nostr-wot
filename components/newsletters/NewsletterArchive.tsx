import { editorialHtml } from '@/scripts/newsletters/format.mjs';
import { localeNames, type Locale } from '@/i18n/config';
import type { SentNewsletter } from '@/lib/newsletter-archive';
import { newsletterCopy, newsletterDate, newsletterLanguages, newsletterPath } from '@/lib/newsletter-copy';

const linkStyle = 'rounded underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';

/** Restricted formatter escapes all source text and only emits safe editorial markup. */
export function NewsletterBody({ body }: { body: string }) {
  return <div className="space-y-6 text-base leading-8 [overflow-wrap:anywhere] [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{__html: editorialHtml(body)}} />;
}

export function NewsletterLanguages({ record, locale }: { record: SentNewsletter; locale: Locale }) {
  const copy = newsletterCopy[locale];
  return <nav aria-label={`${copy.available}: ${record.id}`} className="mt-5">
    <p className="text-sm font-semibold">{copy.available}</p>
    <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-3 text-sm">
      {newsletterLanguages(record).map(language => <li key={language}>
        <a href={newsletterPath(language, record.id)} lang={language} hrefLang={language} className={linkStyle}>{localeNames[language]}</a>
      </li>)}
    </ul>
  </nav>;
}

export function NewsletterList({ records, locale }: { records: SentNewsletter[]; locale: Locale }) {
  const copy = newsletterCopy[locale];
  if (!records.length) return <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-gray-600 dark:border-gray-700 dark:text-gray-300">{copy.empty}</p>;
  return <ul className="grid gap-6 md:grid-cols-2">
    {records.map(record => {
      const translation = record.translations[locale];
      return <li key={record.id} className="rounded-2xl border border-gray-200 p-6 [overflow-wrap:anywhere] dark:border-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-300">{copy.sent}: <time dateTime={translation?.sentAt ?? record.sentAt}>{newsletterDate(translation?.sentAt ?? record.sentAt, locale)}</time> · {copy.version} {record.version}</p>
        <h2 className="mt-3 text-xl font-bold">{translation ? <a className={linkStyle} href={newsletterPath(locale, record.id)}>{translation.subject}</a> : `${copy.edition} ${record.id}`}</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-300">{translation?.preheader || (!translation ? copy.unavailable : '')}</p>
        <NewsletterLanguages record={record} locale={locale} />
      </li>;
    })}
  </ul>;
}

export function NewsletterEdition({ record, locale }: { record: SentNewsletter; locale: Locale }) {
  const copy = newsletterCopy[locale];
  const translation = record.translations[locale];
  return <article lang={locale} className="mx-auto max-w-3xl px-6 py-16 [overflow-wrap:anywhere]">
    <a className={`${linkStyle} text-sm`} href={newsletterPath(locale)}>{copy.back}</a>
    <header className="mb-10 mt-8 border-b border-gray-200 pb-8 dark:border-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-300">{copy.edition} {record.id} · {copy.version} {record.version}</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{translation?.subject ?? `${copy.edition} ${record.id}`}</h1>
      {translation && <>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{translation.preheader}</p>
        <p className="mt-4 text-sm">{copy.sent}: <time dateTime={translation.sentAt}>{newsletterDate(translation.sentAt, locale)}</time></p>
        {(record.coverageStart || record.coverageEnd) && <p className="mt-2 text-sm">{copy.coverage}: {record.coverageStart && <time dateTime={record.coverageStart}>{newsletterDate(record.coverageStart, locale)}</time>}{record.coverageStart && record.coverageEnd && ' – '}{record.coverageEnd && <time dateTime={record.coverageEnd}>{newsletterDate(record.coverageEnd, locale)}</time>}</p>}
      </>}
      {!translation && <p className="mt-5 text-gray-600 dark:text-gray-300">{copy.unavailable}</p>}
      <NewsletterLanguages record={record} locale={locale} />
    </header>
    {translation && <NewsletterBody body={translation.body} />}
  </article>;
}
