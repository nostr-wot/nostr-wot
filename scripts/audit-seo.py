#!/usr/bin/env python3
"""Audit a running production build against its sitemap (no search-index assumptions).
Usage: python3 scripts/audit-seo.py --origin http://localhost:3100 --output audit.json
"""
import argparse
import concurrent.futures
import json
import re
import struct
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.meta, self.links, self.graphs, self.titles = {}, [], [], []
        self.title, self.script, self.svg = None, None, 0
        self.in_main, self.heading, self.headings = False, None, []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main': self.in_main = True
        if self.in_main and re.fullmatch(r'h[1-6]', tag): self.heading = [int(tag[1]), '']
        if tag == 'svg': self.svg += 1
        if tag == 'title' and not self.svg: self.title = ''
        if tag == 'script' and attrs.get('type') == 'application/ld+json': self.script = ''
        if tag == 'meta':
            self.meta.setdefault(attrs.get('property', attrs.get('name')), []).append(attrs.get('content', ''))
        if tag == 'link': self.links.append(attrs)
    def handle_data(self, data):
        if self.heading is not None: self.heading[1] += data
        if self.title is not None: self.title += data
        if self.script is not None: self.script += data
    def handle_endtag(self, tag):
        if self.heading is not None and tag == f'h{self.heading[0]}':
            self.headings.append(self.heading); self.heading = None
        if tag == 'main': self.in_main = False
        if tag == 'svg': self.svg -= 1
        if tag == 'title' and self.title is not None:
            self.titles.append(self.title); self.title = None
        if tag == 'script' and self.script is not None:
            self.graphs.append(json.loads(self.script)); self.script = None

parser = argparse.ArgumentParser()
parser.add_argument('--origin', default='http://localhost:3100')
parser.add_argument('--output', default='seo-audit.json')
args = parser.parse_args()
origin = args.origin.rstrip('/')

def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Twitterbot/1.0'})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.status, response.headers, response.read(), response.url

def local(url):
    parsed = urllib.parse.urlsplit(url)
    return origin + parsed.path + ('?' + parsed.query if parsed.query else '')

_, _, xml, _ = fetch(origin + '/sitemap.xml')
root = ET.fromstring(xml)
urls = [element.text for element in root.findall('{*}url/{*}loc')]
errors = []
if len(urls) != len(set(urls)): errors.append('Duplicate sitemap URLs')
url_set = set(urls)
for entry in root.findall('{*}url'):
    for alternate in entry.findall('{*}link'):
        if alternate.get('href') not in url_set: errors.append('Missing sitemap alternate: ' + alternate.get('href', ''))

def audit(url):
    issues, images = [], set()
    try:
        status, headers, html, final = fetch(local(url))
        if final != local(url) and final.rstrip('/') != local(url).rstrip('/'): issues.append('Redirect: ' + final)
        page = Page(); page.feed(html.decode('utf-8'))
        values = {'title': page.titles, **{key: page.meta.get(key, []) for key in ['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description']}}
        for key, texts in values.items():
            if len(texts) != 1: issues.append(f'{key}: expected one value, got {len(texts)}')
            for text in texts:
                low, high = (145, 157) if 'description' in key else (45, 57)
                if not low <= len(text) <= high: issues.append(f'{key}: {len(text)} characters: {text}')
        canonicals = [link['href'] for link in page.links if link.get('rel') == 'canonical']
        if canonicals != [url]: issues.append(f'Canonical mismatch: {canonicals}')
        if page.meta.get('og:url') != [url]: issues.append(f'OG URL mismatch: {page.meta.get("og:url")}')
        if any('noindex' in value for value in page.meta.get('robots', [])): issues.append('Sitemap URL is noindex')
        for key in ['og:image', 'twitter:image']:
            found = page.meta.get(key, [])
            if not found: issues.append('Missing ' + key)
            for image in found:
                if not image.startswith(('https://', 'http://')): issues.append('Relative preview: ' + image)
                images.add(image)
        def graph_check(graph):
            if isinstance(graph, list):
                for item in graph: graph_check(item)
            elif isinstance(graph, dict):
                if graph.get('@type') in ['Article', 'NewsArticle', 'BlogPosting']:
                    for key in ['headline', 'image', 'author', 'datePublished']:
                        if not graph.get(key): issues.append('Article missing ' + key)
                if graph.get('@type') == 'BreadcrumbList':
                    items = graph.get('itemListElement', [])
                    if any(not item.get('name') or not item.get('item') for item in items): issues.append('Breadcrumb missing name or item')
                    if [item.get('position') for item in items] != list(range(1, len(items)+1)): issues.append('Invalid breadcrumb order')
                if graph.get('@type') == 'AggregateRating': issues.append('Unverified aggregate rating')
                for key, value in graph.items():
                    if key == 'image' and isinstance(value, str):
                        if not value.startswith(('https://', 'http://')): issues.append('Relative JSON-LD image: ' + value)
                        else: images.add(value)
                    if isinstance(value, (dict, list)): graph_check(value)
        for graph in page.graphs: graph_check(graph)
        help_path = re.sub(r'^/(es|pt|fr|de|it|ru)(?=/)', '', urllib.parse.urlsplit(url).path)
        if help_path == '/help' or help_path.startswith('/help/'):
            h1 = [text.strip() for level, text in page.headings if level == 1]
            if len(h1) != 1 or not h1[0]: issues.append('Help requires exactly one nonempty H1')
            previous = 0
            for level, text in page.headings:
                if level > previous + 1: issues.append(f'Help heading skips from H{previous} to H{level}')
                if not text.strip(): issues.append('Empty help heading')
                previous = level
            expected = 'CollectionPage' if help_path == '/help' else 'TechArticle'
            matching = [g for g in page.graphs if isinstance(g, dict) and g.get('@type') == expected]
            crumbs = [g for g in page.graphs if isinstance(g, dict) and g.get('@type') == 'BreadcrumbList']
            if len(matching) != 1: issues.append('Help requires one ' + expected)
            if len(crumbs) != 1: issues.append('Help requires one breadcrumb graph')
            if matching:
                graph = matching[0]
                for key in ['url', 'inLanguage', 'description']:
                    if not graph.get(key): issues.append('Help schema missing ' + key)
                if graph.get('url') != url: issues.append('Help schema canonical mismatch')
                if expected == 'TechArticle':
                    for key in ['headline', 'articleBody', 'publisher', 'mainEntityOfPage']:
                        if not graph.get(key): issues.append('Help article missing ' + key)
                    if h1 and graph.get('headline') != h1[0]: issues.append('Help headline differs from H1')
                else:
                    items = graph.get('mainEntity', {}).get('itemListElement', [])
                    if len(items) != 22 or len({item.get('url') for item in items}) != 22: issues.append('Help index must list all 22 unique tasks')
            if crumbs and crumbs[0].get('itemListElement', [{}])[-1].get('item') != url: issues.append('Help breadcrumb canonical mismatch')
        return {'url': url, 'titles': values, 'jsonldGraphs': len(page.graphs), 'issues': issues}, images
    except Exception as error:
        return {'url': url, 'issues': [str(error)]}, images

pages, images = [], set()
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    for record, found in pool.map(audit, urls):
        pages.append(record); images.update(found)
        if len(pages) % 100 == 0: print(f'Checked {len(pages)}/{len(urls)} pages', flush=True)

host = urllib.parse.urlsplit(urls[0]).netloc

def audit_image(url):
    try:
        target = local(url) if urllib.parse.urlsplit(url).netloc == host else url
        status, headers, body, final = fetch(target)
        mime = headers.get('Content-Type', '').split(';')[0]
        issues = []
        if not mime.startswith('image/'): issues.append('Not an image: ' + mime)
        size = struct.unpack('>II', body[16:24]) if body.startswith(b'\x89PNG\r\n\x1a\n') else None
        if ('opengraph-image' in url or 'twitter-image' in url or 'social-preview.png' in url) and size != (1200, 630): issues.append(f'Unexpected preview size: {size}')
        return {'url': url, 'mime': mime, 'size': size, 'bytes': len(body), 'issues': issues}
    except Exception as error: return {'url': url, 'issues': [str(error)]}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    checked_images = []
    for record in pool.map(audit_image, sorted(images)):
        checked_images.append(record)
        if len(checked_images) % 100 == 0: print(f'Checked {len(checked_images)}/{len(images)} images', flush=True)
report = {'pages': pages, 'images': checked_images, 'sitemapErrors': errors}
with open(args.output, 'w') as output: json.dump(report, output, ensure_ascii=False, indent=2)
failures = errors + [f'{record["url"]}: {issue}' for record in pages + checked_images for issue in record['issues']]
print(json.dumps({'pages': len(pages), 'images': len(checked_images), 'failures': len(failures)}, indent=2))
for failure in failures[:30]: print(failure)
raise SystemExit(bool(failures))
