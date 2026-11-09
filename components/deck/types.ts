export type SlideText = {
  title: string;
  summary: string;
  points: string[];
  body: string;
  takeaway: string;
  cta: string;
};
export type DeckMessages = {
  slides: SlideText[];
  ui: {
    nav: string[];
    tour: string[][];
    tourButtons: string[];
    resources: string[][];
  };
};
export type Slide = SlideText & { art: string | null; link: string };
export type Resource = { title: string; description: string; href: string };
