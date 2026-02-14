import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, validateOrigin } from "@/lib/rate-limit";
import { emailService, emailTemplates } from "@/lib/email";

interface ContactFormData {
  type: "support" | "media";
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
  recaptchaToken: string;
}

// Input length limits
const MAX_LENGTHS = {
  name: 255,
  email: 254,
  organization: 255,
  subject: 500,
  message: 5000,
} as const;

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY not configured, skipping verification");
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();

    // Check if verification was successful and score is above threshold
    // Score ranges from 0.0 to 1.0, where 1.0 is very likely a good interaction
    // Using 0.7 as threshold (Google recommends 0.5 minimum, we use stricter)
    return data.success && data.score >= 0.7;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

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
    const rateLimit = checkRateLimit(`contact:${clientId}`, RATE_LIMITS.contact);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetIn),
            "X-RateLimit-Limit": String(RATE_LIMITS.contact.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.resetIn),
          },
        }
      );
    }

    const body: ContactFormData = await request.json();

    const { type, name, email, organization, subject, message, recaptchaToken } =
      body;

    // Validate required fields
    if (!type || !name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate type is one of the allowed values
    if (type !== "support" && type !== "media") {
      return NextResponse.json(
        { error: "Invalid inquiry type" },
        { status: 400 }
      );
    }

    // Validate input lengths to prevent DoS and injection attacks
    if (name.length > MAX_LENGTHS.name) {
      return NextResponse.json(
        { error: `Name must be ${MAX_LENGTHS.name} characters or less` },
        { status: 400 }
      );
    }
    if (email.length > MAX_LENGTHS.email) {
      return NextResponse.json(
        { error: `Email must be ${MAX_LENGTHS.email} characters or less` },
        { status: 400 }
      );
    }
    if (organization && organization.length > MAX_LENGTHS.organization) {
      return NextResponse.json(
        { error: `Organization must be ${MAX_LENGTHS.organization} characters or less` },
        { status: 400 }
      );
    }
    if (subject.length > MAX_LENGTHS.subject) {
      return NextResponse.json(
        { error: `Subject must be ${MAX_LENGTHS.subject} characters or less` },
        { status: 400 }
      );
    }
    if (message.length > MAX_LENGTHS.message) {
      return NextResponse.json(
        { error: `Message must be ${MAX_LENGTHS.message} characters or less` },
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

    // Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 }
      );
    }

    const contactEmail = process.env.CONTACT_EMAIL || "contact@nostr-wot.com";

    // Generate email templates
    const notificationEmail = emailTemplates.contactNotification({
      type,
      name,
      email,
      organization,
      subject,
      message,
    });

    const confirmationEmail = emailTemplates.contactConfirmation({
      name,
      type,
    });

    // Send notification to admin and confirmation to user in parallel
    const [notificationResult, confirmationResult] = await emailService.sendMany([
      {
        to: contactEmail,
        subject: notificationEmail.subject,
        html: notificationEmail.html,
        text: notificationEmail.text,
        replyTo: email,
      },
      {
        to: email,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
        text: confirmationEmail.text,
      },
    ]);

    if (!notificationResult.success) {
      console.error("Failed to send notification email:", notificationResult.error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    // Log if confirmation email failed but don't fail the request
    if (!confirmationResult.success) {
      console.error("Failed to send confirmation email:", confirmationResult.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
