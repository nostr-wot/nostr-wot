import type { ReactNode } from 'react';
import { ecosystemCopy, isSafeExternalUrl, type ProjectStatus } from '@/lib/ecosystem-projects';
import { getProjectLogo } from '@/lib/project-logos';
import { Tooltip, focusRing, iconButton } from '@/components/ui';
import { GitHubIcon, LinkIcon, NostrLogo, XTwitterIcon } from '@/components/icons';

// Re-exported under its original name so the directory's many call sites keep
// working, but the string itself now lives in components/ui.
export { focusRing as focus } from '@/components/ui';

export const statusStyles: Record<ProjectStatus, string> = {
  active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  beta: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  archived: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  unknown: 'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200',
};

// Every outbound link in the directory and on the project pages goes through
// here, so the new-tab and rel policy lives in exactly one place.
//
// `target="_blank"` opens the project's own site without losing the reader's
// place in the directory. `noopener` is what makes that safe: without it the
// opened page can reach back through `window.opener` and redirect this tab
// (reverse tabnabbing). Modern browsers imply it for `target="_blank"`, and it
// is stated anyway so the guarantee does not depend on the browser.
//
// `nofollow` matches what this directory says about itself: inclusion does not
// imply a Nostr WoT integration or endorsement. These are 41 editorially listed
// but unvetted third-party sites, cited as evidence across 287 pages, so they
// are references rather than recommendations and should not pass ranking signal.
//
// `noreferrer` is deliberately NOT set: stripping the referrer would hide this
// directory from the analytics of the projects it links to, and `noopener`
// already covers the security case. Add it here if privacy ever outweighs that.
export function ExternalLink({ url, children, locale, className }: { url: string; children: ReactNode; locale: string; className?: string }) {
  const t = ecosystemCopy(locale);
  // `className` lets an icon button reuse this component rather than
  // reimplementing the target/rel/safety policy with a different look.
  const style = className ?? 'rounded underline underline-offset-4 hover:text-primary break-words';
  return isSafeExternalUrl(url)
    ? (
      <a href={url} target="_blank" rel="nofollow noopener" className={`${style} ${focusRing}`}>
        {children}
        <span className="sr-only"> ({t.opensInNewTab})</span>
      </a>
    )
    : <span>{children} ({t.linkUnavailable})</span>;
}

// `unknown` is the one status whose label does not explain itself, so the chip
// carries the explanation as a tooltip rather than a sentence of prose on the
// page or a second icon button beside it.
export function StatusBadge({ status, locale }: { status: ProjectStatus; locale: string }) {
  const t = ecosystemCopy(locale);
  const badge = <span className={`rounded-full px-3 py-1 font-semibold first-letter:uppercase ${statusStyles[status]}`}>{t.statuses[status]}</span>;
  return status === 'unknown' ? <Tooltip label={t.unknownMeaning}>{badge}</Tooltip> : badge;
}

// A plain <img>, not next/image: 13 of the 37 marks are SVG, and next/image
// needs `dangerouslyAllowSVG` to pass those through, which would loosen image
// handling across the whole site for files taken from third parties. An <img>
// never executes script inside an SVG, so this is the safer of the two, and
// these are small fixed-size marks that gain little from optimisation.
export function ProjectLogo({ id, className }: { id: string; className: string }) {
  const logo = getProjectLogo(id);
  if (!logo) return null;
  return (
    <img
      src={`/${logo.file}`}
      // Decorative: the project name sits immediately beside it, so giving the
      // mark its own alt text would just announce the name twice.
      alt=""
      // Rounded because these are HTML attributes, which take integers, and an
      // SVG viewBox can be fractional (strfry's is 72.34x43.63). They only hint
      // the aspect ratio to avoid layout shift; the CSS class sets the size.
      width={Math.round(logo.width)}
      height={Math.round(logo.height)}
      loading="lazy"
      decoding="async"
      // Many marks are dark artwork on a transparent background and would
      // disappear against this site's dark theme, so each sits on a white tile.
      className={`shrink-0 rounded-lg bg-white object-contain p-1 ${className}`}
    />
  );
}

// Resolves a URL to the icon that identifies it, so a card can show an icon
// button per link instead of a row of words. Falls back to a generic link icon,
// which is correct for a project's own domain. The dataset currently carries
// only `website` and `repository` per project; any social link added later
// flows through here without further changes.
const linkIcons: { match: RegExp; Icon: (props: { className?: string }) => ReactNode }[] = [
  { match: /(^|\.)github\.com$/i, Icon: GitHubIcon },
  // NostrLogo is the ostrich; NostrIcon is a generic circle and is not the Nostr mark.
  { match: /(^|\.)(njump\.me|nostr\.directory|iris\.to|snort\.social|primal\.net)$/i, Icon: NostrLogo },
  { match: /(^|\.)(x|twitter)\.com$/i, Icon: XTwitterIcon },
];

export function linkIconFor(url: string) {
  try {
    const host = new URL(url).host;
    return (linkIcons.find(entry => entry.match.test(host))?.Icon) ?? LinkIcon;
  } catch {
    return LinkIcon;
  }
}

/**
 * The outbound links for a project, deduplicated. Ten of the 41 projects use
 * their repository as their website, and showing one URL twice under two
 * labels would read as two facts where there is one.
 */
export function projectLinks(project: { website: string; repository: string }, labels: { website: string; repository: string }) {
  const seen = new Set<string>();
  return [
    { url: project.website, label: labels.website },
    { url: project.repository, label: labels.repository },
  ].filter(link => {
    if (!link.url || !isSafeExternalUrl(link.url) || seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
}

export function ExternalIconLink({ url, label, locale }: { url: string; label: string; locale: string }) {
  const Icon = linkIconFor(url);
  return (
    // The link already carries `label` as its accessible name, so the tooltip
    // only paints the bubble rather than repeating the text to a screen reader.
    <Tooltip label={label} trigger="child" announce={false}>
      <ExternalLink
        locale={locale}
        url={url}
        className={iconButton}
      >
        <Icon className="size-4" />
        <span className="sr-only">{label}</span>
      </ExternalLink>
    </Tooltip>
  );
}
