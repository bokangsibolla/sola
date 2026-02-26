// Supabase Edge Function: send-welcome-email
// Triggered by a database webhook when a new user signs up.
// Sends a welcome email via Resend.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

interface WebhookPayload {
  type: "INSERT";
  table: string;
  record: {
    id: string;
    email: string;
    first_name: string;
  };
}

function buildEmailHtml(firstName: string): string {
  const name = firstName || "there";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Sola</title>
</head>
<body style="margin:0; padding:0; background-color:#ffffff; -webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
<tr><td align="center" style="padding:40px 24px 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

<!-- Logo -->
<tr><td style="padding-bottom:36px;">
  <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:22px; font-weight:700; color:#E5653A; letter-spacing:-0.3px;">Sola</span>
</td></tr>

<!-- Body -->
<tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:15px; line-height:26px; color:#1a1a1a;">

<p style="margin:0 0 20px;">Hey ${name},</p>

<p style="margin:0 0 20px;">Welcome to Sola.</p>

<p style="margin:0 0 20px;">Sola was born in Poblacion, Manila. If you know it, you know. That corner of the city where every traveler is passing through on their way somewhere. We were there, and we kept hearing the same thing from women on the road. The same frustrations, the same unanswered questions, the same gaps that no app or travel blog was filling.</p>

<p style="margin:0 0 20px;">So we spent a year listening. Hundreds of conversations with solo women travelers about what they actually need. Then we taught ourselves to code and built it. No funding, no team of fifty. Just a deep belief that women should be able to travel freely, and that someone should build the tools to support that.</p>

<p style="margin:0 0 24px; font-weight:600; font-size:14px; color:#E5653A; letter-spacing:0.3px;">WHAT TO EXPECT</p>

<p style="margin:0 0 8px;"><span style="font-weight:600;">Destination guides</span> researched specifically for women traveling alone. Safety info, budget breakdowns, neighbourhood advice, what to actually expect on the ground.</p>
<p style="margin:0 0 8px;"><span style="font-weight:600;">A community</span> to ask the questions you can't google. Real women, real answers.</p>
<p style="margin:0 0 8px;"><span style="font-weight:600;">Traveler connections</span> to find other women heading where you're heading.</p>
<p style="margin:0 0 20px;"><span style="font-weight:600;">Trip planning</span> that keeps everything in one place so you can stop living in spreadsheets.</p>

<p style="margin:0 0 20px;">This is early. Things will evolve. But everything in here was built because a woman told us she needed it.</p>

<p style="margin:0 0 20px;">If something's off, tell us. If something's missing, tell us. Sola gets better the more people use it and speak up. Your feedback shapes what this becomes.</p>

<p style="margin:0 0 20px;">We hope it's useful to you.</p>

<!-- Sign off -->
<p style="margin:0 0 4px;">The Sola Team</p>
<p style="margin:0 0 32px; font-size:13px; color:#9A9A9A;">A year in the making.</p>

<!-- Divider -->
<hr style="border:none; border-top:1px solid #F0F0F0; margin:0 0 24px;">

<!-- Instagram -->
<p style="margin:0; font-size:13px; line-height:20px; color:#9A9A9A;">
  Follow along
  <a href="https://instagram.com/with_solatravel" style="color:#E5653A; text-decoration:none; font-weight:500;">@with_solatravel</a>
</p>

</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    const { record } = payload;

    if (!record?.email) {
      return new Response(
        JSON.stringify({ error: "No email in payload" }),
        { status: 400 },
      );
    }

    const html = buildEmailHtml(record.first_name);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sola <welcome@solatravel.app>",
        to: record.email,
        subject: "Welcome to Sola",
        html,
      }),
    });

    if (!emailResponse.ok) {
      const body = await emailResponse.text();
      return new Response(
        JSON.stringify({ error: "Resend API error", detail: body }),
        { status: 502 },
      );
    }

    const result = await emailResponse.json();
    return new Response(JSON.stringify({ sent: true, id: result.id }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
