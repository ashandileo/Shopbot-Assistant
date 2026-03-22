"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import type { Product, Faq } from "@/lib/types";

const supabase = createClient();

function getStockBadge(stock: number) {
  if (stock === 0)
    return <Badge variant="destructive">Out of stock</Badge>;
  if (stock <= 10)
    return (
      <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50">
        Low stock
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-green-400 text-green-700 bg-green-50">
      In stock
    </Badge>
  );
}

export default function KnowledgePage() {
  const queryClient = useQueryClient();

  const [productOpen, setProductOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });
  const [newFaq, setNewFaq] = useState({ q: "", a: "" });

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
    mutationFn: async (product: { name: string; price: string; stock: string }) => {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: product.name,
          price: parseFloat(product.price),
          stock: parseInt(product.stock) || 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setNewProduct({ name: "", price: "", stock: "" });
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
      const { data, error } = await supabase
        .from("faqs")
        .insert({ question: faq.q, answer: faq.a })
        .select()
        .single();
      if (error) throw error;
      return data as Faq;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setNewFaq({ q: "", a: "" });
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

  function handleAddProduct() {
    if (!newProduct.name || !newProduct.price) return;
    addProductMutation.mutate(newProduct);
  }

  function handleAddFaq() {
    if (!newFaq.q || !newFaq.a) return;
    addFaqMutation.mutate(newFaq);
  }

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
        <Dialog open={productOpen} onOpenChange={setProductOpen}>
          <DialogTrigger render={<Button size="sm" />}>
              <Plus className="h-4 w-4 mr-1" />
              Add product
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add new product</DialogTitle>
              <DialogDescription>
                This product will be available as AI knowledge
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Product name
                </label>
                <Input
                  placeholder="e.g. Premium Roast Coffee 1lb"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Price
                </label>
                <Input
                  placeholder="e.g. 14.99"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Stock quantity
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 100"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProductOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct} disabled={addProductMutation.isPending}>
                {addProductMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Add product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border mb-8 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No products yet. Add your first product above.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>{getStockBadge(p.stock)}</TableCell>
                  <TableCell>
                    <button
                      className="text-muted-foreground/40 hover:text-destructive transition-colors"
                      onClick={() => deleteProductMutation.mutate(p.id)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* FAQ */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">FAQ</h2>
        <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
          <DialogTrigger render={<Button size="sm" />}>
              <Plus className="h-4 w-4 mr-1" />
              Add FAQ
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add new FAQ</DialogTitle>
              <DialogDescription>
                Common questions the AI should know how to answer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Question
                </label>
                <Input
                  placeholder="e.g. What are your store hours?"
                  value={newFaq.q}
                  onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Answer
                </label>
                <Textarea
                  placeholder="e.g. Mon-Sat: 8AM-9PM, Sun: 9AM-5PM"
                  value={newFaq.a}
                  onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFaqOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFaq} disabled={addFaqMutation.isPending}>
                {addFaqMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Add FAQ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {faqs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No FAQs yet. Add your first FAQ above.
          </p>
        ) : (
          faqs.map((f) => (
            <Card key={f.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{f.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.answer}</p>
                </div>
                <button
                  className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                  onClick={() => deleteFaqMutation.mutate(f.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
