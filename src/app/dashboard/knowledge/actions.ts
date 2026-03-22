"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generateEmbedding,
  productToText,
  faqToText,
} from "@/lib/embeddings";
import type { Product, Faq } from "@/lib/types";

export async function addProduct(input: {
  name: string;
  price: number;
  stock: number;
}): Promise<{ data?: Product; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const embedding = await generateEmbedding(productToText(input));

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name: input.name,
      price: input.price,
      stock: input.stock,
      embedding: JSON.stringify(embedding),
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Product };
}

export async function updateProduct(
  id: string,
  input: { name: string; price: number; stock: number },
): Promise<{ data?: Product; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const embedding = await generateEmbedding(productToText(input));

  const { data, error } = await supabase
    .from("products")
    .update({
      name: input.name,
      price: input.price,
      stock: input.stock,
      embedding: JSON.stringify(embedding),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Product };
}

export async function addFaq(input: {
  question: string;
  answer: string;
}): Promise<{ data?: Faq; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const embedding = await generateEmbedding(faqToText(input));

  const { data, error } = await supabase
    .from("faqs")
    .insert({
      user_id: user.id,
      question: input.question,
      answer: input.answer,
      embedding: JSON.stringify(embedding),
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Faq };
}

export async function updateFaq(
  id: string,
  input: { question: string; answer: string },
): Promise<{ data?: Faq; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const embedding = await generateEmbedding(faqToText(input));

  const { data, error } = await supabase
    .from("faqs")
    .update({
      question: input.question,
      answer: input.answer,
      embedding: JSON.stringify(embedding),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Faq };
}
