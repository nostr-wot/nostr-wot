import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

/** Files that cannot change the deployed website still get the fast CI checks. */
export function isSiteInput(file) {
  return !['README.md', 'AGENTS.md', 'LICENSE', 'data/social-posted.json', 'scripts/newsletters/README.md'].includes(file)
    && !['docs/', 'social/', 'tests/'].some(prefix => file.startsWith(prefix));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const base = event.pull_request?.base.sha || event.before;
  const args = base && !/^0+$/.test(base)
    ? ['diff', '--name-only', '-z', `${base}${event.pull_request ? '...' : '..'}HEAD`]
    : ['ls-tree', '-r', '--name-only', '-z', 'HEAD'];
  const files = execFileSync('git', args, { encoding: 'utf8' }).split('\0').filter(Boolean);
  const site = files.some(isSiteInput);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `site=${site}\n`);
  console.log(`${files.length} changed files; website build required: ${site}`);
}
