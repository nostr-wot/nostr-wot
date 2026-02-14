import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, validateOrigin } from "@/lib/rate-limit";
import { emailService, emailTemplates } from "@/lib/email";

interface NewsletterData {
  email: string;
}

// Max email length per RFC 5321
const MAX_EMAIL_LENGTH = 254;

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

    const body: NewsletterData = await request.json();
    const { email } = body;

    // Validate email exists
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email length
    if (email.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { error: `Email must be ${MAX_EMAIL_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    // Validate email format (RFC 5321 simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const contactEmail = process.env.CONTACT_EMAIL || "contact@nostr-wot.com";

    // Generate email templates
    const notificationEmail = emailTemplates.newsletterNotification(email);
    const welcomeEmail = emailTemplates.newsletterWelcome(email);

    // Send notification to admin and welcome to subscriber in parallel
    const [notificationResult, welcomeResult] = await emailService.sendMany([
      {
        to: contactEmail,
        subject: notificationEmail.subject,
        html: notificationEmail.html,
        text: notificationEmail.text,
      },
      {
        to: email,
        subject: welcomeEmail.subject,
        html: welcomeEmail.html,
        text: welcomeEmail.text,
      },
    ]);

    if (!notificationResult.success) {
      console.error("Failed to send notification email:", notificationResult.error);
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again later." },
        { status: 500 }
      );
    }

    // Log if welcome email failed but don't fail the request
    if (!welcomeResult.success) {
      console.error("Failed to send welcome email:", welcomeResult.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
