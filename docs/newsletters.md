# Newsletter subscriptions and sent archive

## Language preference

The form sends the current next-intl page locale with the email address. The API validates one of `en`, `es`, `pt`, `ru`, `it`, `fr`, or `de`; it does not guess from the visitor's IP or browser. Registration stores the normalized email, locale, active status, timestamps and the explicit form submission source. Resubmitting the same email updates the language without adding a duplicate. Welcome emails use that locale too.

Private server-side senders can use `listActiveSubscribers()` from `lib/newsletter-subscribers.ts`. There is no public subscriber-list endpoint. Select the matching authored edition for each recipient; do not silently substitute English. A missing edition is held for translation. Subscription storage is authoritative even if a welcome email cannot be delivered.

This change does not reconstruct old subscribers from notification emails or infer their languages. It also does not start sending weekly newsletters. The existing editorial calendar prepares drafts separately.

## Public archive

`/newsletters` and the corresponding localized routes list actual recorded sent versions. `/newsletters/<issue-id>` shows an immutable edition, its version/date and links to available languages. The page explicitly indicates when a language has no sent edition. It does not mislabel an English fallback as another language.

The server reads `sent/<issue-id>.json` dynamically. Only the validated public editorial fields are rendered; subscriber addresses, provider identifiers and delivery receipts are excluded. Text is rendered safely rather than executing HTML or MDX. Sent editions are also included in the dynamic sitemap using only their actual language URLs.

An empty archive is intentional until a real newsletter is sent. Do not add fake production issues for screenshots or demonstrations. Welcome emails, draft publication and failed delivery attempts do not create editions.

## Record a sent version

See `scripts/newsletters/README.md` for the provider-receipt importer and its exported recording function. A separately authorized sending process must record the exact delivered subject, preheader and editorial body after provider acceptance. This recording step does not itself send email and must not be used to pretend that a draft was sent.

Group equivalent language editions under a common issue ID ending in `-v<version>`. Identical receipts can be replayed; conflicting content cannot overwrite an already sent edition. A content correction uses a new ID/version. A provider receipt is evidence of acceptance, not proof of delivery or opening.

## Persistence and deployment

Default runtime root: `/var/www/nostr-wot/data/newsletter` on production, or `data/newsletter` relative to the application working directory. `NEWSLETTER_DATA_DIR` can select a different persistent POSIX volume. Subscriber and archive writers use separate locks and atomic writes. Private directories are mode 0700 and files 0600.

The GitHub deployment creates the private directory but does not upload, delete or replace its contents. Include the directory in private encrypted operational backups; it must never be committed or served as static files. Public archive pages expose only the validated snapshots under `sent`, not the directory itself.

After a crash, a stale writer lock can block writes. Stop all relevant writers and inspect the lock before removing it; do not steal a lock merely because it is old. Preserve the last valid JSON file and receipt evidence when diagnosing a failure.

For local checks, point `NEWSLETTER_DATA_DIR` at a temporary directory and use fake provider receipts there. Do not call the production subscription route with test addresses, because that route sends welcome and admin emails.
