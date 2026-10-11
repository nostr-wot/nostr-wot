import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('quoted NIP links reference the upstream document instead of a relative site URL', () => {
  const broken: string[] = [];
  for (const locale of fs.readdirSync('content/news')) {
    const dir = path.join('content/news', locale);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      if (/\]\((?:\.\/)?\d+\.md(?:#[^)]*)?\)/.test(content)) broken.push(`${locale}/${file}`);
    }
  }
  assert.deepEqual(broken, []);
});

test('explicit localized guide links name an existing translated document', () => {
  const broken: string[] = [];
  for (const locale of ['en', 'es', 'pt', 'ru', 'it', 'fr', 'de']) {
    const dir = path.join('content/guides', locale);
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      for (const match of content.matchAll(/\]\(\/(en|es|pt|ru|it|fr|de)\/guides\/([^/#?)]+)/g)) {
        if (!['.md', '.mdx'].some(ext => fs.existsSync(path.join('content/guides', match[1], match[2] + ext)))) broken.push(`${locale}/${file}: ${match[0]}`);
      }
    }
  }
  assert.deepEqual(broken, []);
});
