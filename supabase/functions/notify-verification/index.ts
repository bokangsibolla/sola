// Supabase Edge Function: notify-verification
// Called from the client after a successful selfie verification submission.
// Sends an email to the Sola team so they can review the new submission.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

Deno.serve(async (req) => {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
      });
    }

    const dashboardLink = `${SUPABASE_URL}/project/default/editor?table=profiles&filter=id%3Deq.${userId}`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sola <noreply@solatravel.app>",
        to: "team@solatravel.app",
        subject: "New Verification Submission",
        html: [
          "<h2>New selfie verification submitted</h2>",
          `<p><strong>User ID:</strong> ${userId}</p>`,
          `<p><a href="${dashboardLink}">Review in Supabase Dashboard</a></p>`,
        ].join("\n"),
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
