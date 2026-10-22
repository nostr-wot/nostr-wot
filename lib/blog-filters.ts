/** Repeated tag parameters keep topic names containing commas unambiguous. */
export function blogFilterUrl(tags: string[], query = '', section: 'blog' | 'guides' = 'blog'): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());
  for (const tag of new Set(tags)) params.append('tag', tag);
  return `/${section}${params.size ? `?${params}` : ''}`;
}

export function visibleBlogTopics(tags: string[], selected: string[], query: string, limit = 6): string[] {
  const matches = tags.filter(tag => !selected.includes(tag) && tag.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return [...selected, ...(query.trim() ? matches : matches.slice(0, limit))];
}

export function matchesBlogTopics(tags: string[], selected: string[]): boolean {
  return !selected.length || selected.some(selectedTag => tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase()));
}
