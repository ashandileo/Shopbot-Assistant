import { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "./embeddings";

export type SearchResult = {
  type: "product" | "faq";
  content: string;
  similarity: number;
};

export async function searchKnowledge(
  supabase: SupabaseClient,
  userId: string,
  query: string,
  topK = 5
): Promise<SearchResult[]> {
  const embedding = await generateEmbedding(query);
  const embeddingStr = `[${embedding.join(",")}]`;

  const [{ data: products }, { data: faqs }] = await Promise.all([
    supabase.rpc("match_products", {
      query_embedding: embeddingStr,
      match_count: topK,
      filter_user_id: userId,
    }),
    supabase.rpc("match_faqs", {
      query_embedding: embeddingStr,
      match_count: topK,
      filter_user_id: userId,
    }),
  ]);

  const results: SearchResult[] = [];

  if (products) {
    for (const p of products) {
      results.push({
        type: "product",
        content: `${p.name} - $${p.price} - ${p.stock} in stock`,
        similarity: p.similarity,
      });
    }
  }

  if (faqs) {
    for (const f of faqs) {
      results.push({
        type: "faq",
        content: `Q: ${f.question}\nA: ${f.answer}`,
        similarity: f.similarity,
      });
    }
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
}
