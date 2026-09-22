import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createTranslator } from "next-intl";
import { formatGraphError } from "../lib/graph/error-messages";

test("graph UI preserves recovery instructions in every supported language", () => {
  for (const locale of ["en", "es", "de", "fr", "it", "pt", "ru"]) {
    const messages = JSON.parse(readFileSync(`messages/${locale}/playground.json`, "utf8")).sourceErrors;
    const t = createTranslator({ locale, messages, onError: error => { throw error; } });
    for (const [message, key] of [
      ["Enable Web of Trust in your extension, select Local mode, and sync its graph first.", "extensionEnable"],
      ["Select Local mode and sync the graph in your extension first.", "extensionLocal"],
      ["The extension account changed. Connect again to load its graph.", "accountChanged"],
      ["Local graph storage is unavailable in this browser.", "storageUnavailable"],
      ["No follow list was received from the relays. Your saved graph has been kept; try syncing again.", "noFollows"],
      ["This graph is open in another tab. Close it there and try again.", "openAnotherTab"],
    ]) {
      assert.equal(formatGraphError(new Error(message), t, "fallback"), messages[key]);
      assert.equal(formatGraphError(message, t, "fallback"), messages[key]);
      if (locale !== "en") assert.notEqual(messages[key], message);
    }
    assert.equal(formatGraphError("Oracle request failed (503)", t, "fallback"), t("oracleRequest", { status: "503" }));
  }
});

test("unknown graph errors use the caller's localized fallback without exposing raw details", () => {
  const translate = () => { throw new Error("Unknown errors must not choose a known message"); };
  for (const error of [new Error("NetworkError: raw browser details"), "constructor", "Oracle request failed (unexpected)", null, {}]) {
    assert.equal(formatGraphError(error, translate, "Échec de la suppression"), "Échec de la suppression");
  }
});
