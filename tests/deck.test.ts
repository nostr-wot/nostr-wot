import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { locales } from "../i18n/config";
import {getDeckMessages} from "../messages/deck";
import type { DeckMessages } from "../components/deck/types";
const manifest = JSON.parse(
  readFileSync("components/deck/slides.json", "utf8"),
) as { art: string | null; link: string }[];
test("every deck locale has complete content, controls and localized illustrations", () => {
  for (const locale of locales) {
    const data = JSON.parse(
      readFileSync(`messages/deck/${locale}.json`, "utf8"),
    ) as DeckMessages;
    assert.equal(data.slides.length, manifest.length, locale);
    assert.equal(data.ui.nav.length, 11, locale);
    assert.equal(data.ui.tour.length, 3, locale);
    assert.equal(data.ui.resources.length, 10, locale);
    for (const [index, slide] of data.slides.entries()) {
      assert.ok(
        slide.title && slide.summary && slide.body,
        `${locale} slide ${index + 1} missing copy`,
      );
      assert.ok(Array.isArray(slide.points));
      const art = manifest[index].art;
      if (art?.endsWith(".svg"))
        assert.ok(
          existsSync(`public/deck/assets/${locale}/${art}`),
          `${locale} ${art}`,
        );
    }
  }
});
test("the deck is in the locale-aware sitemap and uses a page-scoped dictionary", async () => {
  assert.match(
    readFileSync("lib/sitemap-routes.mjs", "utf8"),
    /path: "\/deck"/,
  );
  for (const locale of locales) {
    const messages = await getDeckMessages(locale);
    assert.deepEqual(messages, JSON.parse(readFileSync(`messages/deck/${locale}.json`, "utf8")));
  }
});
