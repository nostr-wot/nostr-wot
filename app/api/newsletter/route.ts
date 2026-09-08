import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, validateOrigin } from "@/lib/rate-limit";
import { parseSubscription, subscribe, SubscriptionValidationError } from "@/lib/newsletter-subscribers";
import { sendNewsletterEmails } from "@/lib/newsletter-email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // CSRF protection - validate origin
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 }
      );
    }

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`newsletter:${clientId}`, RATE_LIMITS.newsletter);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetIn),
            "X-RateLimit-Limit": String(RATE_LIMITS.newsletter.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.resetIn),
          },
        }
      );
    }

    let body: unknown;
    try { body = await request.json(); }
    catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    let subscription;
    try { subscription = parseSubscription(body); }
    catch (error) {
      if (error instanceof SubscriptionValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    // Commit opt-in before attempting either email. Explicit resubmission can
    // update language, but an identical retry never creates another subscriber.
    const result = await subscribe(subscription);
    if (result.created || result.localeChanged) {
      await sendNewsletterEmails(subscription.email, subscription.locale);
    }
    return NextResponse.json({ success: true });
  } catch {
    // No addresses, request bodies or filesystem/provider error payloads in logs.
    return NextResponse.json(
      { error: "Unable to save your subscription. Please try again later." },
      { status: 500 }
    );
  }
}
