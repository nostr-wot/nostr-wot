import Image from 'next/image';
import type { SocialArtId } from '@/lib/social-art';

/** Decorative only: nearby localized headings carry the meaning. */
export function FeaturedArtwork({ art, className = '', priority = false }: {
  art: SocialArtId;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`not-prose mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-indigo-100 bg-[#f5f3ff] shadow-sm dark:border-indigo-900/60 ${className}`}>
      <Image
        src={`/images/illustrations/${art}.webp`}
        alt=""
        width={1600}
        height={900}
        sizes="(max-width: 640px) calc(100vw - 48px), 576px"
        priority={priority}
        className="h-auto w-full"
      />
    </div>
  );
}
