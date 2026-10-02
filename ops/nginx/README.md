# Website domain migration

The canonical website is `https://nostrwot.com`. Install `nostrwot.com.conf` as `/etc/nginx/sites-available/nostr-wot.com` on `46.225.78.116`, preserving the existing enabled symlink. Remove the Certbot-created `nostrwot.com` server blocks from `/etc/nginx/sites-available/default`, retaining its default catch-all. Back up both files, run `nginx -t`, and reload only after validation succeeds. Roll back both files if validation fails.

The existing certificate at `/etc/letsencrypt/live/nostr-wot.com/` covers both domains and both `www` variants. Keep renewing it: old HTTPS URLs need valid TLS before they can redirect. HTTP requests and noncanonical HTTPS hosts return 301 with the full request URI. Legacy newsletter unsubscribe POSTs are proxied to the canonical app host so mail providers can still unsubscribe recipients without losing the POST method in a 301; GET requests still redirect. Existing widget routes continue to proxy to port 3004; the website remains on port 3000.

Application deployments continue through GitHub Actions. The build and runtime workflows explicitly set `NEXT_PUBLIC_BASE_URL` and `SITE_BASE_URL` to the new origin, overriding any old values in the production environment secret. Email addresses, NIP-05 identifiers, Lightning service subdomains, sent newsletter editions and delivery ledgers remain unchanged.

After deployment, verify homepage and localized canonical/hreflang tags, sitemap, robots, feeds, static assets, widget responses, and redirects with query strings. Check the reCAPTCHA site's allowed domains include `nostrwot.com` in the Google reCAPTCHA console; web routing and TLS configuration do not configure that external allowlist.
