# Extension removal feedback

`/uninstall` is a public, localized feedback page in all seven website languages.
The extension registers this URL using `runtime.setUninstallURL`. Registration
contains no identity, wallet data or unique tracking parameters; the browser opens
the website after removal. Browsers without this API skip registration safely.

The page uses the shared community illustration and existing form controls. The
survey is optional. A submitted survey requires a reason; expectations and an
email address for a reply are optional. No extension connection or login is needed.

`POST /api/uninstall-feedback` validates and bounds the body, checks the origin,
applies the existing contact rate limit (five attempts per hour per client), and
rejects the hidden spam field. It uses the existing escaped contact email template
and email service to deliver to `CONTACT_EMAIL` (default `contact@nostr-wot.com`).
`RESEND_API_KEY` is required, as for the contact form. It sends no confirmation
email or subscription request. The client only shows success after provider
acceptance; errors retain the entered answers. Feedback is held in the receiving
mailbox, not committed or stored in the website repository.

Deploy this website route before releasing an extension with the uninstall hook.
Tests cover request validation, HTML escaping, optional identity, delivery errors,
origin checks, rate limiting, and translation parity. Native removal still needs a
manual check using a disposable installed extension, never a user's live vault.
