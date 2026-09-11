# Newsletter subscriptions and sent archive

## Language preference

The form sends the current next-intl page locale with the email address. The API validates one of `en`, `es`, `pt`, `ru`, `it`, `fr`, or `de`; it does not guess from the visitor's IP or browser. Registration stores the normalized email, locale, active status, timestamps and the explicit form submission source. Resubmitting the same email updates the language without adding a duplicate. Welcome emails use that locale too.

Private server-side senders can use `listActiveSubscribers()` from `lib/newsletter-subscribers.ts`. There is no public subscriber-list endpoint. Select the matching authored edition for each recipient; do not silently substitute English. A missing edition is held for translation. Subscription storage is authoritative even if a welcome email cannot be delivered.

The weekly editorial calendar prepares and sends validated issues in this repository. It does not reconstruct old subscribers from notification emails or infer missing languages.

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

## Weekly preparation and delivery

The user authorized the weekly newsletter to all active subscribers on 11 September 2026. The website repository owns `newsletters/YYYY-MM-DD/{en,es,pt,ru,it,fr,de}.md`, the research manifest and `issue.json`. The JSON file is the exact approved delivery input; authored Markdown files must match it. Keep source evidence and the explicit preceding seven-day UTC interval. Read the previous issue before selecting news. Lead with verified extension/SDK releases, distinguish browser-store availability, and never relabel old news as new. Prepare all seven translations before sending.

Use the existing Friday 10:00 Europe/Zurich editorial calendar; it now prepares, validates, deploys and sends. Do not add a second scheduler. Preserve the Tuesday ecosystem routine and its separate publication rules. Update the issue manifest with aggregate delivery outcome only; recipients, provider IDs and per-recipient state remain private on the server.

After green CI and deployment, run `newsletter.yml` with `issue=YYYY-MM-DD` and `send=false`. This reports active subscriber counts by locale and whether mail is configured, without exposing addresses. Then dispatch with `send=true`. The workflow uses the production SSH configuration and server `.env`, not credentials copied into a prompt or local content file.

`scripts/newsletters/send.mjs` sends separate emails through Resend, with a persistent per-issue/per-recipient ledger, an immutable input snapshot and provider idempotency keys. Known failures are reported; uncertain or interrupted requests are held for reconciliation, never blindly retried. Saved acceptances repair the archive without sending again. A stale sender lock requires inspection, never age-based deletion. Provider acceptance is not confirmed inbox delivery.

Every message includes a signed localized unsubscribe link and one-click headers. GET only presents confirmation; POST deactivates the subscription under the same lock as registration. Set a stable `NEWSLETTER_UNSUBSCRIBE_SECRET` if desired; the default uses the existing Resend key, so rotating that key also invalidates old links unless the dedicated secret is retained.

The public `/newsletters` archive already exists in all seven locales. It displays the exact editorial Markdown using a restricted escaped formatter. Only language editions with actual accepted recipients appear as sent. Empty audiences do not create fake archive entries. Prepared editions with no audience remain in the repository and can be sent later without an English fallback.

## Per-recipient send history

Retain every send attempt privately in `data/newsletter/deliveries/<issue-id>/<sha256-email>.json`. The record contains the recipient email, issue/version, locale, exact outbound message, attempt timestamps, pending/failed/uncertain/accepted outcomes and Resend message IDs when supplied. History is cumulative: retries append events instead of replacing earlier attempts. Accepted is provider acceptance, not proof of inbox delivery, opening or reading. These records survive deployment and must be included in private operational backups; never expose them in the public archive or commit them.

The `newsletter.yml` workflow's `audit=true` option enriches older checkpoints with their recipient from retained subscriber/message evidence, without sending. It preserves original receipt times and explicitly labels unknown earlier attempts. No guessed recipients or fabricated historical events. Do not combine audit=true with send=true.

## Reader-facing editorial tone

Lead with the actual change and its benefit. Use "Security improvements" or a specific heading such as "Safer account switching". Explain, for example, that pending operations are cancelled when the user locks the extension or changes accounts.

Do not add unsolicited contrasts such as "hardening, not a reported hack". Mentioning a hack, breach or victims without a relevant incident creates confusion. Research must distinguish fixes from exploitation, but that classification belongs in the evidence record unless it is needed to understand the story. Carry this rule across all translations. Existing sent editions remain immutable; use the corrected approach in subsequent issues.

## Branded email template and private previews

All new newsletter sends use `scripts/newsletters/template.mjs`: the existing Nostr WoT PNG mark, indigo/violet brand colors, readable inline-styled sections, a browser link, localized subscription/unsubscribe copy and the social links from the website footer. Tables and inline CSS provide the baseline email layout; responsive CSS improves small screens. Both HTML and plain text are retained with each recipient’s private delivery record, including the template version.

Use `newsletter-preview.yml` to send a template preview only to `leon@dandelionlabs.io`. It uses authored `newsletters/previews/brand-vN.json`, marks the subject as a preview, does not read or send to the subscriber list, and never creates a sent-newsletter archive entry. Private preview history and provider acceptance are recorded under `data/newsletter/previews/`. Repeated accepted previews are idempotent; a changed preview requires a new version or ID. Do not resend a subscriber issue to demonstrate a template change. Already-sent editorial editions remain immutable.
