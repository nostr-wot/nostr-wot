#!/usr/bin/env bash
# Stage a verified build, check it, then switch nginx without stopping the live app.
set -euo pipefail
revision=${1:?Expected commit SHA}
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid revision' >&2; exit 1; }
root=${SITE_ROOT:-/var/www/nostr-wot}
nginx_config=${SITE_NGINX_CONFIG:-/etc/nginx/sites-available/nostr-wot.com}
incoming="$root/incoming/$revision"
release="$root/releases/$revision"
old_port=$(grep -oE 'http://127\.0\.0\.1:(3000|3100|3101);' "$nginx_config" | sort -u | sed -E 's/.*:([0-9]+);/\1/')
[[ "$old_port" =~ ^(3000|3100|3101)$ ]] || { echo 'Ambiguous website upstream' >&2; exit 1; }
port=3100
[[ "$old_port" != 3100 ]] || port=3101
app="nostr-wot-$port"
health() {
  for route in / /sitemap.xml /fr/projects/snort '/es/news?tag=Security'; do
    curl --fail --silent --show-error --max-time 30 --retry 8 --retry-delay 1 --retry-connrefused "http://127.0.0.1:$1$route" -o /dev/null || return 1
  done
}
if [[ -L "$root/current" && "$(readlink "$root/current")" == "$release" ]]; then
  health "$old_port"
  exit 0
fi
# Never write into a running release, even on a retried workflow.
if pm2 jlist | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.exit(JSON.parse(s).some(p=>p.pm2_env?.pm_cwd===process.argv[1])?0:1))' "$release"; then
  echo 'Release is still running; refusing to overwrite it' >&2; exit 1
fi
mkdir -p "$release"
tar -xzf "$incoming/production.tar.gz" -C "$release"
install -m 600 "$incoming/.env" "$release/.env"
install -d -m 700 "$root/data/newsletter"
mkdir -p "$release/data"
ln -sfn "$root/data/newsletter" "$release/data/newsletter"
cd "$release"
npm ci --legacy-peer-deps
# Keep assets referenced by already-open pages available across the switch.
previous="$root"
[[ ! -L "$root/current" ]] || previous=$(readlink "$root/current")
if [[ -d "$previous/.next/static" ]]; then cp -Rn "$previous/.next/static/." .next/static/; fi
# This slot is never the active nginx upstream. Preserve the current slot for rollback.
if pm2 describe "$app" >/dev/null 2>&1; then pm2 delete "$app"; fi
if curl --silent --max-time 2 "http://127.0.0.1:$port/" -o /dev/null; then
  echo 'Candidate port is occupied by another service' >&2; exit 1
fi
PORT=$port pm2 start node_modules/next/dist/bin/next --name "$app" -- start --hostname 127.0.0.1 --port "$port"
backup="$incoming/nginx.before"
cp "$nginx_config" "$backup"
if [[ -f "$root/.env" ]]; then install -m 600 "$root/.env" "$incoming/env.before"; fi
switched=false
rollback() {
  if [[ "$switched" == true ]]; then
    cp "$backup" "$nginx_config"
    if ! nginx -t || ! nginx -s reload; then
      echo 'Could not restore nginx; retaining both servers for recovery' >&2
      return 1
    fi
  fi
  if [[ -f "$incoming/env.before" ]]; then install -m 600 "$incoming/env.before" "$root/.env"; fi
  if [[ "$switched" != true ]]; then pm2 delete "$app" || true; fi
  # A rollback reload is asynchronous too. Retain the candidate after a switch
  # so old nginx workers can finish their in-flight requests without 502s.
}
trap rollback ERR
health "$port"
node "$incoming/scripts/site-nginx.mjs" "$nginx_config" "$incoming/nginx.next" "$port" "$revision"
cp "$incoming/nginx.next" "$nginx_config"
switched=true
nginx -t
nginx -s reload
# nginx reload is asynchronous. Wait until a new worker serves this revision.
verified=false
for attempt in {1..15}; do
  if curl --fail --silent --show-error --max-time 30 --resolve nostrwot.com:443:127.0.0.1 https://nostrwot.com/guides/lightning-address -D "$incoming/headers" -o /dev/null &&
      grep -qi '^cache-control:.*no-transform' "$incoming/headers" &&
      grep -qi "^x-deployment-revision: $revision" "$incoming/headers"; then
    verified=true; break
  fi
  sleep 1
done
[[ "$verified" == true ]]
install -m 600 "$release/.env" "$root/.env"
# Existing scheduled senders keep their stable paths and shared private storage.
mkdir -p "$root/scripts/newsletters" "$root/newsletters"
cp -R scripts/newsletters/. "$root/scripts/newsletters/"
cp -R newsletters/. "$root/newsletters/"
pm2 save
ln -sfn "$release" "$root/current.next"
node -e 'require("fs").renameSync(process.argv[1],process.argv[2])' "$root/current.next" "$root/current"
trap - ERR
# Retain the previous process for in-flight requests and rollback. The next deploy
# reuses its inactive port; no running application is ever overwritten.
rm -f "$incoming/.env" "$incoming/production.tar.gz" "$incoming/env.before"
# Bound disk use while retaining recent releases and every running process's cwd.
node - "$root/releases" "$release" "$previous" <<'NODE' || echo 'Release cleanup needs attention' >&2
const fs = require('fs'), path = require('path'), cp = require('child_process');
const [root, current, previous] = process.argv.slice(2);
const running = JSON.parse(cp.execFileSync('pm2', ['jlist'], {encoding: 'utf8'}));
const keep = new Set([current, previous, ...running.map(p => p.pm2_env?.pm_cwd)]);
const dirs = fs.readdirSync(root, {withFileTypes: true})
  .filter(d => d.isDirectory() && /^[0-9a-f]{40}$/.test(d.name))
  .map(d => path.join(root, d.name))
  .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
for (const dir of dirs.slice(0, 3)) keep.add(dir);
for (const dir of dirs) if (!keep.has(dir)) fs.rmSync(dir, {recursive: true});
NODE
echo "Serving $revision on port $port"
