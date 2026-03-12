export const locales = ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
};

export const localeISO: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  pt: 'PT',
  ru: 'RU',
  it: 'IT',
  fr: 'FR',
  de: 'DE',
};
