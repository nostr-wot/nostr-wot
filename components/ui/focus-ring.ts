/**
 * The keyboard focus style for interactive elements that are not form fields.
 *
 * Form fields use `focus:ring-primary` (see `Input`, `TextArea`,
 * `NewsletterForm`); everything else uses this violet ring, matching
 * `NewsletterArchive`, which established it. Kept as one exported constant
 * because it was written out three times across the directory, the tabs and
 * the tooltip, and a fourth copy would have drifted.
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950";

/**
 * A 36px bordered icon control: the outbound icon buttons on a project card,
 * the npub link on a person card, and the carousel arrows all use it.
 */
export const iconButton =
  "inline-flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-400";

/**
 * The directory's card surface. Deliberately not the `Card` component: the
 * directory's surface predates it and differs (rounded-2xl, gray-900 in dark).
 * `card-interactive` is the repo's card lift, which carries a dark-mode shadow
 * and animates the border; `hover-lift` is the CTA-button lift and is unlayered
 * CSS that would override the border transition.
 */
export const cardShell =
  "rounded-2xl border border-gray-200 bg-white card-interactive hover:border-primary dark:border-gray-800 dark:bg-gray-900";
