import { Resend } from 'resend';

export interface EmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
}

export function buildEmailPayload(
  textContent: string,
  htmlContent: string,
  period: 'daily' | 'weekly',
  recipients: string[],
): EmailPayload {
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const label = period === 'weekly' ? 'Weekly Intelligence Brief' : 'Daily Digest';

  return {
    from: 'Sola Intel <intel@solatravel.app>',
    to: recipients,
    subject: `Sola ${label} — ${date}`,
    html: htmlContent,
    text: textContent,
  };
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[sender] RESEND_API_KEY not set — printing digest to stdout instead');
    console.log('\n' + '='.repeat(60));
    console.log(payload.text);
    console.log('='.repeat(60) + '\n');
    return { success: false, error: 'No API key' };
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (result.error) {
      console.error('[sender] Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[sender] Email sent: ${result.data?.id}`);
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error('[sender] Failed:', (err as Error).message);
    return { success: false, error: (err as Error).message };
  }
}
