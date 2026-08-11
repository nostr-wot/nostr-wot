"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge, Button, Input, Section } from "@/components/ui";
import {
  createIdentity,
  identityFromMnemonic,
  publishAttestation,
  resolveRecipient,
  sendMessage,
  watchInbox,
  readSession,
  writeSession,
  readEventLog,
  writeEventLog,
  clearEventLog,
  subscribeRelayActivity,
  CHAT_RELAYS,
  nextId,
  type ChatMessage,
  type Identity,
  type Recipient,
  type RelayActivity,
  type TraceEntry,
} from "@/lib/client/pqChat";
import { paletteFor, reservePalettes, forgetPalette } from "@/lib/client/pqPeople";
import type { Keyholder } from "@/lib/client/pqLayers";
import EventExplorer from "./EventExplorer";
import Faq from "../Faq";
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
  onRegister,
  registering,
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
  /** Offered in the composer while there is nobody to send to yet. */
  onRegister?: () => void;
  registering?: boolean;
  busy: boolean;
  t: ReturnType<typeof useTranslations>;
  children?: React.ReactNode;
}) {
  const [draft, setDraft] = useState("");
  const [target, setTarget] = useState<string>("all");
  const listRef = useRef<HTMLDivElement>(null);

  const mine = useMemo(
    () => messages.filter(m => m.from === me.pubkey || m.to === me.pubkey),
    [messages, me.pubkey],
  );

  // Scroll the list, not the document. scrollIntoView on a page with three panes
  // yanks the whole viewport away from whatever you were reading.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mine.length, pending.length]);

  const send = () => {
    if (!draft.trim() || busy) return;
    // Mirror the value the select is actually showing, which falls back to the first
    // target when "all" is not on offer.
    const chosen =
      target === "all" && targets.length > 1
        ? targets
        : (targets.filter(x => x.pubkey === target).length
            ? targets.filter(x => x.pubkey === target)
            : targets.slice(0, 1));
    if (chosen.length === 0) return;
    for (const to of chosen) onSend(to, draft.trim());
    setDraft("");
  };

  const pal = paletteFor(me.pubkey);

  return (
    <div className={`flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 ${pal.ring}`}>
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`font-semibold ${pal.text}`}>{me.label}</h3>
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

      {/* Fixed height, not flex-1: `flex: 1 1 0%` overrides the basis in a column and
          lets the list grow with its content, so the pane got taller with every message
          instead of scrolling. Capped and scrolled, the newest message stays put at the
          bottom where the eye already is. */}
      <div ref={listRef} className="h-80 shrink-0 space-y-2 overflow-y-auto p-4">
        {mine.length === 0 && pending.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("pane.empty")}</p>
        )}
        {mine.map(m => {
          const outgoing = m.from === me.pubkey;
          // Coloured by *sender*, always. Alignment says whether it is yours; colour says
          // who, which alignment cannot do once there are three people in the room.
          const pal = paletteFor(m.from);
          return (
            <div key={m.id} className={`flex ${outgoing ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${outgoing ? pal.solid : pal.soft}`}>
                <p className={`mb-0.5 text-[11px] font-medium ${outgoing ? "text-white/80" : "opacity-70"}`}>
                  {nameFor(m.from)} → {nameFor(m.to)}
                </p>
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                {m.bytes > 0 && (
                  <p className={`mt-1 text-[11px] ${outgoing ? "text-white/70" : "opacity-70"}`}>
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
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-200 p-3 dark:border-gray-800">
        {targets.length === 0 ? (
          // The register action belongs here too, not only in the header: this is where
          // you look when you want to send, and "nobody to send to" reads as broken
          // unless the thing that fixes it is within reach.
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("pane.noTargets")}</p>
            {onRegister && (
              <Button type="button" onClick={onRegister} disabled={registering}>
                {registering ? t("status.working") : t("status.start")}
              </Button>
            )}
          </>
        ) : (
          <>
            <Input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder={t("pane.placeholder")}
              aria-label={t("pane.placeholder")}
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor={`to-${me.pubkey}`}>
                {t("pane.recipient")}
              </label>
              <select
                id={`to-${me.pubkey}`}
                value={
                  targets.some(x => x.pubkey === target) || (target === "all" && targets.length > 1)
                    ? target
                    : (targets[0]?.pubkey ?? "")
                }
                onChange={e => setTarget(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                {targets.length > 1 && <option value="all">{t("pane.toEveryone")}</option>}
                {targets.map(to => (
                  <option key={to.pubkey} value={to.pubkey}>
                    {to.label}
                  </option>
                ))}
              </select>
              <Button type="button" onClick={send} disabled={busy || !draft.trim()}>
                {busy ? t("pane.sending") : t("pane.send")}
              </Button>
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
  people,
  eventCount,
  onOpen,
  t,
}: {
  activity: RelayActivity;
  people: { pubkey: string; label: string; count: number }[];
  eventCount: number;
  onOpen: () => void;
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
    <button
      type="button"
      onClick={onOpen}
      className={`w-full rounded-xl border p-3 text-left transition-colors ${
        syncing
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
      }`}
      aria-label={t("explorer.open")}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {/* Relay lamps: green when connected, primary while one is handing us an event. */}
        <span className="flex items-center gap-3">
          {CHAT_RELAYS.map(url => {
            const up = activity.status[url];
            const serving = syncing && !!activity.last?.relays.includes(url);
            return (
              // Colour alone would carry the state, and below `lg` the hostname is
              // hidden, so the state is spelled out for anyone who cannot use the hue.
              <span
                key={url}
                className="flex items-center gap-1.5"
                title={`${host(url)} — ${up ? t("relays.up") : t("relays.down")}`}
              >
                <span className="sr-only">
                  {up ? t("relays.upNamed", { relay: host(url) }) : t("relays.downNamed", { relay: host(url) })}
                </span>
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    serving
                      ? "animate-ping bg-primary"
                      : up
                        ? "bg-green-500"
                        : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
                <span
                  className={`hidden text-[11px] lg:inline ${
                    up ? "text-gray-600 dark:text-gray-400" : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {host(url)}
                </span>
              </span>
            );
          })}
        </span>

        <span className="h-4 w-px bg-gray-200 dark:bg-gray-800" />

        {/* Who is in the room, in their own colour, with how many events each has. */}
        <span className="flex flex-wrap items-center gap-2">
          {people.map(p => {
            const pal = paletteFor(p.pubkey);
            return (
              <span
                key={p.pubkey}
                className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${pal.chip}`}
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${pal.dot}`} />
                {p.label}
                <span className="opacity-70">{p.count}</span>
              </span>
            );
          })}
        </span>

        <span className="ml-auto flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
          {/* End-of-stored-events, so "nothing has arrived" is distinguishable from
              "the relays finished replaying and there was nothing to send". */}
          <span className="hidden sm:inline">
            {activity.caughtUp.length
              ? t("relays.caughtUp", { inboxes: activity.caughtUp.join(", ") })
              : t("relays.waiting")}
          </span>
          <span>
            {syncing
              ? t("relays.syncing", { relays: activity.last?.relays.map(host).join(", ") || "—" })
              : t("relays.received", { count: activity.received })}
          </span>
          <span className="rounded-lg bg-gray-100 px-2 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {t("explorer.open")} ({eventCount})
          </span>
        </span>
      </div>
    </button>
  );
}

export default function ChatContent() {
  const t = useTranslations("pqcChat");

  const [alice, setAlice] = useState<Identity | null>(null);
  const [bob, setBob] = useState<Identity | null>(null);
  /** Everyone reachable, as discovered from their published attestations. */
  const [roster, setRoster] = useState<Recipient[]>([]);
  const [phase, setPhase] = useState<
    "generating" | "creating" | "idle" | "publishing" | "resolving" | "ready" | "failed"
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

  const [explorerOpen, setExplorerOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => subscribeRelayActivity(setActivity), []);

  // Ids already seen coming back. The relay round trip can beat the state update that
  // records the message as in flight, which would otherwise strand it as "awaiting"
  // forever. Checking against this makes the ordering irrelevant.
  const deliveredIds = useRef<Set<string>>(new Set());
  // Names resolved through a ref so long-lived relay subscriptions always see the
  // current roster without being torn down and resubscribed on every change.
  const namesRef = useRef<Map<string, string>>(new Map());
  // Stall timers, so a page teardown or a regenerate does not leave them firing.
  const stallTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(
    () => () => {
      for (const timer of stallTimers.current) clearTimeout(timer);
      stallTimers.current.clear();
    },
    [],
  );

  const addTrace = useCallback((entry: Omit<TraceEntry, "id" | "at">) => {
    setTrace(prev => [{ ...entry, id: nextId(), at: Date.now() }, ...prev].slice(0, 120));
  }, []);

  // Relays are not an archive, so the history is kept here too. Restored before the
  // first trace is added, and written back whenever it grows.
  useEffect(() => {
    const saved = readEventLog();
    if (!saved.length) return;
    // Deduped by id: React runs this effect twice in development, and appending blindly
    // would double the log, collide list keys, and then write the doubled copy back.
    setTrace(prev => {
      const seen = new Set(prev.map(e => e.id));
      return [...prev, ...saved.filter(e => !seen.has(e.id))];
    });
  }, []);

  // Debounced: a single send produces three or four entries, and each write serialises
  // the whole log — which embeds full ~12 kB attestation events.
  useEffect(() => {
    if (!trace.length) return;
    const timer = setTimeout(() => writeEventLog(trace), 500);
    return () => clearTimeout(timer);
  }, [trace]);

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
    reservePalettes([a.pubkey, b.pubkey]); // Alice first, Bob second, always
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

  // Extensions inject `window.nostr` at their own pace, sometimes after hydration, so a
  // single check on mount would show "not found" for the life of the page.
  useEffect(() => {
    if (hasExtension()) {
      setExtensionAvailable(true);
      return;
    }
    const timer = setInterval(() => {
      if (hasExtension()) {
        setExtensionAvailable(true);
        clearInterval(timer);
      }
    }, 1000);
    const stop = setTimeout(() => clearInterval(timer), 10_000);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, []);

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

  /**
   * Throw away the demo identities and mint two new ones, unregistered.
   *
   * Without this the page is a one-shot: once a session has published, there is no way
   * back to the state the whole demo is about — fresh keys that nobody can reach yet.
   */
  const regenerate = useCallback(async () => {
    // Deriving two ML-KEM and two ML-DSA key pairs blocks for long enough to notice, so
    // paint the loading state before starting rather than freezing on the click.
    setRegenerating(true);
    setPhase("creating");
    await new Promise(r => setTimeout(r, 30));

    const a = createIdentity(t("alice"));
    const b = createIdentity(t("bob"));
    if (alice) forgetPalette(alice.pubkey);
    if (bob) forgetPalette(bob.pubkey);
    namesRef.current.set(a.pubkey, a.label);
    namesRef.current.set(b.pubkey, b.label);
    reservePalettes([a.pubkey, b.pubkey]);

    setAlice(a);
    setBob(b);
    setMessages([]);
    setPending([]);
    deliveredIds.current.clear();
    // The extension keeps its place; only the demo pair is replaced.
    setRoster(prev => prev.filter(r => r.pubkey === extension?.pubkey));
    writeSession({ alice: a.mnemonic, bob: b.mnemonic, published: false });
    // The old log describes identities that no longer exist here.
    clearEventLog();
    for (const timer of stallTimers.current) clearTimeout(timer);
    stallTimers.current.clear();
    setTrace([]);
    setPhase("idle");
    setRegenerating(false);

    addTrace({
      from: "—",
      kind: "info",
      label: t("trace.newIdentities"),
      detail: t("trace.identitiesDetail"),
    });
  }, [t, addTrace, extension, alice, bob]);

  const connect = useCallback(async () => {
    setExtensionError("");
    try {
      const me = await connectExtension();
      namesRef.current.set(me.pubkey, t("extension.paneLabel"));
      paletteFor(me.pubkey);
      setExtension(me);

      const asRecipient = extensionRecipient(me, t("extension.paneLabel"));
      if (asRecipient) {
        // Reachable, so Alice and Bob get a third person to talk to.
        setRoster(prev => (prev.some(r => r.pubkey === me.pubkey) ? prev : [...prev, asRecipient]));
        addTrace({
          from: t("extension.paneLabel"),
          kind: "info",
          label: t("extension.foundKey"),
          detail: t("extension.foundKeyDetail"),
        });
      } else {
        addTrace({
          from: t("extension.paneLabel"),
          kind: "error",
          label: t("extension.noAttestation"),
          detail: t("extension.noAttestationDetail"),
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
          const timer = setTimeout(() => {
            stallTimers.current.delete(timer);
            setPending(prev =>
              prev.map(p => (p.id === wrapId && p.status === "sent" ? { ...p, status: "stalled" } : p)),
            );
          }, STALL_AFTER_MS);
          stallTimers.current.add(timer);
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

  /** Everyone in the room, in colour order, with how many events each has produced. */
  const people = useMemo(() => {
    const list: { pubkey: string; label: string; count: number }[] = [];
    const push = (pubkey: string, label: string) =>
      list.push({ pubkey, label, count: trace.filter(e => e.event && e.owner === pubkey).length });
    if (alice) push(alice.pubkey, alice.label);
    if (bob) push(bob.pubkey, bob.label);
    if (extension) push(extension.pubkey, t("extension.paneLabel"));
    return list;
  }, [alice, bob, extension, trace, t]);

  /** Identities whose keys this browser holds, so the explorer can open what it can. */
  const keyholders = useMemo<Keyholder[]>(
    () => [alice, bob].filter(Boolean).map(i => i as Identity),
    [alice, bob],
  );

  const eventCount = useMemo(() => trace.filter(e => e.event).length, [trace]);

  const targetsFor = useCallback(
    (pubkey: string) => roster.filter(r => r.pubkey !== pubkey),
    [roster],
  );

  /** Anything that must finish before the page will accept another instruction. */
  const working =
    regenerating || phase === "publishing" || phase === "resolving" || phase === "creating";

  const statusNotice = useMemo((): { tone: "ok" | "warn"; text: string } | undefined => {
    if (phase === "creating") return { tone: "warn", text: t("status.creating") };
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

          {/* Registering is the only thing to decide here. Once it is done the page has
              nothing left to ask for, so the whole card goes away rather than lingering
              as a control nobody needs again. */}
          {phase !== "ready" && (
            <div className="mx-auto mt-8 max-w-2xl rounded-xl border-2 border-primary bg-primary/5 p-6 text-left">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("status.startTitle")}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {t("status.startExplainer")}
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => void begin(alice, bob, false)}
                  disabled={working}
                >
                  {working
                    ? t("status.working")
                    : phase === "failed"
                      ? t("status.retry")
                      : t("status.start")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section>
        <div className="mx-auto mb-6 max-w-6xl">
          <RelayActivityStrip
            activity={activity}
            people={people}
            eventCount={eventCount}
            onOpen={() => setExplorerOpen(true)}
            t={t}
          />
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
              onRegister={
                phase === "idle" || phase === "failed"
                  ? () => void begin(alice, bob, false)
                  : undefined
              }
              registering={working}
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
            {/* Two files rather than one CSS-filtered logo: the mark is not monochrome,
                so recolouring it would misrepresent the brand. The -light file carries
                dark ink (#0E1626) for light backgrounds; -dark carries white. */}
            <img
              src="/brand/quantakrypto-logo-light.svg"
              alt="QuantaKrypto"
              className="h-10 w-auto dark:hidden"
            />
            <img
              src="/brand/quantakrypto-logo-dark.svg"
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

      <Faq namespace="pqcChat" ids={["real", "keys", "size", "protects", "relays", "stored"]} />

      <EventExplorer
        open={explorerOpen}
        onClose={() => setExplorerOpen(false)}
        trace={trace}
        keyholders={keyholders}
        people={people}
        onRegenerate={() => void regenerate()}
        regenerating={working}
        t={t}
      />
    </>
  );
}
