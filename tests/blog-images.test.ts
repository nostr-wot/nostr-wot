import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

test('every published blog translation has its own existing featured and preview artwork', () => {
  for (const locale of readdirSync('content/blog')) {
    for (const file of readdirSync(`content/blog/${locale}`).filter(name => /\.mdx?$/.test(name))) {
      const source = `content/blog/${locale}/${file}`;
      const { data } = matter(readFileSync(source, 'utf8'));
      if (data.published === false) continue;
      for (const field of ['featuredImage', 'previewImage']) {
        assert.equal(typeof data[field], 'string', `${source}: missing ${field}`);
        assert.ok(data[field].startsWith('/images/blog/'), `${source}: ${field} must be a local blog image`);
        assert.ok(!data[field].includes('/default-'), `${source}: ${field} needs article artwork`);
        assert.ok(existsSync(path.join('public', data[field])), `${source}: broken ${field}`);
      }
      if (data.ogImage) assert.ok(existsSync(path.join('public', data.ogImage)), `${source}: broken share image`);
    }
  }
});
