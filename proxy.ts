import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Next.js internals (_next)
  // - Static files (assets, images, etc.)
  //
  // The general pattern excludes any path containing a dot, since that is
  // normally a static asset. The news feed routes are Route Handlers whose
  // URLs are themselves dotted (/news/feed.xml, /news/feed.json), so without
  // an explicit match here the default locale's unprefixed request never gets
  // rewritten to the locale-nested route and 404s, even though the prefixed
  // /es/news/feed.xml etc. resolve directly through the filesystem. Add them
  // back in individually rather than loosening the general dot exclusion,
  // which would risk pulling real static assets through the locale rewrite.
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/news/feed.xml',
    '/news/feed.json',
  ],
};
