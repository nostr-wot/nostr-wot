import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Only the website ports are managed here; the widget backend stays independent. */
export function switchSiteUpstream(config, port, revision) {
  if (![3100, 3101].includes(port)) throw new Error('Unsupported website port');
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error('Invalid revision');
  const upstream = /http:\/\/127\.0\.0\.1:(3000|3100|3101);/g;
  if (!upstream.test(config)) throw new Error('Website upstream not found');
  let next = config.replace(upstream, `http://127.0.0.1:${port};`);
  // Preserve Next.js cache lifetimes while preventing Cloudflare from rewriting
  // Lightning Addresses into crawlable /cdn-cgi/l/email-protection links.
  if (!next.includes('add_header Cache-Control "no-transform" always;')) {
    const hsts = /(^[ \t]*add_header Strict-Transport-Security[^\n]+;)/m;
    if (!hsts.test(next)) throw new Error('Website header block not found');
    next = next.replace(hsts, '$1\n    add_header Cache-Control "no-transform" always;');
  }
  next = next.replace(/^[ \t]*add_header X-Deployment-Revision[^\n]+;\n?/gm, '');
  next = next.replace(/(^[ \t]*add_header Strict-Transport-Security[^\n]+;)/m, `$1\n    add_header X-Deployment-Revision "${revision}" always;`);
  return next;
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  const [source, output, port, revision] = process.argv.slice(2);
  fs.writeFileSync(output, switchSiteUpstream(fs.readFileSync(source, 'utf8'), Number(port), revision));
}
