// Supabase Edge Function: push-on-message
// Triggered by a database webhook on INSERT into the messages table.
// Sends an Expo push notification to the recipient's devices.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface WebhookPayload {
  type: "INSERT";
  table: string;
  record: {
    id: string;
    conversation_id: string;
    sender_id: string;
    text: string;
    sent_at: string;
  };
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    const { record } = payload;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the other participant(s) in the conversation
    const { data: conversation } = await supabase
      .from("conversations")
      .select("participant_ids")
      .eq("id", record.conversation_id)
      .single();

    if (!conversation) {
      return new Response(JSON.stringify({ error: "conversation not found" }), {
        status: 404,
      });
    }

    const recipientIds = (conversation.participant_ids as string[]).filter(
      (id) => id !== record.sender_id
    );

    if (recipientIds.length === 0) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    // Filter out recipients who have blocked the sender
    const { data: blocks } = await supabase
      .from("blocked_users")
      .select("blocker_id")
      .eq("blocked_id", record.sender_id)
      .in("blocker_id", recipientIds);

    const blockerIds = new Set((blocks ?? []).map((b) => b.blocker_id));
    const filteredRecipientIds = recipientIds.filter((id) => !blockerIds.has(id));

    if (filteredRecipientIds.length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: "all blocked" }), {
        status: 200,
      });
    }

    // Get push tokens for all recipients
    const { data: tokens } = await supabase
      .from("push_tokens")
      .select("token")
      .in("user_id", filteredRecipientIds);

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: "no tokens" }), {
        status: 200,
      });
    }

    // Get sender name for the notification
    const { data: sender } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", record.sender_id)
      .single();

    const senderName = sender?.first_name ?? "Someone";
    const bodyPreview =
      record.text.length > 100
        ? record.text.slice(0, 100) + "…"
        : record.text;

    // Send via Expo Push API
    const messages = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title: senderName,
      body: bodyPreview,
      data: { conversationId: record.conversation_id },
    }));

    const pushResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(messages),
    });

    const pushResult = await pushResponse.json();

    return new Response(JSON.stringify({ sent: messages.length, pushResult }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
