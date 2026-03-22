import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateChatResponse } from "@/lib/chat";

const GRAPH_API_URL = "https://graph.facebook.com/v22.0";

// Webhook verification (GET) — Meta sends this when you register the webhook
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// Incoming messages (POST) — Meta sends message payloads here
export async function POST(request: NextRequest) {
  const payload = await request.json();

  // Extract message from Meta webhook payload
  const entry = payload.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  // Ignore non-message events (status updates, etc.)
  if (!value?.messages?.[0]) {
    return Response.json({ status: "ok" });
  }

  const message = value.messages[0];
  const from = message.from; // phone number without "+"
  const body = message.text?.body?.trim();
  const phoneNumberId = value.metadata?.phone_number_id;

  // Only handle text messages
  if (message.type !== "text" || !body) {
    return Response.json({ status: "ok" });
  }

  try {
    const supabase = createAdminClient();

    // Resolve which user owns this bot
    // For MVP: use the first user that has persona_settings configured
    const { data: persona, error: personaError } = await supabase
      .from("persona_settings")
      .select("user_id")
      .limit(1)
      .single();

    if (!persona) {
      return Response.json({
        status: "error",
        step: "persona",
        detail: personaError?.message ?? "No persona found",
      });
    }

    const userId = persona.user_id;
    const senderPhone = `+${from}`;

    // Find or create conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .eq("phone", senderPhone)
      .single();

    if (!conversation) {
      const { data: newConvo, error: convoError } = await supabase
        .from("conversations")
        .insert({ user_id: userId, phone: senderPhone })
        .select("id")
        .single();
      if (convoError) {
        return Response.json({
          status: "error",
          step: "create_conversation",
          detail: convoError.message,
        });
      }
      conversation = newConvo;
    }

    if (!conversation) {
      return Response.json({
        status: "error",
        step: "conversation",
        detail: "Failed to find or create conversation",
      });
    }

    // Save incoming message
    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      role: "user",
      body,
    });

    if (msgError) {
      return Response.json({
        status: "error",
        step: "save_message",
        detail: msgError.message,
      });
    }

    // Load recent message history for context
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("role, body")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(10);

    const history = (recentMessages ?? [])
      .slice(0, -1) // exclude the message we just inserted
      .map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.body,
      }));

    // Generate AI response
    const aiResponse = await generateChatResponse(
      supabase,
      userId,
      body,
      history,
    );

    // Save bot response
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      role: "bot",
      body: aiResponse,
    });

    // Update conversation last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation.id);

    // Send reply via WhatsApp Cloud API
    const sendResult = await sendWhatsAppMessage(phoneNumberId, from, aiResponse);

    return Response.json({ status: "ok", reply: aiResponse, whatsapp: sendResult });
  } catch (error) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ status: "error", step: "catch", detail: message }, { status: 500 });
  }
}

async function sendWhatsAppMessage(
  phoneNumberId: string,
  to: string,
  text: string,
) {
  const url = `${GRAPH_API_URL}/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("WhatsApp send error:", result);
    return { success: false, error: result, url, to, phoneNumberId };
  }

  return { success: true, result };
}
