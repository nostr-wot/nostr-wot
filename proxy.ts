import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Next.js internals (_next)
  // - Static files (assets, images, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
