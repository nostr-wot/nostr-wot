import type { PersonProfile } from '@/lib/people-profiles';

/**
 * A credited person's own public developer-profile image, at the size the
 * caller asks for, falling back to the initial of their name.
 *
 * Only 5 of the 40 credited people publish a profile image, so without a
 * fallback every grid mixed indented cards with flush ones and read as broken.
 * The initial is derived from the name beside it, so the placeholder states
 * nothing the page does not already say.
 *
 * `alt=""` and `aria-hidden` on purpose: neither the image nor the initial
 * carries information the adjacent name does not already give, so announcing
 * either would be noise. The intrinsic width and height are the committed
 * ones, so the circle reserves its space before the file arrives and the text
 * beside it does not jump.
 *
 * One component rather than three copies: the project page's person card, the
 * person's own page and the people index all show it.
 */
export default function PersonAvatar({ avatar, name, className, priority = false }: {
  avatar: PersonProfile['avatar'];
  /** Used only for the fallback initial. */
  name: string;
  className: string;
  /** True for the one avatar above the fold on a person's own page. */
  priority?: boolean;
}) {
  if (avatar) {
    return (
      <img
        src={`/${avatar.file}`}
        alt=""
        width={avatar.width}
        height={avatar.height}
        {...(priority ? {} : { loading: 'lazy' as const })}
        decoding="async"
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  // The first grapheme, so a name starting with an emoji or a combining mark
  // does not render as half a character.
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '';
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400 ${className}`}
    >
      {initial}
    </span>
  );
}
