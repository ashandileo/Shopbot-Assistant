import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

export function productToText(product: {
  name: string;
  price: number;
  stock: number;
}): string {
  return `${product.name} - $${product.price} - ${product.stock} in stock`;
}

export function faqToText(faq: { question: string; answer: string }): string {
  return `Q: ${faq.question}\nA: ${faq.answer}`;
}
