import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface ContactFormData {
  type: "support" | "media";
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
  recaptchaToken: string;
}

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
    return data.success && data.score >= 0.5;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured. Please try again later." },
        { status: 500 }
      );
    }

    // Prepare email content
    const typeLabel = type === "support" ? "Support Request" : "Media Inquiry";
    const contactEmail = process.env.CONTACT_EMAIL || "hello@example.com";

    const emailHtml = `
      <h2>New ${typeLabel}</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      ${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ""}
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${message}</p>
      <hr />
      <p style="color: #666; font-size: 12px;">
        This message was sent from the Nostr WoT contact form.
      </p>
    `;

    const emailText = `
New ${typeLabel}

From: ${name} (${email})
${organization ? `Organization: ${organization}\n` : ""}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Nostr WoT contact form.
    `;

    // Send email using Resend
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: "Nostr WoT <noreply@resend.dev>",
      to: contactEmail,
      replyTo: email,
      subject: `[${type.toUpperCase()}] ${subject}`,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
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
