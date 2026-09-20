"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { nip19 } from "nostr-tools";
import { DATABASE_CHANGE, discoverSavedGraphs, listSavedGraphs, type SavedGraph } from "@/lib/graph/databases";

export default function SavedGraphs({ onOpen, onRemove }: {
  onOpen: (key: string) => void; onRemove: (keys: string[]) => Promise<void>;
}) {
  const t = useTranslations("playground.saved"), locale = useLocale();
  const [items, setItems] = useState<SavedGraph[]>([]);
  const [selected, setSelected] = useState(new Set<string>());
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const update = () => { try { if (active) setItems(listSavedGraphs()); } catch { if (active) setError(t("unavailable")); } };
    update();
    void discoverSavedGraphs().then(update).catch(() => { if (active) setError(t("unavailable")); });
    window.addEventListener(DATABASE_CHANGE, update); window.addEventListener("storage", update);
    return () => { active = false; window.removeEventListener(DATABASE_CHANGE, update); window.removeEventListener("storage", update); };
  }, [t]);
  const date = (time: number | null) => time ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(time) : t("never");
  async function remove(keys: string[]) {
    if (!keys.length || !window.confirm(t("confirmDelete", { count: keys.length }))) return;
    setBusy(true); setError(null);
    try { await onRemove(keys); setSelected(new Set()); } catch (e) { setError(e instanceof Error ? e.message : t("deleteFailed")); }
    finally { setBusy(false); }
  }
  return <details className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
    <summary className="cursor-pointer font-medium">{t("title", { count: items.length })}</summary>
    <p className="mt-2 text-sm text-gray-500">{t("description")}</p>
    {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    {!items.length ? <p className="mt-3 text-sm text-gray-500">{t("empty")}</p> : <>
      <div className="my-3 flex flex-wrap gap-3">
        <button type="button" disabled={busy || !selected.size} onClick={() => remove(items.filter(x => selected.has(x.pubkey)).map(x => x.pubkey))} className="text-sm text-red-600 disabled:opacity-40">{t("deleteSelected")}</button>
        <button type="button" disabled={busy} onClick={() => remove(items.map(x => x.pubkey))} className="text-sm text-red-600 disabled:opacity-40">{t("deleteAll")}</button>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map(item => <li key={item.pubkey} className="flex gap-3 py-3">
          <input type="checkbox" className="mt-1 self-start" aria-label={t("select", { key: nip19.npubEncode(item.pubkey) })} checked={selected.has(item.pubkey)} disabled={busy}
            onChange={event => setSelected(previous => { const next = new Set(previous); if (event.target.checked) next.add(item.pubkey); else next.delete(item.pubkey); return next; })} />
          <div className="min-w-0 flex-1">
            <button type="button" onClick={() => onOpen(item.pubkey)} disabled={busy} className="block w-full truncate text-left text-sm font-mono text-primary" title={nip19.npubEncode(item.pubkey)}>{nip19.npubEncode(item.pubkey)}</button>
            <p className="mt-1 text-xs text-gray-500">{t("counts", { nodes: item.nodes, edges: item.edges })} · {t(`status.${item.status}`)}</p>
            <p className="mt-1 text-xs text-gray-500">{t("created", { date: date(item.createdAt) })}</p>
            <p className="mt-1 text-xs text-gray-500">{t("lastSync", { date: date(item.lastSync) })}</p>
            <p className="mt-1 text-xs text-gray-500">{t("lastAttempt", { date: date(item.lastAttempt) })}{item.durationMs !== null && ` · ${new Intl.NumberFormat(locale, { style: "unit", unit: "second", maximumFractionDigits: 1 }).format(item.durationMs / 1000)}`}</p>
          </div>
          <button type="button" disabled={busy} onClick={() => remove([item.pubkey])} className="self-start text-sm text-red-600 disabled:opacity-40">{t("delete")}</button>
        </li>)}
      </ul>
    </>}
  </details>;
}
