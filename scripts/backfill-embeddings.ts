/**
 * Backfill embeddings for all products and FAQs that have embedding IS NULL.
 *
 * Usage:
 *   npx tsx scripts/backfill-embeddings.ts
 *
 * Required env vars (set in .env.local or export manually):
 *   OPENAI_API_KEY          – OpenAI API key
 *   NEXT_PUBLIC_SUPABASE_URL – Supabase URL (e.g. http://127.0.0.1:54321)
 *   SUPABASE_SERVICE_ROLE_KEY – Supabase service_role key (bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error(
    "Missing env vars. Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

async function backfillProducts() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, stock")
    .is("embedding", null);

  if (error) {
    console.error("Failed to fetch products:", error.message);
    return;
  }

  if (!products?.length) {
    console.log("Products: nothing to backfill");
    return;
  }

  console.log(`Products: backfilling ${products.length} rows...`);

  for (const product of products) {
    const text = `${product.name} - $${product.price} - ${product.stock} in stock`;
    const embedding = await generateEmbedding(text);

    const { error: updateError } = await supabase
      .from("products")
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", product.id);

    if (updateError) {
      console.error(`  Failed [${product.name}]:`, updateError.message);
    } else {
      console.log(`  Done [${product.name}]`);
    }
  }
}

async function backfillFaqs() {
  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .is("embedding", null);

  if (error) {
    console.error("Failed to fetch FAQs:", error.message);
    return;
  }

  if (!faqs?.length) {
    console.log("FAQs: nothing to backfill");
    return;
  }

  console.log(`FAQs: backfilling ${faqs.length} rows...`);

  for (const faq of faqs) {
    const text = `Q: ${faq.question}\nA: ${faq.answer}`;
    const embedding = await generateEmbedding(text);

    const { error: updateError } = await supabase
      .from("faqs")
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", faq.id);

    if (updateError) {
      console.error(`  Failed [${faq.question}]:`, updateError.message);
    } else {
      console.log(`  Done [${faq.question}]`);
    }
  }
}

async function main() {
  console.log("Starting embedding backfill...\n");
  await backfillProducts();
  console.log();
  await backfillFaqs();
  console.log("\nBackfill complete!");
}

main();
