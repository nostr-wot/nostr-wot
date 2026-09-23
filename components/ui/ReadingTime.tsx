'use client';

import { useTranslations } from 'next-intl';

/** Localize display only; content caches retain reading-time's existing text schema. */
export default function ReadingTime({ value }: { value: string }) {
  const t = useTranslations('ui');
  const match = /^\s*(\d+)\s+min read\s*$/.exec(value);
  const minutes = match ? Number(match[1]) : NaN;
  if (!Number.isSafeInteger(minutes)) return null;
  return <span>{t('readingTime', { minutes })}</span>;
}
