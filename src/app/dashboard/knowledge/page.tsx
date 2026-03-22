"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  addProduct as addProductAction,
  addFaq as addFaqAction,
} from "./actions";
import type { Product, Faq } from "@/lib/types";
import { ProductTable } from "./_components/Contents/ProductTable";
import { FaqList } from "./_components/Contents/FaqList";
import { ProductAddDialog } from "./_components/Controls/ProductAddDialog";
import { FaqAddDialog } from "./_components/Controls/FaqAddDialog";

const supabase = createClient();

export default function KnowledgePage() {
  const queryClient = useQueryClient();

  const [productOpen, setProductOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });
      return (data ?? []) as Product[];
    },
  });

  const { data: faqs = [], isLoading: faqsLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("faqs")
        .select("*")
        .order("created_at", { ascending: true });
      return (data ?? []) as Faq[];
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (product: {
      name: string;
      price: string;
      stock: string;
    }) => {
      const result = await addProductAction({
        name: product.name,
        price: parseFloat(product.price),
        stock: parseInt(product.stock) || 0,
      });
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setProductOpen(false);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("products").delete().eq("id", id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previous = queryClient.getQueryData<Product[]>(["products"]);
      queryClient.setQueryData<Product[]>(["products"], (old) =>
        old?.filter((p) => p.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["products"], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const addFaqMutation = useMutation({
    mutationFn: async (faq: { q: string; a: string }) => {
      const result = await addFaqAction({
        question: faq.q,
        answer: faq.a,
      });
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setFaqOpen(false);
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("faqs").delete().eq("id", id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["faqs"] });
      const previous = queryClient.getQueryData<Faq[]>(["faqs"]);
      queryClient.setQueryData<Faq[]>(["faqs"], (old) =>
        old?.filter((f) => f.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["faqs"], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });

  if (productsLoading || faqsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Knowledge base</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Data the AI uses to answer customer questions
      </p>

      {/* Product catalog */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Product catalog</h2>
        <ProductAddDialog
          open={productOpen}
          onOpenChange={setProductOpen}
          onAdd={(product) => addProductMutation.mutate(product)}
          isPending={addProductMutation.isPending}
        />
      </div>

      <ProductTable
        products={products}
        onDelete={(id) => deleteProductMutation.mutate(id)}
      />

      {/* FAQ */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">FAQ</h2>
        <FaqAddDialog
          open={faqOpen}
          onOpenChange={setFaqOpen}
          onAdd={(faq) => addFaqMutation.mutate(faq)}
          isPending={addFaqMutation.isPending}
        />
      </div>

      <FaqList faqs={faqs} onDelete={(id) => deleteFaqMutation.mutate(id)} />
    </div>
  );
}
