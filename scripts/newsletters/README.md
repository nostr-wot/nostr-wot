# Recording accepted newsletter editions

This module imports a receipt produced by a trusted server-side sending process. It does not send email, look up subscribers, call a provider, or independently verify delivery. A provider accepting a message is not proof of delivery to an inbox, opening or reading.

Invoke it only after a provider has actually accepted a real newsletter issue message and returned a nonblank message ID. Failed sends, drafts and runs with no audience must not create archive records. Welcome messages and contact notifications are not newsletter issues and must not invoke this recorder.

## Application hook

```js
import { recordSentReceipt } from './scripts/newsletters/record-sent.mjs';

const result = await recordSentReceipt(receipt, { dataDir: '/private/newsletter' });
```

Exact exported signature:

```ts
recordSentReceipt(
  receipt: {
    issueId: string;
    version: number;
    locale: string;
    acceptedAt: string;
    providerMessageId: string;
    subject: string;
    preheader: string;
    body: string;
    coverageStart?: string;
    coverageEnd?: string;
  },
  options?: { dataDir?: string }
): Promise<{
  id: string;
  locale: string;
  status: 'recorded' | 'recovered' | 'unchanged';
  path: string;
}>
```

`path` is the public aggregate's filesystem path. `recorded` adds a first receipt for a locale; `recovered` rebuilds a missing or incomplete projection from existing receipts; `unchanged` is an idempotent retry. Both arguments' content and the provider acceptance assertion come from the trusted caller. Importing this module has no CLI side effects.

The sending hook must use the sending provider's returned message ID and the time the provider accepted that message. It must pass the exact editorial subject, preheader and body associated with that accepted send. No provider credentials are needed by the recorder. If recording fails after sending, retain the receipt and retry recording, not sending.

## CLI

```sh
NEWSLETTER_DATA_DIR=/private/newsletter \
  node scripts/newsletters/record-sent.mjs --receipt /private/accepted-newsletter.json
```

The only CLI argument is `--receipt` followed by one JSON file. The file must be a regular, nonsymlink UTF-8 JSON file with private permissions, normally `0600`. It is not removed or modified. Validation/storage failure produces a nonzero exit status. Successful output identifies only the issue, locale and record status, never the provider ID or editorial payload.

The application option `dataDir` takes precedence over `NEWSLETTER_DATA_DIR`. Without either, storage is `cwd/data/newsletter`. An empty environment variable uses that default; an explicitly empty `dataDir` option is rejected.

## Receipt contract

This example is a mock for explaining the format. Do not import it into production as a sent issue.

```json
{
  "issueId": "weekly-2026-08-30-v1",
  "version": 1,
  "locale": "en",
  "acceptedAt": "2026-08-30T12:00:00Z",
  "providerMessageId": "mock-provider-message-id",
  "subject": "Mock weekly issue",
  "preheader": "",
  "body": "Exact delivered editorial text.\n\nSecond paragraph.\n",
  "coverageStart": "2026-08-24T00:00:00Z",
  "coverageEnd": "2026-08-30T00:00:00Z"
}
```

- `issueId` is at most 100 characters and matches `^[a-z0-9]+(?:-[a-z0-9]+)*-v([1-9][0-9]*)$`. Its numeric suffix must equal `version`, a positive safe integer. Path traversal, uppercase IDs and zero-padded version suffixes are rejected.
- `locale` is exactly one of `en`, `es`, `pt`, `ru`, `it`, `fr`, `de`. Only editions with their own receipts appear in the archive.
- `acceptedAt` and optional coverage values are ISO timestamps with seconds and an explicit timezone: `Z` or an offset such as `+02:00`. Fractional seconds may contain one to three digits. Impossible calendar dates and times are rejected. Acceptance cannot be in the future; coverage cannot end after acceptance, and its start cannot follow its end. Date-only coverage values are rejected by this recorder.
- `providerMessageId` must be a nonblank string, at most 512 characters, without control characters. The recorder validates its shape, not its authenticity with the provider.
- `subject` is nonblank and at most 500 characters. `preheader` may be empty and is at most 2,000 characters. Neither may contain line breaks or other control characters.
- `body` is nonblank and at most 120,000 characters, using JavaScript string length as the archive reader does. Paragraphs, spaces, tabs and line endings are preserved exactly. No HTML rendering, rewriting or localization is performed.
- The complete encoded JSON aggregate, including all translations and formatting, must not exceed 1,048,576 UTF-8 bytes. A locale addition exceeding this limit is rejected before saving its receipt or changing the existing aggregate. Character and byte limits both matter for multilingual content.
- The optional coverage fields must match exactly, including presence and timestamp spelling, across all editions of an issue. The recorder does not invent coverage dates.
- Unknown keys, recipient lists, subscriber fields and prototype-related keys are rejected. Nested objects are not valid receipt values.

The body must be the editorial text only, without recipient personalization, tracking data or unsubscribe tokens. Public editorial contact addresses are permitted; the importer cannot determine whether arbitrary text is personal. The trusted sender must separate editorial content from recipient-specific envelopes and footers. Obvious template placeholders, unsubscribe/opt-out URLs and the known provider ID in editorial fields are rejected as additional checks, not as a claim of comprehensive PII redaction.

## Stored records

```text
NEWSLETTER_DATA_DIR/
  receipts/<issueId>/<locale>.json
  sent/<issueId>.json
  locks/<issueId>/<pid>-<unique-ticket>.json
```

The private receipt contains the validated receipt fields, including provider evidence. The first receipt for an edition is immutable. Private directories use `0700` and files `0600`; existing unsafe directory permissions fail closed. The public aggregate file uses `0644` inside `sent/`. The root is private, so the server should expose only the validated `sent/` projection through its archive reader, never the storage tree, receipts or locks.

The public aggregate has exactly this shape:

```json
{
  "id": "weekly-2026-08-30-v1",
  "version": 1,
  "sentAt": "2026-08-30T12:00:00Z",
  "coverageStart": "2026-08-24T00:00:00Z",
  "coverageEnd": "2026-08-30T00:00:00Z",
  "translations": {
    "en": {
      "subject": "Mock weekly issue",
      "preheader": "",
      "body": "Exact delivered editorial text.\n\nSecond paragraph.\n",
      "sentAt": "2026-08-30T12:00:00Z"
    }
  }
}
```

No provider ID, acceptance-evidence field, recipient metadata, subscriber count or private receipt path is projected. Each translation's `sentAt` is its first receipt's `acceptedAt`. The aggregate's `sentAt` is the earliest original acceptance instant among its editions, with locale order breaking equal-instant ties. Adding a previously missing earlier edition can update that aggregate timestamp while preserving every existing translation unchanged.

## Immutability, retries and concurrent imports

An identical issue/version/locale/editorial-content/coverage retry is a no-op, even if its provider ID or acceptance timestamp differs. The first private receipt and the edition's first acceptance timestamp remain intact. This is an edition archive, not an audit ledger of every repeated transmission.

A changed subject, preheader or body for an existing locale is rejected. A version mismatch or changed coverage is also rejected. A later content revision requires a new unique issue ID and its matching version suffix, such as `weekly-2026-08-30-v2` with `version: 2`. Never overwrite the existing edition or fabricate a receipt to correct it.

Per-issue process tickets serialize imports, including parallel language additions. This uses a Lamport bakery lock on a local POSIX filesystem: each contender owns its unique ticket, and no process steals or deletes another contender's lock. Live contenders are waited on for up to 30 seconds. Tickets belonging to exited processes are ignored, permitting a retry after SIGKILL without deleting a replacement owner's lock. PID reuse can conservatively cause a timeout; retry later or inspect it while imports are stopped. This is single-host coordination, not a distributed/NFS lock.

Writes use exclusive temporary files, file synchronization, atomic publication and directory synchronization. A private receipt is published first and never replaced. The public projection is then atomically replaced under the lock. Readers see complete old or new JSON, never a partially written aggregate.

If a process exits after saving a receipt but before projecting it, rerun with that receipt. All saved receipts for the issue are considered, so missing language projections can be recovered. Existing public editions must match their private receipts; corruption or a public edition without its receipt is rejected, not silently repaired. Interrupted `.tmp-*` files stay private and are ignored. Do not manually alter receipts to force a retry through.

## Tests

```sh
node --import tsx --test tests/newsletter-record.test.ts
```

Tests use only mock receipts and temporary directories. They cover exact text, private/public separation, immutable retries, concurrent locales and conflicts, interrupted locks, receipt-first crash recovery, invalid input, symlink rejection, size limits, and the exported hook. An integration test passes recorded output through both `validateSentNewsletter` and `getSentNewsletter` from the real archive reader. No tests send mail or create production sent records.
