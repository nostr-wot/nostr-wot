/**
 * Escape HTML to prevent XSS in email templates
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Base email layout wrapper
 */
function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nostr Web of Trust</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Nostr Web of Trust</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                &copy; ${new Date().getFullYear()} Nostr Web of Trust. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
                <a href="https://nostr-wot.com" style="color: #8b5cf6; text-decoration: none;">nostr-wot.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface ContactFormData {
  type: 'support' | 'media';
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
}

interface ContactNotificationTemplate {
  html: string;
  text: string;
  subject: string;
}

interface ContactConfirmationTemplate {
  html: string;
  text: string;
  subject: string;
}

interface NewsletterNotificationTemplate {
  html: string;
  text: string;
  subject: string;
}

interface NewsletterWelcomeTemplate {
  html: string;
  text: string;
  subject: string;
}

export const emailTemplates = {
  /**
   * Contact form notification to admin
   */
  contactNotification(data: ContactFormData): ContactNotificationTemplate {
    const typeLabel = data.type === 'support' ? 'Support Request' : 'Media Inquiry';
    const safeName = escapeHtml(data.name);
    const safeEmail = escapeHtml(data.email);
    const safeOrganization = data.organization ? escapeHtml(data.organization) : null;
    const safeSubject = escapeHtml(data.subject);
    const safeMessage = escapeHtml(data.message);

    const content = `
      <h2 style="margin: 0 0 24px; color: #111827; font-size: 20px;">New ${typeLabel}</h2>

      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #6b7280;">From:</strong>
            <span style="color: #111827; margin-left: 8px;">${safeName} (${safeEmail})</span>
          </td>
        </tr>
        ${safeOrganization ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #6b7280;">Organization:</strong>
            <span style="color: #111827; margin-left: 8px;">${safeOrganization}</span>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #6b7280;">Subject:</strong>
            <span style="color: #111827; margin-left: 8px;">${safeSubject}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #6b7280;">Type:</strong>
            <span style="display: inline-block; margin-left: 8px; padding: 4px 12px; background-color: ${data.type === 'support' ? '#dbeafe' : '#fce7f3'}; color: ${data.type === 'support' ? '#1d4ed8' : '#be185d'}; border-radius: 9999px; font-size: 12px; font-weight: 500;">${typeLabel}</span>
          </td>
        </tr>
      </table>

      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px; color: #374151; font-size: 14px; font-weight: 600;">Message:</h3>
        <p style="margin: 0; color: #4b5563; white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
      </div>

      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        Sent from the Nostr WoT contact form on ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
      </p>
    `;

    const text = `
New ${typeLabel}

From: ${data.name} (${data.email})
${data.organization ? `Organization: ${data.organization}\n` : ''}Subject: ${data.subject}

Message:
${data.message}

---
Sent from the Nostr WoT contact form on ${new Date().toISOString()}
    `.trim();

    return {
      html: baseLayout(content),
      text,
      subject: `[${data.type.toUpperCase()}] ${data.subject}`,
    };
  },

  /**
   * Contact form confirmation to user
   */
  contactConfirmation(data: { name: string; type: 'support' | 'media' }): ContactConfirmationTemplate {
    const safeName = escapeHtml(data.name);
    const typeLabel = data.type === 'support' ? 'support request' : 'media inquiry';

    const content = `
      <h2 style="margin: 0 0 24px; color: #111827; font-size: 20px;">We received your message!</h2>

      <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
        Hi ${safeName},
      </p>

      <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
        Thank you for reaching out to us. We've received your ${typeLabel} and our team will review it shortly.
      </p>

      <p style="margin: 0 0 24px; color: #4b5563; line-height: 1.6;">
        We typically respond within <strong>24-48 hours</strong>. In the meantime, feel free to explore our documentation or check out the extension.
      </p>

      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="text-align: center; padding: 8px 0;">
            <a href="https://nostr-wot.com/docs" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">View Documentation</a>
          </td>
        </tr>
      </table>

      <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        Best regards,<br>
        <strong style="color: #111827;">The Nostr WoT Team</strong>
      </p>
    `;

    const text = `
Hi ${data.name},

Thank you for reaching out to us. We've received your ${typeLabel} and our team will review it shortly.

We typically respond within 24-48 hours. In the meantime, feel free to explore our documentation at https://nostr-wot.com/docs

Best regards,
The Nostr WoT Team
    `.trim();

    return {
      html: baseLayout(content),
      text,
      subject: "We received your message - Nostr WoT",
    };
  },

  /**
   * Newsletter subscription notification to admin
   */
  newsletterNotification(email: string): NewsletterNotificationTemplate {
    const safeEmail = escapeHtml(email);

    const content = `
      <h2 style="margin: 0 0 24px; color: #111827; font-size: 20px;">New Newsletter Subscriber</h2>

      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #6b7280;">Email:</strong>
            <span style="color: #111827; margin-left: 8px;">${safeEmail}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #6b7280;">Date:</strong>
            <span style="color: #111827; margin-left: 8px;">${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
          </td>
        </tr>
      </table>

      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        Subscribed via the Nostr WoT website.
      </p>
    `;

    const text = `
New Newsletter Subscriber

Email: ${email}
Date: ${new Date().toISOString()}

---
Subscribed via the Nostr WoT website.
    `.trim();

    return {
      html: baseLayout(content),
      text,
      subject: '[Newsletter] New Subscriber',
    };
  },

  /**
   * Newsletter welcome email to subscriber
   */
  newsletterWelcome(email: string): NewsletterWelcomeTemplate {
    const content = `
      <h2 style="margin: 0 0 24px; color: #111827; font-size: 20px;">Welcome to the Nostr WoT Newsletter!</h2>

      <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
        Thanks for subscribing! You're now part of our community.
      </p>

      <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
        We'll keep you updated on:
      </p>

      <ul style="margin: 0 0 24px; padding-left: 24px; color: #4b5563; line-height: 1.8;">
        <li><strong>New features</strong> and improvements to the extension</li>
        <li><strong>Integration guides</strong> for Nostr app developers</li>
        <li><strong>Web of Trust insights</strong> and best practices</li>
        <li><strong>Community highlights</strong> and ecosystem updates</li>
      </ul>

      <p style="margin: 0 0 24px; color: #4b5563; line-height: 1.6;">
        We respect your inbox and only send relevant updates. No spam, ever.
      </p>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 0; color: #166534; font-size: 14px;">
          <strong>Get started:</strong> If you haven't already, <a href="https://nostr-wot.com/download" style="color: #15803d; text-decoration: underline;">download the extension</a> to filter spam and find trusted content on Nostr.
        </p>
      </div>

      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="text-align: center; padding: 8px 0;">
            <a href="https://nostr-wot.com/features" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Explore Features</a>
          </td>
        </tr>
      </table>

      <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        Welcome aboard!<br>
        <strong style="color: #111827;">The Nostr WoT Team</strong>
      </p>
    `;

    const text = `
Welcome to the Nostr WoT Newsletter!

Thanks for subscribing! You're now part of our community.

We'll keep you updated on:
- New features and improvements to the extension
- Integration guides for Nostr app developers
- Web of Trust insights and best practices
- Community highlights and ecosystem updates

We respect your inbox and only send relevant updates. No spam, ever.

Get started: If you haven't already, download the extension at https://nostr-wot.com/download

Welcome aboard!
The Nostr WoT Team
    `.trim();

    return {
      html: baseLayout(content),
      text,
      subject: "Welcome to Nostr WoT - You're subscribed!",
    };
  },
};
