"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge, Button, Input, Section, SectionHeader } from "@/components/ui";
import {
  createIdentity,
  identityFromMnemonic,
  publishAttestation,
  resolveRecipient,
  sendMessage,
  watchInbox,
  readSession,
  writeSession,
  subscribeRelayActivity,
  CHAT_RELAYS,
  nextId,
  type ChatMessage,
  type Identity,
  type Recipient,
  type RelayActivity,
  type TraceEntry,
} from "@/lib/client/pqChat";
import {
  hasExtension,
  connectExtension,
  extensionRecipient,
  sendFromExtension,
  watchExtensionInbox,
  type ExtensionIdentity,
} from "@/lib/client/pqExtension";

/** How long a published message may stay unseen before we stop implying it is in flight. */
const STALL_AFTER_MS = 30_000;

/**
 * A message we have published but not yet seen return from a relay.
 *
 * Kept separate from real messages on purpose. Showing it as delivered before the
 * relay hands it back would make the demo prove nothing — it would look identical
 * whether the network accepted the event or dropped it on the floor.
 */
type Pending = {
  id: string;
  from: string;
  to: string;
  content: string;
  /** sending → sent (relays took it) → stalled or failed if it never comes back. */
  status: "sending" | "sent" | "stalled" | "failed";
  acceptedBy?: number;
};

/** Anyone who can send: the in-page identities, or the extension. */
type Sender = { pubkey: string; label: string; npub: string; identity?: Identity };

function shortNpub(npub: string) {
  return `${npub.slice(0, 12)}…${npub.slice(-6)}`;
}

/**
 * One participant's view.
 *
 * Alice, Bob and the extension all render through this, so a message looks the same
 * wherever it lands and there is no privileged pane.
 */
function ChatPane({
  me,
  badge,
  notice,
  messages,
  pending,
  nameFor,
  targets,
  onSend,
  busy,
  t,
  children,
}: {
  me: Sender;
  badge: string;
  notice?: { tone: "ok" | "warn"; text: string };
  messages: ChatMessage[];
  pending: Pending[];
  nameFor: (pubkey: string) => string;
  targets: Recipient[];
  onSend: (to: Recipient, text: string) => void;
  busy: boolean;
  t: ReturnType<typeof useTranslations>;
  children?: React.ReactNode;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const mine = useMemo(
    () => messages.filter(m => m.from === me.pubkey || m.to === me.pubkey),
    [messages, me.pubkey],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mine.length, pending.length]);

  const send = (to: Recipient) => {
    if (!draft.trim() || busy) return;
    onSend(to, draft.trim());
    setDraft("");
  };

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{me.label}</h3>
          <Badge>{badge}</Badge>
        </div>
        <p className="mt-1 break-all font-mono text-xs text-gray-500 dark:text-gray-400">
          {shortNpub(me.npub)}
        </p>
        {notice && (
          <p
            className={`mt-2 text-xs ${
              notice.tone === "ok"
                ? "text-green-700 dark:text-green-400"
                : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {notice.text}
          </p>
        )}
        {children}
      </div>

      <div className="h-72 flex-1 space-y-2 overflow-y-auto p-4">
        {mine.length === 0 && pending.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("pane.empty")}</p>
        )}
        {mine.map(m => {
          const outgoing = m.from === me.pubkey;
          return (
            <div key={m.id} className={`flex ${outgoing ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  outgoing
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                <p
                  className={`mb-0.5 text-[11px] font-medium ${
                    outgoing ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {nameFor(m.from)} → {nameFor(m.to)}
                </p>
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                {m.bytes > 0 && (
                  <p
                    className={`mt-1 text-[11px] ${
                      outgoing ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {t("pane.wireSize", { bytes: m.bytes.toLocaleString() })}
                    {/* Naming the relay is the proof that this was not echoed locally. */}
                    {m.relays.length > 0 &&
                      ` · ${t("pane.viaRelay", {
                        relay: m.relays[0]!.replace(/^wss:\/\//, "").replace(/\/$/, ""),
                      })}`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {pending.map(p => {
          const bad = p.status === "failed" || p.status === "stalled";
          return (
            <div key={p.id} className="flex justify-end">
              <div
                className={`max-w-[85%] rounded-2xl border border-dashed px-3 py-2 text-sm ${
                  bad
                    ? "border-red-400/60 text-red-700 dark:text-red-400"
                    : "border-primary/50 text-gray-500 dark:text-gray-400"
                }`}
              >
                <p className="text-[11px] font-medium opacity-80">
                  {nameFor(p.from)} → {nameFor(p.to)}
                </p>
                <p className="whitespace-pre-wrap break-words">{p.content}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px]">
                  {!bad && (
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  )}
                  {p.status === "sending" && t("pane.sendingStatus")}
                  {p.status === "sent" && t("pane.sentAwaiting", { count: p.acceptedBy ?? 0 })}
                  {p.status === "stalled" && t("pane.stalled")}
                  {p.status === "failed" && t("pane.failed")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-200 p-3 dark:border-gray-800">
        {targets.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("pane.noTargets")}</p>
        ) : (
          <>
            <Input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={t("pane.placeholder")}
              aria-label={t("pane.placeholder")}
            />
            <div className="flex flex-wrap gap-2">
              {targets.map(to => (
                <Button
                  key={to.pubkey}
                  type="button"
                  onClick={() => send(to)}
                  disabled={busy || !draft.trim()}
                >
                  {busy ? t("pane.sending") : t("pane.sendTo", { peer: to.label })}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Live view of the relay connections.
 *
 * The page claims nothing is displayed until the network hands it back. That claim is
 * only worth anything if the network is visible, so this shows the connection state of
 * every relay, flashes on each inbound event, and names the relay that served it.
 */
function RelayActivityStrip({
  activity,
  t,
}: {
  activity: RelayActivity;
  t: ReturnType<typeof useTranslations>;
}) {
  const [syncing, setSyncing] = useState(false);

  // A flash on each arrival, so an event that lands while you are reading is not missed.
  useEffect(() => {
    if (!activity.last) return;
    setSyncing(true);
    const timer = setTimeout(() => setSyncing(false), 1400);
    return () => clearTimeout(timer);
  }, [activity.last]);

  const host = (url: string) => url.replace(/^wss:\/\//, "").replace(/\/$/, "");

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        syncing ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("relays.title")}</h3>
        <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {syncing && <span className="inline-block h-2 w-2 animate-ping rounded-full bg-primary" />}
          {syncing
            ? t("relays.syncing", { relays: activity.last?.relays.map(host).join(", ") || "—" })
            : t("relays.received", { count: activity.received })}
        </span>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        {CHAT_RELAYS.map(url => {
          const up = activity.status[url];
          const serving = syncing && !!activity.last?.relays.includes(url);
          return (
            <li key={url} className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  serving ? "bg-primary" : up ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
              <span
                className={
                  up ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
                }
              >
                {host(url)}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {activity.caughtUp.length
          ? t("relays.caughtUp", { inboxes: activity.caughtUp.join(", ") })
          : t("relays.waiting")}
      </p>
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

export default function ChatContent() {
  const t = useTranslations("pqcChat");

  const [alice, setAlice] = useState<Identity | null>(null);
  const [bob, setBob] = useState<Identity | null>(null);
  /** Everyone reachable, as discovered from their published attestations. */
  const [roster, setRoster] = useState<Recipient[]>([]);
  const [phase, setPhase] = useState<
    "generating" | "idle" | "publishing" | "resolving" | "ready" | "failed"
  >("generating");

  const [extension, setExtension] = useState<ExtensionIdentity | null>(null);
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [extensionError, setExtensionError] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [busyKeys, setBusyKeys] = useState<string[]>([]);
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const [lastSize, setLastSize] = useState<{ pq: number; classic: number } | null>(null);
  const [activity, setActivity] = useState<RelayActivity>({
    status: {},
    received: 0,
    last: null,
    caughtUp: [],
  });

  useEffect(() => subscribeRelayActivity(setActivity), []);

  // Ids already seen coming back. The relay round trip can beat the state update that
  // records the message as in flight, which would otherwise strand it as "awaiting"
  // forever. Checking against this makes the ordering irrelevant.
  const deliveredIds = useRef<Set<string>>(new Set());
  // Names resolved through a ref so long-lived relay subscriptions always see the
  // current roster without being torn down and resubscribed on every change.
  const namesRef = useRef<Map<string, string>>(new Map());

  const addTrace = useCallback((entry: Omit<TraceEntry, "id" | "at">) => {
    setTrace(prev => [{ ...entry, id: nextId(), at: Date.now() }, ...prev].slice(0, 80));
  }, []);

  const nameFor = useCallback(
    (pubkey: string) => namesRef.current.get(pubkey) ?? `${pubkey.slice(0, 8)}…`,
    [],
  );

  const receive = useCallback((m: ChatMessage) => {
    deliveredIds.current.add(m.id);
    setMessages(prev => (prev.some(p => p.id === m.id) ? prev : [...prev, m]));
    setPending(prev => prev.filter(p => p.id !== m.id));
  }, []);

  /**
   * Publish both attestations, then read the keys back off the relays.
   *
   * The read-back is the point: nothing can be sent until a key has come from a relay,
   * so the page cannot quietly use in-memory key material a real client would not have.
   */
  const begin = useCallback(
    async (a: Identity, b: Identity, alreadyPublished: boolean) => {
      let published = alreadyPublished;

      for (let round = 0; round < 2; round++) {
        if (!published) {
          setPhase("publishing");
          const results = await Promise.all([
            publishAttestation(a, addTrace),
            publishAttestation(b, addTrace),
          ]);
          if (results.some(r => r.accepted.length === 0)) {
            setPhase("failed");
            return;
          }
          published = true;
          writeSession({ alice: a.mnemonic, bob: b.mnemonic, published: true });
        }

        setPhase("resolving");
        const found = (
          await Promise.all([
            resolveRecipient(a.pubkey, a.label, addTrace),
            resolveRecipient(b.pubkey, b.label, addTrace),
          ])
        ).filter(Boolean) as Recipient[];

        if (found.length === 2) {
          setRoster(found);
          setPhase("ready");
          return;
        }

        // A restored session claimed to be published but the relays disagree — the
        // events aged out, or were never stored. Publish again and try once more.
        if (alreadyPublished && round === 0) {
          published = false;
          continue;
        }

        setRoster(found);
        setPhase("failed");
        return;
      }
    },
    [addTrace],
  );

  /**
   * Restore this tab's identities, or mint a pair.
   *
   * Nothing is published here. Attestations are ~12 kB each and replaceable only per
   * author, so publishing on load would leave permanent junk on public relays for every
   * visit and every crawler. It takes a deliberate click instead.
   */
  useEffect(() => {
    const saved = readSession();
    const a = saved ? identityFromMnemonic(t("alice"), saved.alice) : createIdentity(t("alice"));
    const b = saved ? identityFromMnemonic(t("bob"), saved.bob) : createIdentity(t("bob"));

    namesRef.current.set(a.pubkey, a.label);
    namesRef.current.set(b.pubkey, b.label);
    setAlice(a);
    setBob(b);
    addTrace({
      from: "—",
      kind: "info",
      label: t("trace.identitiesCreated"),
      detail: t("trace.identitiesDetail"),
    });

    if (saved?.published) {
      void begin(a, b, true); // already on the relays; just find the keys again
    } else {
      setPhase("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!alice || !bob) return;
    const stopA = watchInbox(alice, nameFor, receive, addTrace);
    const stopB = watchInbox(bob, nameFor, receive, addTrace);
    return () => {
      stopA();
      stopB();
    };
  }, [alice, bob, addTrace, nameFor, receive]);

  useEffect(() => setExtensionAvailable(hasExtension()), []);

  useEffect(() => {
    if (!extension) return;
    return watchExtensionInbox(
      extension.pubkey,
      t("extension.paneLabel"),
      m =>
        receive({
          id: m.id,
          from: m.sender,
          to: extension.pubkey,
          content: m.content,
          at: m.at,
          bytes: m.bytes,
          classicBytes: 0,
          relays: m.relays,
        }),
      (label, detail) => addTrace({ from: t("extension.paneLabel"), kind: "error", label, detail }),
    );
  }, [extension, receive, addTrace, t]);

  const connect = useCallback(async () => {
    setExtensionError("");
    try {
      const me = await connectExtension();
      namesRef.current.set(me.pubkey, t("extension.paneLabel"));
      setExtension(me);

      const asRecipient = extensionRecipient(me, t("extension.paneLabel"));
      if (asRecipient) {
        // Reachable, so Alice and Bob get a third person to talk to.
        setRoster(prev => (prev.some(r => r.pubkey === me.pubkey) ? prev : [...prev, asRecipient]));
        addTrace({
          from: t("extension.paneLabel"),
          kind: "info",
          label: `Found your ML-KEM key in your attestation`,
          detail:
            "Read off the relays, exactly as for the demo identities. Alice and Bob can now encrypt to you.",
        });
      } else {
        addTrace({
          from: t("extension.paneLabel"),
          kind: "error",
          label: "No usable attestation for your identity",
          detail:
            "You can still send, because sending only needs the recipient's key. Nobody can send to you until you publish one from the extension.",
        });
      }
    } catch (e) {
      setExtensionError((e as Error).message);
    }
  }, [addTrace, t]);

  /**
   * Publish a message and track it until a relay hands it back.
   *
   * Nothing is inserted into `messages` here. A message becomes real when it returns
   * from the network and decrypts — faking that step would make a total failure look
   * identical to a success.
   */
  const send = useCallback(
    async (from: Sender, to: Recipient, text: string) => {
      const placeholder = nextId();
      setBusyKeys(prev => [...prev, from.pubkey]);
      setPending(prev => [
        ...prev,
        { id: placeholder, from: from.pubkey, to: to.pubkey, content: text, status: "sending" },
      ]);

      try {
        let wrapId: string;
        let accepted: string[];

        if (from.identity) {
          const res = await sendMessage(from.identity, to, text, addTrace);
          wrapId = res.wrap.id;
          accepted = res.accepted;
          setLastSize({ pq: res.bytes, classic: res.classicBytes });
        } else {
          // The extension signs and encrypts; only the outer wrap is built here.
          const res = await sendFromExtension(from.pubkey, to, text);
          wrapId = res.wrap.id;
          accepted = res.accepted;
          addTrace({
            from: from.label,
            kind: accepted.length ? "event" : "error",
            label: t("extension.sent", { peer: to.label, count: accepted.length }),
            detail: t("extension.sentDetail"),
            event: res.wrap,
            bytes: JSON.stringify(res.wrap).length,
          });
        }

        setPending(prev => {
          const rest = prev.filter(p => p.id !== placeholder);
          if (deliveredIds.current.has(wrapId)) return rest; // beat us back from the relay
          return [
            ...rest,
            {
              id: wrapId,
              from: from.pubkey,
              to: to.pubkey,
              content: text,
              status: accepted.length ? "sent" : "failed",
              acceptedBy: accepted.length,
            },
          ];
        });

        // A message that never returns must stop looking like one still in flight.
        if (accepted.length) {
          setTimeout(() => {
            setPending(prev =>
              prev.map(p => (p.id === wrapId && p.status === "sent" ? { ...p, status: "stalled" } : p)),
            );
          }, STALL_AFTER_MS);
        }
      } catch (e) {
        setPending(prev =>
          prev.map(p => (p.id === placeholder ? { ...p, status: "failed" as const } : p)),
        );
        addTrace({ from: from.label, kind: "error", label: t("trace.sendFailed"), detail: (e as Error).message });
      } finally {
        setBusyKeys(prev => prev.filter(k => k !== from.pubkey));
      }
    },
    [addTrace, t],
  );

  const ratio = useMemo(
    () => (lastSize && lastSize.classic ? (lastSize.pq / lastSize.classic).toFixed(1) : null),
    [lastSize],
  );

  const targetsFor = useCallback(
    (pubkey: string) => roster.filter(r => r.pubkey !== pubkey),
    [roster],
  );

  const statusNotice = useMemo((): { tone: "ok" | "warn"; text: string } | undefined => {
    if (phase === "idle") return { tone: "warn", text: t("status.notPublished") };
    if (phase === "publishing") return { tone: "warn", text: t("status.publishing") };
    if (phase === "resolving") return { tone: "warn", text: t("status.resolving") };
    if (phase === "failed") return { tone: "warn", text: t("status.failed") };
    return undefined;
  }, [phase, t]);

  if (!alice || !bob) {
    return (
      <Section>
        <p className="text-center text-gray-500 dark:text-gray-400">{t("generating")}</p>
      </Section>
    );
  }

  const asSender = (id: Identity): Sender => ({
    pubkey: id.pubkey,
    label: id.label,
    npub: id.npub,
    identity: id,
  });

  return (
    <>
      <Section>
        <div className="mx-auto max-w-5xl text-center">
          <Badge>{t("badge")}</Badge>
          <h1 className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">{t("liveNotice")}</p>

          {/* Publishing is a deliberate act, not a side effect of loading the page. */}
          {(phase === "idle" || phase === "failed") && (
            <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-gray-200 p-6 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-300">{t("status.startExplainer")}</p>
              <div className="mt-4">
                <Button onClick={() => void begin(alice, bob, false)}>
                  {phase === "failed" ? t("status.retry") : t("status.start")}
                </Button>
              </div>
            </div>
          )}

          {(phase === "publishing" || phase === "resolving") && (
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              {phase === "publishing" ? t("status.publishing") : t("status.resolving")}
            </p>
          )}
        </div>
      </Section>

      <Section>
        <div className="mx-auto mb-6 max-w-6xl">
          <RelayActivityStrip activity={activity} t={t} />
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[alice, bob].map(id => (
            <ChatPane
              key={id.pubkey}
              me={asSender(id)}
              badge={t("pane.pqReady")}
              notice={statusNotice}
              messages={messages}
              pending={pending.filter(p => p.from === id.pubkey)}
              nameFor={nameFor}
              targets={targetsFor(id.pubkey)}
              onSend={(to, text) => send(asSender(id), to, text)}
              busy={busyKeys.includes(id.pubkey)}
              t={t}
            />
          ))}

          {!extensionAvailable ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("extension.notFound")}</p>
            </div>
          ) : !extension ? (
            <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t("extension.title")}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t("extension.connectHint")}</p>
              <div className="mt-4">
                <Button onClick={connect}>{t("extension.connect")}</Button>
              </div>
              {extensionError && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">{extensionError}</p>
              )}
            </div>
          ) : (
            <ChatPane
              me={{ pubkey: extension.pubkey, label: t("extension.paneLabel"), npub: extension.npub }}
              badge={t("extension.badge")}
              notice={
                roster.some(r => r.pubkey === extension.pubkey)
                  ? { tone: "ok", text: t("extension.canReceive") }
                  : { tone: "warn", text: t("extension.cannotReceive") }
              }
              messages={messages}
              pending={pending.filter(p => p.from === extension.pubkey)}
              nameFor={nameFor}
              targets={targetsFor(extension.pubkey)}
              onSend={(to, text) =>
                send({ pubkey: extension.pubkey, label: t("extension.paneLabel"), npub: extension.npub }, to, text)
              }
              busy={busyKeys.includes(extension.pubkey)}
              t={t}
            />
          )}
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
