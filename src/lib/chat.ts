import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { searchKnowledge } from "./rag";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type MessageHistory = { role: "user" | "assistant"; content: string }[];

export async function generateChatResponse(
  supabase: SupabaseClient,
  userId: string,
  userMessage: string,
  history: MessageHistory
): Promise<string> {
  // 1. Get persona settings
  const { data: persona } = await supabase
    .from("persona_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  // 2. RAG search for relevant knowledge
  const results = await searchKnowledge(supabase, userId, userMessage);

  // 3. Build context from search results
  const knowledgeContext = results
    .map((r) => `[${r.type.toUpperCase()}] ${r.content}`)
    .join("\n");

  // 4. Build system prompt
  const botName = persona?.bot_name ?? "ShopBot Assistant";
  const tone = persona?.tone ?? "friendly";
  const customPrompt = persona?.system_prompt ?? "";

  const systemPrompt = `You are ${botName}, a ${tone} AI shopping assistant that helps customers via WhatsApp.

${customPrompt}

Use the following knowledge base to answer customer questions accurately.
If the information is not in the knowledge base, politely say you don't have that information and suggest they contact support.
Keep responses concise and suitable for WhatsApp (under 1000 characters when possible).
Always be helpful and ${tone}.

--- KNOWLEDGE BASE ---
${knowledgeContext || "No relevant information found."}
--- END KNOWLEDGE BASE ---`;

  // 5. Build messages array with history
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10), // Keep last 10 messages for context
    { role: "user", content: userMessage },
  ];

  // 6. Generate response
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 500,
    temperature: 0.7,
  });

  return completion.choices[0].message.content ?? "Sorry, I couldn't generate a response.";
}
