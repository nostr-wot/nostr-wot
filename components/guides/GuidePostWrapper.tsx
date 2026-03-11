'use client';

import { useBlogTranslations } from '@/contexts/BlogTranslationsContext';
import { useEffect } from 'react';
import { type Locale } from '@/i18n/config';

interface GuidePostWrapperProps {
  translations: Partial<Record<Locale, string>>;
  children: React.ReactNode;
}

export function GuidePostWrapper({ translations, children }: GuidePostWrapperProps) {
  const { setTranslations } = useBlogTranslations();

  useEffect(() => {
    // Transform guide translations to use /guides/ prefix
    const guideTranslations: Partial<Record<Locale, string>> = {};
    for (const [locale, slug] of Object.entries(translations)) {
      guideTranslations[locale as Locale] = slug;
    }
    setTranslations(guideTranslations);
    return () => setTranslations({});
  }, [translations, setTranslations]);

  return <>{children}</>;
}
