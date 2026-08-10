"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge, Button, Input, Section, SectionHeader } from "@/components/ui";
import {
  createIdentity,
  sendMessage,
  watchInbox,
  CHAT_RELAYS,
  nextId,
  type ChatMessage,
  type Identity,
  type TraceEntry,
} from "@/lib/client/pqChat";
import {
  hasExtension,
  connectExtension,
  sendFromExtension,
  watchExtensionInbox,
  type ExtensionIdentity,
} from "@/lib/client/pqExtension";

type Pane = { me: Identity; peer: Identity };

/**
 * A message we have published but not yet seen return from a relay.
 *
 * Kept separate from real messages on purpose. Showing it as delivered before the
 * relay hands it back would make the demo prove nothing — it would look identical
 * whether the network accepted the event or dropped it on the floor.
 */
type Pending = { id: string; from: string; to: string; content: string };

function shortNpub(npub: string) {
  return `${npub.slice(0, 12)}…${npub.slice(-6)}`;
}

/** One side of the conversation. */
function ChatPane({
  pane,
  messages,
  pending,
  onSend,
  busy,
  t,
}: {
  pane: Pane;
  messages: ChatMessage[];
  pending: Pending[];
  onSend: (text: string) => void;
  busy: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pending.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || busy) return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{pane.me.label}</h3>
          <Badge>{t("pane.pqReady")}</Badge>
        </div>
        <p className="mt-1 break-all font-mono text-xs text-gray-500 dark:text-gray-400">
          {shortNpub(pane.me.npub)}
        </p>
      </div>

      <div className="h-72 flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && pending.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("pane.empty")}</p>
        )}
        {messages.map(m => {
          const mine = m.from === pane.me.pubkey;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                {m.bytes > 0 && (
                  <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}>
                    {t("pane.wireSize", { bytes: m.bytes.toLocaleString() })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {pending.map(p => (
          <div key={p.id} className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl border border-dashed border-primary/50 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              <p className="whitespace-pre-wrap break-words">{p.content}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px]">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                {t("pane.awaitingRelay")}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-gray-200 p-3 dark:border-gray-800">
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={t("pane.placeholder", { peer: pane.peer.label })}
          aria-label={t("pane.placeholder", { peer: pane.peer.label })}
          className="flex-1"
        />
        <Button type="submit" disabled={busy || !draft.trim()}>
          {busy ? t("pane.sending") : t("pane.send")}
        </Button>
      </form>
    </div>
  );
}

/** The transcript: every step, with the raw event behind each one. */
function Inspector({ trace, t }: { trace: TraceEntry[]; t: ReturnType<typeof useTranslations> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (entry: TraceEntry) => {
    if (!entry.event) return;
    await navigator.clipboard.writeText(JSON.stringify(entry.event, null, 2));
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (trace.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t("inspector.empty")}</p>;
  }

  return (
    <ol className="space-y-2">
      {trace.map(entry => {
        const open = openId === entry.id;
        const tone =
          entry.kind === "error"
            ? "border-red-300 dark:border-red-800"
            : entry.kind === "event"
              ? "border-primary/40"
              : "border-gray-200 dark:border-gray-800";
        return (
          <li key={entry.id} className={`rounded-lg border ${tone}`}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : entry.id)}
              className="flex w-full items-start justify-between gap-3 p-3 text-left"
              aria-expanded={open}
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  {entry.label}
                </span>
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  {entry.from}
                  {entry.bytes ? ` · ${entry.bytes.toLocaleString()} bytes` : ""}
                </span>
              </span>
              {entry.event && (
                <span className="flex-shrink-0 text-xs text-primary">
                  {open ? t("inspector.hide") : t("inspector.show")}
                </span>
              )}
            </button>

            {open && (
              <div className="border-t border-gray-200 p-3 dark:border-gray-800">
                {entry.detail && (
                  <p className="mb-3 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                    {entry.detail}
                  </p>
                )}
                {entry.event && (
                  <>
                    <div className="mb-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
                        kind {entry.event.kind}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
                        {entry.event.tags.length} tags
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
                        content {entry.event.content.length.toLocaleString()} chars
                      </span>
                      <button
                        type="button"
                        onClick={() => copy(entry)}
                        className="rounded bg-primary/10 px-2 py-1 text-primary"
                      >
                        {copiedId === entry.id ? t("inspector.copied") : t("inspector.copy")}
                      </button>
                    </div>
                    <pre className="max-h-72 overflow-auto rounded bg-gray-900 p-3 text-[11px] leading-relaxed text-gray-100">
                      {JSON.stringify(entry.event, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Drive the demo from a real identity held in the browser extension.
 *
 * Receiving requires this identity to have published a kind:10203 attestation, because
 * that is how a sender learns its ML-KEM key — there is deliberately no way to read one
 * out of the extension. When it is missing we say so rather than pretending.
 */
function ExtensionPane({
  peers,
  onTrace,
  t,
}: {
  peers: Identity[];
  onTrace: (e: Omit<TraceEntry, "id" | "at">) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [available, setAvailable] = useState(false);
  const [me, setMe] = useState<ExtensionIdentity | null>(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [received, setReceived] = useState<{ id: string; sender: string; content: string }[]>([]);

  useEffect(() => setAvailable(hasExtension()), []);

  useEffect(() => {
    if (!me?.pubkey) return;
    return watchExtensionInbox(
      me.pubkey,
      m => setReceived(prev => (prev.some(p => p.id === m.id) ? prev : [...prev, m])),
      (label, detail) => onTrace({ from: t("extension.label"), kind: "error", label, detail }),
    );
  }, [me?.pubkey, onTrace, t]);

  const connect = async () => {
    setError("");
    try {
      setMe(await connectExtension());
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const send = async (peer: Identity) => {
    if (!me || !draft.trim()) return;
    setBusy(true);
    try {
      const kemB64 = btoa(String.fromCharCode(...peer.pq.kem.publicKey));
      const res = await sendFromExtension(me.pubkey, peer.pubkey, kemB64, draft.trim());
      onTrace({
        from: t("extension.label"),
        kind: "event",
        label: t("extension.sent", { peer: peer.label, count: res.accepted.length }),
        detail: t("extension.sentDetail"),
        event: res.wrap,
        bytes: JSON.stringify(res.wrap).length,
      });
      setDraft("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!available) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("extension.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">{t("extension.title")}</h3>
        {!me && <Button onClick={connect}>{t("extension.connect")}</Button>}
      </div>

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {me && (
        <>
          <p className="mt-2 break-all font-mono text-xs text-gray-500 dark:text-gray-400">{me.npub}</p>

          {me.attestation.status === "found" && me.attestation.problems.length === 0 ? (
            <p className="mt-3 text-sm text-green-700 dark:text-green-400">{t("extension.canReceive")}</p>
          ) : (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">{t("extension.cannotReceive")}</p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={t("extension.placeholder")}
              aria-label={t("extension.placeholder")}
              className="flex-1"
            />
            {peers.map(p => (
              <Button key={p.pubkey} onClick={() => send(p)} disabled={busy || !draft.trim()}>
                {busy ? t("pane.sending") : t("extension.sendTo", { peer: p.label })}
              </Button>
            ))}
          </div>

          {received.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {received.map(r => (
                <li key={r.id}>&ldquo;{r.content}&rdquo;</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default function ChatContent() {
  const t = useTranslations("pqcChat");
  const [alice, setAlice] = useState<Identity | null>(null);
  const [bob, setBob] = useState<Identity | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  // Ids already seen coming back. The relay round trip can beat `setPending`, in which
  // case the arrival clears an empty list and the entry is added afterwards, stranded
  // as "awaiting" forever. Checking against this makes the order irrelevant.
  const deliveredIds = useRef<Set<string>>(new Set());
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [lastSize, setLastSize] = useState<{ pq: number; classic: number } | null>(null);

  const addTrace = useCallback((entry: Omit<TraceEntry, "id" | "at">) => {
    setTrace(prev => [{ ...entry, id: nextId(), at: Date.now() }, ...prev].slice(0, 60));
  }, []);

  // Identities are generated in the browser and never leave it.
  useEffect(() => {
    const a = createIdentity(t("alice"));
    const b = createIdentity(t("bob"));
    setAlice(a);
    setBob(b);
    addTrace({
      from: "—",
      kind: "info",
      label: t("trace.identitiesCreated"),
      detail: t("trace.identitiesDetail"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!alice || !bob) return;
    const onMessage = (m: ChatMessage) => {
      deliveredIds.current.add(m.id);
      setMessages(prev => (prev.some(p => p.id === m.id) ? prev : [...prev, m]));
      // The wrap id we published is the id we get back, so this clears the exact
      // message rather than guessing by content.
      setPending(prev => prev.filter(p => p.id !== m.id));
    };
    const stopA = watchInbox(alice, [bob], onMessage, addTrace);
    const stopB = watchInbox(bob, [alice], onMessage, addTrace);
    return () => {
      stopA();
      stopB();
    };
  }, [alice, bob, addTrace]);

  const send = useCallback(
    async (from: Identity, to: Identity, text: string) => {
      setBusy(true);
      try {
        const res = await sendMessage(from, to, text, addTrace);
        setLastSize({ pq: res.bytes, classic: res.classicBytes });
        // Deliberately NOT added to `messages` here. It stays in flight until a relay
        // hands it back and it decrypts — that round trip is the thing this page exists
        // to demonstrate, and faking it would make a failed publish look successful.
        setPending(prev =>
          deliveredIds.current.has(res.wrap.id)
            ? prev // already came back while we were still publishing
            : [...prev, { id: res.wrap.id, from: from.pubkey, to: to.pubkey, content: text }],
        );
      } catch (e) {
        addTrace({ from: from.label, kind: "error", label: t("trace.sendFailed"), detail: (e as Error).message });
      } finally {
        setBusy(false);
      }
    },
    [addTrace, t],
  );

  const ratio = useMemo(
    () => (lastSize && lastSize.classic ? (lastSize.pq / lastSize.classic).toFixed(1) : null),
    [lastSize],
  );

  if (!alice || !bob) {
    return (
      <Section>
        <p className="text-center text-gray-500 dark:text-gray-400">{t("generating")}</p>
      </Section>
    );
  }

  return (
    <>
      <Section>
        <div className="mx-auto max-w-5xl text-center">
          <Badge>{t("badge")}</Badge>
          <h1 className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">{t("liveNotice")}</p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <ChatPane
            pane={{ me: alice, peer: bob }}
            messages={messages}
            pending={pending.filter(p => p.from === alice.pubkey)}
            onSend={text => send(alice, bob, text)}
            busy={busy}
            t={t}
          />
          <ChatPane
            pane={{ me: bob, peer: alice }}
            messages={messages}
            pending={pending.filter(p => p.from === bob.pubkey)}
            onSend={text => send(bob, alice, text)}
            busy={busy}
            t={t}
          />
        </div>

        <div className="mx-auto mt-6 max-w-5xl">
          <ExtensionPane peers={[alice, bob]} onTrace={addTrace} t={t} />
        </div>

        {lastSize && (
          <div className="mx-auto mt-6 max-w-5xl rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-300">
              {t("sizeCompare", {
                pq: lastSize.pq.toLocaleString(),
                classic: lastSize.classic.toLocaleString(),
                ratio: ratio ?? "—",
              })}
            </p>
          </div>
        )}
      </Section>

      <Section>
        <div className="mx-auto max-w-5xl">
          <SectionHeader title={t("inspector.title")} description={t("inspector.subtitle")} />
          <Inspector trace={trace} t={t} />
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {t("inspector.relays", { relays: CHAT_RELAYS.join(", ") })}
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 p-8 text-center dark:border-gray-800">
          <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t("collab.eyebrow")}
          </p>
          <a
            href="https://quantakrypto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block"
            aria-label="QuantaKrypto"
          >
            {/* Two files rather than one CSS-filtered logo: the mark is not */}
            {/* monochrome, so recolouring it would misrepresent the brand. */}
            <img
              src="/brand/quantakrypto-logo-dark.svg"
              alt="QuantaKrypto"
              className="h-10 w-auto dark:hidden"
            />
            <img
              src="/brand/quantakrypto-logo-light.svg"
              alt="QuantaKrypto"
              className="hidden h-10 w-auto dark:block"
            />
          </a>
          <p className="mx-auto mt-5 max-w-xl text-gray-600 dark:text-gray-300">
            {t("collab.body")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="https://quantakrypto.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t("collab.linkSite")}
            </a>
            <a
              href="https://github.com/nostr-wot/nostr-wot-sdk/tree/main/packages/pq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t("collab.linkSpec")}
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
