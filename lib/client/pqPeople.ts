"use client";

/**
 * A stable colour per participant.
 *
 * With three people in one transcript, alignment alone stops carrying the message —
 * "left or right" only answers "is it mine", not "who". Colour is assigned once per
 * pubkey, in the order people appear, and every surface that mentions someone uses the
 * same one: bubbles, name labels, relay chips, the event explorer.
 *
 * Class strings are written out in full rather than composed, because Tailwind only
 * emits classes it can see literally in the source.
 */

export type Palette = {
  key: string;
  /** Outgoing bubble. */
  solid: string;
  /** Incoming bubble, same hue at low weight. */
  soft: string;
  /** Small status dot. */
  dot: string;
  /** Name labels and other coloured text. */
  text: string;
  /** Pane accent. */
  ring: string;
  /** Filter chip, unselected then selected. */
  chip: string;
  chipActive: string;
};

const PALETTES: Palette[] = [
  {
    key: "violet",
    solid: "bg-violet-600 text-white",
    soft: "bg-violet-50 text-violet-950 dark:bg-violet-950/60 dark:text-violet-100",
    dot: "bg-violet-500",
    text: "text-violet-700 dark:text-violet-300",
    ring: "border-t-4 border-t-violet-500",
    chip: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
    chipActive: "bg-violet-600 text-white",
  },
  {
    key: "teal",
    solid: "bg-teal-600 text-white",
    soft: "bg-teal-50 text-teal-950 dark:bg-teal-950/60 dark:text-teal-100",
    dot: "bg-teal-500",
    text: "text-teal-700 dark:text-teal-300",
    ring: "border-t-4 border-t-teal-500",
    chip: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200",
    chipActive: "bg-teal-600 text-white",
  },
  {
    key: "amber",
    solid: "bg-amber-600 text-white",
    soft: "bg-amber-50 text-amber-950 dark:bg-amber-950/60 dark:text-amber-100",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    ring: "border-t-4 border-t-amber-500",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    chipActive: "bg-amber-600 text-white",
  },
  {
    key: "rose",
    solid: "bg-rose-600 text-white",
    soft: "bg-rose-50 text-rose-950 dark:bg-rose-950/60 dark:text-rose-100",
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
    ring: "border-t-4 border-t-rose-500",
    chip: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
    chipActive: "bg-rose-600 text-white",
  },
];

/** For anyone outside the demo — a stranger whose wrap we could not open. */
const NEUTRAL: Palette = {
  key: "slate",
  solid: "bg-gray-600 text-white",
  soft: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
  dot: "bg-gray-400",
  text: "text-gray-600 dark:text-gray-400",
  ring: "border-t-4 border-t-gray-400",
  chip: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  chipActive: "bg-gray-600 text-white",
};

const assigned = new Map<string, Palette>();

/** The colour for this pubkey, allocated on first sight and stable thereafter. */
export function paletteFor(pubkey: string | null | undefined): Palette {
  if (!pubkey) return NEUTRAL;
  const existing = assigned.get(pubkey);
  if (existing) return existing;
  const next = PALETTES[assigned.size % PALETTES.length]!;
  assigned.set(pubkey, next);
  return next;
}

/** Claim colours in a known order, so Alice is always first. */
export function reservePalettes(pubkeys: string[]): void {
  for (const pk of pubkeys) paletteFor(pk);
}

export function forgetPalette(pubkey: string): void {
  assigned.delete(pubkey);
}
