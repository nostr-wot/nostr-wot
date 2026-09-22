/** Stable UI mapping for existing source errors; source/retry behavior stays unchanged. */
const sourceErrorKeys = {
  "Local graph storage is unavailable in this browser.": "storageUnavailable",
  "No follow list was received from the relays. Your saved graph has been kept; try syncing again.": "noFollows",
  "Enable Web of Trust in your extension, select Local mode, and sync its graph first.": "extensionEnable",
  "Select Local mode and sync the graph in your extension first.": "extensionLocal",
  "The extension account changed. Connect again to load its graph.": "accountChanged",
  "Invalid public key": "invalidKey",
  "Invalid sync depth": "invalidDepth",
  "Invalid follow list from extension": "extensionFollows",
  "Invalid graph metrics from extension": "extensionMetrics",
  "Invalid follows request": "invalidRequest",
  "Invalid distance request": "invalidRequest",
  "Invalid follows response": "invalidResponse",
  "Invalid distance response": "invalidResponse",
  "Incomplete follows response": "incompleteResponse",
  "Incomplete distance response": "incompleteResponse",
  "Unable to load public follows": "loadFailed",
  "Sync failed": "syncFailed",
  "This graph is open in another tab. Close it there and try again.": "openAnotherTab",
} as const;

type GraphErrorKey = typeof sourceErrorKeys[keyof typeof sourceErrorKeys] | "oracleRequest";
type TranslateGraphError = (key: GraphErrorKey, values?: { status: string }) => string;

/** Unknown provider/browser errors use a localized fallback rather than raw English. */
export function formatGraphError(error: unknown, translate: TranslateGraphError, fallback: string): string {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (Object.hasOwn(sourceErrorKeys, message)) {
    return translate(sourceErrorKeys[message as keyof typeof sourceErrorKeys]);
  }
  const oracle = /^Oracle request failed \((\d{3})\)$/.exec(message);
  if (oracle) return translate("oracleRequest", { status: oracle[1] });
  return fallback;
}
