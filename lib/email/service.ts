import { Resend } from 'resend';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
}

const FROM_EMAIL = 'Nostr WoT <noreply@nostr-wot.com>';

class EmailService {
  private resend: Resend | null = null;

  private getClient(): Resend {
    if (!this.resend) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY not configured');
      }
      this.resend = new Resend(apiKey);
    }
    return this.resend;
  }

  async send(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const client = this.getClient();
      const { error } = await client.emails.send({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      if (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Email service error:', message);
      return { success: false, error: message };
    }
  }

  /**
   * Send multiple emails in parallel
   */
  async sendMany(emails: SendEmailOptions[]): Promise<EmailResult[]> {
    return Promise.all(emails.map((email) => this.send(email)));
  }
}

export const emailService = new EmailService();
