import type { Locale } from "@/i18n/config";
import type { DeckMessages } from "@/components/deck/types";
// Page-scoped dictionaries: do not add the deck to every page's provider payload.
const dictionaries = {
  en: () => import("./en.json"),
  es: () => import("./es.json"),
  pt: () => import("./pt.json"),
  fr: () => import("./fr.json"),
  it: () => import("./it.json"),
  de: () => import("./de.json"),
  ru: () => import("./ru.json"),
};
export async function getDeckMessages(locale: Locale): Promise<DeckMessages> {
  return (await dictionaries[locale]()).default;
}
