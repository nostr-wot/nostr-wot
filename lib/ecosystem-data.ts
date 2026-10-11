import { type EcosystemData } from '@/lib/ecosystem-projects';

import en from '@/data/ecosystem-projects.json';
import es from '@/data/ecosystem-projects.es.json';
import pt from '@/data/ecosystem-projects.pt.json';
import ru from '@/data/ecosystem-projects.ru.json';
import it from '@/data/ecosystem-projects.it.json';
import fr from '@/data/ecosystem-projects.fr.json';
import de from '@/data/ecosystem-projects.de.json';

const byLocale = { en, es, pt, ru, it, fr, de };

/**
 * The directory dataset for a locale, falling back to English for anything
 * unsupported. Lives here because three pages and the sitemap each had their
 * own copy of the seven imports and the same fallback.
 */
export function ecosystemDataFor(locale: string): EcosystemData {
  return (byLocale[locale as keyof typeof byLocale] ?? en) as unknown as EcosystemData;
}
