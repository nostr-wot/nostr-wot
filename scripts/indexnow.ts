#!/usr/bin/env npx tsx

/**
 * IndexNow Submission Script
 *
 * - Fetches URLs from sitemap.xml
 * - Only submits URLs that changed since last submission
 * - Run after deployment: npm run indexnow
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://nostr-wot.com";
const INDEXNOW_KEY = "cc96a62ee2c05a372eea85893057e4ec";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const CACHE_FILE = path.join(__dirname, ".indexnow-cache.json");

interface SitemapEntry {
  url: string;
  lastmod: string;
}

interface CacheData {
  [url: string]: string; // url -> lastmod
}

async function fetchSitemap(): Promise<SitemapEntry[]> {
  console.log("Fetching sitemap...");

  const response = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }

  const xml = await response.text();
  const entries: SitemapEntry[] = [];

  // Simple XML parsing for sitemap
  const urlRegex = /<url>([\s\S]*?)<\/url>/g;
  const locRegex = /<loc>(.*?)<\/loc>/;
  const lastmodRegex = /<lastmod>(.*?)<\/lastmod>/;

  let match;
  while ((match = urlRegex.exec(xml)) !== null) {
    const urlBlock = match[1];
    const locMatch = locRegex.exec(urlBlock);
    const lastmodMatch = lastmodRegex.exec(urlBlock);

    if (locMatch) {
      entries.push({
        url: locMatch[1],
        lastmod: lastmodMatch ? lastmodMatch[1] : new Date().toISOString(),
      });
    }
  }

  console.log(`Found ${entries.length} URLs in sitemap`);
  return entries;
}

function loadCache(): CacheData {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    }
  } catch (error) {
    console.log("No cache found, will submit all URLs");
  }
  return {};
}

function saveCache(data: CacheData): void {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

function getChangedUrls(entries: SitemapEntry[], cache: CacheData): string[] {
  const changed: string[] = [];

  for (const entry of entries) {
    const cachedLastmod = cache[entry.url];
    if (!cachedLastmod || cachedLastmod !== entry.lastmod) {
      changed.push(entry.url);
    }
  }

  return changed;
}

async function submitToIndexNow(urls: string[]): Promise<boolean> {
  if (urls.length === 0) {
    console.log("No URLs to submit");
    return true;
  }

  console.log(`Submitting ${urls.length} URLs to IndexNow...`);

  const payload = {
    host: "nostr-wot.com",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      console.log(`Success! ${urls.length} URLs submitted`);
      return true;
    } else {
      const text = await response.text();
      console.error(`Failed: ${response.status} - ${text}`);
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

async function main(): Promise<void> {
  const forceAll = process.argv.includes("--force");

  try {
    const entries = await fetchSitemap();
    const cache = loadCache();

    let urlsToSubmit: string[];

    if (forceAll) {
      console.log("Force mode: submitting all URLs");
      urlsToSubmit = entries.map(e => e.url);
    } else {
      urlsToSubmit = getChangedUrls(entries, cache);
      console.log(`${urlsToSubmit.length} URLs changed since last submission`);
    }

    if (urlsToSubmit.length > 0) {
      console.log("URLs to submit:");
      urlsToSubmit.forEach(url => console.log(`  - ${url}`));
    }

    const success = await submitToIndexNow(urlsToSubmit);

    if (success) {
      // Update cache with all current entries
      const newCache: CacheData = {};
      for (const entry of entries) {
        newCache[entry.url] = entry.lastmod;
      }
      saveCache(newCache);
      console.log("Cache updated");
    }
  } catch (error) {
    console.error("Failed:", error);
    process.exit(1);
  }
}

main();