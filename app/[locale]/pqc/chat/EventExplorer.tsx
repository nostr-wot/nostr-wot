"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui";
import { analyzeEvent, type Keyholder, type Layer } from "@/lib/client/pqLayers";
import { paletteFor } from "@/lib/client/pqPeople";
import { CHAT_RELAYS, type TraceEntry } from "@/lib/client/pqChat";

/** One horizontal band per byte range, sized in proportion. */
function ByteMap({ layer }: { layer: Layer }) {
  if (!layer.segments) return null;
  const total = layer.segments.reduce((n, s) => n + s.length, 0);
  const tones = [
    "bg-gray-400",
    "bg-gray-500",
    "bg-primary",
    "bg-amber-500",
    "bg-emerald-500",
  ];

  return (
    <div className="mt-3">
      <div className="flex h-6 w-full overflow-hidden rounded">
        {layer.segments.map((s, i) => (
          <div
            key={s.name}
            className={`${tones[i % tones.length]} h-full`}
            style={{ width: `${Math.max((s.length / total) * 100, 0.6)}%` }}
            title={`${s.name}: ${s.length} bytes`}
          />
        ))}
      </div>
      <dl className="mt-3 space-y-2">
        {layer.segments.map((s, i) => (
          <div key={s.name} className="flex gap-3">
            <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${tones[i % tones.length]}`} />
            <div className="min-w-0">
              <dt className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {s.name}
                <span className="ml-2 font-mono font-normal text-gray-500 dark:text-gray-400">
                  @{s.offset} · {s.length.toLocaleString()} B
                </span>
              </dt>
              <dd className="text-xs text-gray-600 dark:text-gray-400">{s.note}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

function LayerCard({
  layer,
  index,
  t,
}: {
  layer: Layer;
  index: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const [showJson, setShowJson] = useState(false);
  const sealed = layer.state === "sealed";

  return (
    <li
      className={`rounded-xl border p-4 ${
        sealed
          ? "border-dashed border-gray-300 dark:border-gray-700"
          : "border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {index}
        </span>
        <h4 className="font-semibold text-gray-900 dark:text-white">{layer.title}</h4>
        {layer.kind !== null && (
          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            kind {layer.kind}
          </span>
        )}
        <span
          className={`rounded px-2 py-0.5 text-[11px] ${
            sealed
              ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
          }`}
        >
          {sealed ? t("explorer.sealed") : t("explorer.opened")}
        </span>
        {layer.bytes > 0 && (
          <span className="ml-auto font-mono text-[11px] text-gray-500 dark:text-gray-400">
            {layer.bytes.toLocaleString()} B
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{layer.what}</p>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-medium">{t("explorer.relaySees")}</span> {layer.visibleToRelay}
      </p>

      {layer.fields.length > 0 && (
        <dl className="mt-3 space-y-1">
          {layer.fields.map(f => (
            <div key={f.label} className="flex flex-wrap gap-x-2 text-xs">
              <dt className="min-w-28 text-gray-500 dark:text-gray-400">{f.label}</dt>
              <dd
                className={`min-w-0 flex-1 break-all text-gray-800 dark:text-gray-200 ${
                  f.mono ? "font-mono" : ""
                }`}
              >
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <ByteMap layer={layer} />

      {layer.json != null && (
        <>
          <button
            type="button"
            onClick={() => setShowJson(v => !v)}
            className="mt-3 text-xs text-primary hover:underline"
          >
            {showJson ? t("explorer.hideJson") : t("explorer.showJson")}
          </button>
          {showJson && (
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-gray-900 p-3 text-[11px] leading-relaxed text-gray-100">
              {JSON.stringify(layer.json, null, 2)}
            </pre>
          )}
        </>
      )}
    </li>
  );
}

/**
 * The event history, filterable by account, with each event opened layer by layer.
 *
 * Filtering by account is not cosmetic: the same gift wrap looks completely different
 * depending on whose keys you hold, and being able to switch between those views is the
 * clearest way to show what the encryption is actually doing.
 */
export default function EventExplorer({
  open,
  onClose,
  trace,
  keyholders,
  people,
  onRegenerate,
  regenerating,
  t,
}: {
  open: boolean;
  onClose: () => void;
  trace: TraceEntry[];
  keyholders: Keyholder[];
  people: { pubkey: string; label: string }[];
  onRegenerate?: () => void;
  regenerating?: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [account, setAccount] = useState<string | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Every step, not only the ones carrying an event: "encapsulating to Bob's key" is
  // part of the story even though it produced nothing to inspect.
  const events = useMemo(
    () => trace.filter(e => account === "all" || e.owner === account),
    [trace, account],
  );

  const selected = useMemo(
    () => events.find(e => e.id === selectedId) ?? events[0] ?? null,
    [events, selectedId],
  );

  const layers = useMemo(
    () => (selected?.event ? analyzeEvent(selected.event, keyholders) : []),
    [selected, keyholders],
  );

  const host = (url: string) => url.replace(/^wss:\/\//, "").replace(/\/$/, "");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("explorer.title")}
      subtitle={t("explorer.subtitle")}
      closeLabel={t("explorer.close")}
      size="xl"
      footer={
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 p-3 text-[11px] text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <span>{t("inspector.relays", { relays: CHAT_RELAYS.map(host).join(", ") })}</span>
          {/* Kept here rather than on the page: once registered there is nothing left to
              decide, so starting over belongs with the history it would discard. */}
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerating}
              className="text-primary hover:underline disabled:opacity-50"
            >
              {regenerating ? t("status.working") : t("status.newIdentities")}
            </button>
          )}
        </footer>
      }
    >
      <div className="flex flex-wrap gap-2 border-b border-gray-200 p-3 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setAccount("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            account === "all"
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {t("explorer.all")}
        </button>
        {people.map(p => {
          const pal = paletteFor(p.pubkey);
          const active = account === p.pubkey;
          return (
            <button
              key={p.pubkey}
              type="button"
              onClick={() => setAccount(p.pubkey)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${active ? pal.chipActive : pal.chip}`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="grid min-h-0 flex-1 gap-0 overflow-hidden md:grid-cols-[18rem_1fr]">
        <ol className="min-h-0 overflow-y-auto border-b border-gray-200 p-2 md:border-b-0 md:border-r dark:border-gray-800">
          {events.length === 0 && (
            <li className="p-3 text-sm text-gray-500 dark:text-gray-400">{t("explorer.empty")}</li>
          )}
          {events.map(e => {
            const pal = paletteFor(e.owner);
            const active = selected?.id === e.id;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(e.id)}
                  className={`w-full rounded-lg p-3 text-left ${
                    active ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 flex-shrink-0 rounded-full ${pal.dot}`} />
                    <span
                      className={`truncate text-sm ${
                        e.kind === "error"
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {e.label}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[11px] text-gray-500 dark:text-gray-400">
                    {e.event
                      ? `kind ${e.event.kind} · ${(e.bytes ?? 0).toLocaleString()} B`
                      : t("explorer.step")}
                    {e.relays?.length ? ` · ${t("explorer.relayCount", { count: e.relays.length })}` : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="min-h-0 overflow-y-auto p-4">
          {!selected ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("explorer.pick")}</p>
          ) : (
            <>
              <h3 className="font-semibold text-gray-900 dark:text-white">{selected.label}</h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {selected.from} · {new Date(selected.at).toLocaleTimeString()}
                {selected.relays?.length ? ` · ${selected.relays.map(host).join(", ")}` : ""}
              </p>
              {selected.detail && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                  {selected.detail}
                </p>
              )}

              {layers.length > 0 && (
                <>
                  <p className="mb-3 mt-5 text-xs text-gray-500 dark:text-gray-400">
                    {t("explorer.layersIntro", { count: layers.length })}
                  </p>
                  <ol className="space-y-3">
                    {layers.map((l, i) => (
                      <LayerCard key={l.id} layer={l} index={i + 1} t={t} />
                    ))}
                  </ol>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
