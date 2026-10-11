/**
 * The CLDR plural form of `count` for `locale`, chosen from forms authored one
 * per plural category, falling back to `other`.
 *
 * This exists because a translated noun has to agree with a numeral rendered
 * beside it, and the agreement cannot live in the code that assembles the
 * sentence. Russian has three forms for counts above one ("2 роли", "6 ролей",
 * "21 роль") where English and German have one, so a template that concatenates
 * a number and a fixed noun is wrong in Russian for most counts — which is
 * exactly how "41 из 41 проектов" and "41 von 41 Projekte" shipped.
 *
 * `Intl.PluralRules` is the selector rather than a hand-written rule per
 * locale: it is the same CLDR data next-intl's ICU `plural` uses, and it works
 * in the places that read the message JSON directly instead of going through a
 * next-intl formatter. *
 * One caveat the Russian people count line already tripped over: a form table
 * is authored for the case its sentence puts the noun in. `projectsPlural` is
 * genitive, because the directory's line reads "N of M projects"; reusing it
 * after a preposition that takes a different case produces agreement that is
 * wrong in exactly the way this helper exists to prevent. Reuse a table only
 * where the grammatical case matches, or author a second one.
 */
export function pluralForm(locale: string, count: number, forms: Record<string, string>): string {
  return forms[new Intl.PluralRules(locale).select(count)] ?? forms.other;
}
