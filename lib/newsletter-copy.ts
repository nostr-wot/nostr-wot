import { locales, type Locale } from '@/i18n/config';
import { getFullUrl } from '@/lib/metadata';
import type { SentNewsletter } from '@/lib/newsletter-archive';

const en = {
  title: 'Sent newsletter archive',
  description: 'Read newsletter editions that have been sent, in the languages available for each edition.',
  empty: 'No newsletter editions have been sent yet.',
  available: 'Available languages',
  unavailable: 'This edition was not sent in this language. Choose an available language below.',
  edition: 'Edition', version: 'Version', sent: 'Sent', coverage: 'Coverage',
  back: 'All sent newsletters', read: 'Read edition',
};
type Copy = typeof en;
export const newsletterCopy: Record<Locale, Copy> = {
  en,
  es: {
    title: 'Archivo de boletines enviados', description: 'Lee los boletines enviados en los idiomas disponibles para cada edición.',
    empty: 'Aún no se ha enviado ningún boletín.', available: 'Idiomas disponibles',
    unavailable: 'Esta edición no se envió en este idioma. Elige uno de los idiomas disponibles a continuación.',
    edition: 'Edición', version: 'Versión', sent: 'Enviado', coverage: 'Periodo cubierto', back: 'Todos los boletines enviados', read: 'Leer edición',
  },
  pt: {
    title: 'Arquivo de boletins enviados', description: 'Leia os boletins enviados nos idiomas disponíveis para cada edição.',
    empty: 'Ainda não foi enviado nenhum boletim.', available: 'Idiomas disponíveis',
    unavailable: 'Esta edição não foi enviada neste idioma. Escolha um dos idiomas disponíveis abaixo.',
    edition: 'Edição', version: 'Versão', sent: 'Enviado', coverage: 'Período abrangido', back: 'Todos os boletins enviados', read: 'Ler edição',
  },
  ru: {
    title: 'Архив отправленных рассылок', description: 'Читайте отправленные выпуски рассылки на доступных для каждого выпуска языках.',
    empty: 'Выпуски рассылки ещё не отправлялись.', available: 'Доступные языки',
    unavailable: 'Этот выпуск не отправлялся на выбранном языке. Выберите один из доступных языков ниже.',
    edition: 'Выпуск', version: 'Версия', sent: 'Отправлено', coverage: 'Период', back: 'Все отправленные выпуски', read: 'Читать выпуск',
  },
  it: {
    title: 'Archivio delle newsletter inviate', description: 'Leggi le newsletter inviate nelle lingue disponibili per ogni edizione.',
    empty: 'Non è ancora stata inviata alcuna newsletter.', available: 'Lingue disponibili',
    unavailable: 'Questa edizione non è stata inviata in questa lingua. Scegli una delle lingue disponibili qui sotto.',
    edition: 'Edizione', version: 'Versione', sent: 'Inviata', coverage: 'Periodo trattato', back: 'Tutte le newsletter inviate', read: 'Leggi edizione',
  },
  fr: {
    title: 'Archives des newsletters envoyées', description: 'Lisez les newsletters envoyées dans les langues disponibles pour chaque édition.',
    empty: 'Aucune newsletter n’a encore été envoyée.', available: 'Langues disponibles',
    unavailable: 'Cette édition n’a pas été envoyée dans cette langue. Choisissez une langue disponible ci-dessous.',
    edition: 'Édition', version: 'Version', sent: 'Envoyée', coverage: 'Période couverte', back: 'Toutes les newsletters envoyées', read: 'Lire l’édition',
  },
  de: {
    title: 'Archiv versendeter Newsletter', description: 'Lies versendete Newsletter in den Sprachen, die für die jeweilige Ausgabe verfügbar sind.',
    empty: 'Es wurden noch keine Newsletter versendet.', available: 'Verfügbare Sprachen',
    unavailable: 'Diese Ausgabe wurde nicht in dieser Sprache versendet. Wähle unten eine verfügbare Sprache.',
    edition: 'Ausgabe', version: 'Version', sent: 'Versendet', coverage: 'Berichtszeitraum', back: 'Alle versendeten Newsletter', read: 'Ausgabe lesen',
  },
};

export function isNewsletterLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
export function newsletterPath(locale: Locale, id?: string): string {
  return `${locale === 'en' ? '' : `/${locale}`}/newsletters${id ? `/${id}` : ''}`;
}
export function newsletterLanguages(record: SentNewsletter): Locale[] {
  return locales.filter(locale => !!record.translations[locale]);
}
export function newsletterDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value));
}
/** Never advertise a translation that was not sent, including x-default. */
export function newsletterAlternates(record: SentNewsletter, locale: Locale) {
  const path = `/newsletters/${record.id}`;
  const languages: Record<string, string> = {};
  for (const language of newsletterLanguages(record)) languages[language] = getFullUrl(path, language);
  if (record.translations.en) languages['x-default'] = getFullUrl(path, 'en');
  return {
    ...(record.translations[locale] ? { canonical: getFullUrl(path, locale) } : {}),
    languages,
  };
}
