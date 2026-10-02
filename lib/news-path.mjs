/** Canonical news path, dated by first publication (never the event or edit date). */
export function newsPath(post) {
  return `/news/${new Date(post.publishedAt).toISOString().slice(0, 10)}/${post.slug}`;
}
