"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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

type Product = { name: string; price: string; stock: number };
type Faq = { q: string; a: string };

const initialProducts: Product[] = [
  { name: "Premium Roast Coffee 1lb", price: "14.99", stock: 150 },
  { name: "Single Origin Arabica 1lb", price: "19.99", stock: 75 },
  { name: "Organic Green Tea 20ct", price: "8.50", stock: 0 },
  { name: "Cold Brew Concentrate 32oz", price: "12.99", stock: 42 },
  { name: "Protein Energy Bar 6-pack", price: "9.99", stock: 8 },
];

const initialFaqs: Faq[] = [
  { q: "What are your store hours?", a: "Mon-Sat: 8AM-9PM, Sun: 9AM-5PM" },
  {
    q: "Do you offer shipping?",
    a: "Yes, we ship via USPS and UPS. Free shipping on orders over $50. Standard delivery is 2-4 business days.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Credit/debit cards, Apple Pay, Google Pay, and PayPal. Cash on delivery available for local orders.",
  },
  {
    q: "What is your return policy?",
    a: "Returns accepted within 7 days of delivery. Items must be unopened and in original packaging.",
  },
];

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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);

  const [productOpen, setProductOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });
  const [newFaq, setNewFaq] = useState({ q: "", a: "" });

  function addProduct() {
    if (!newProduct.name || !newProduct.price) return;
    setProducts([
      ...products,
      { name: newProduct.name, price: newProduct.price, stock: parseInt(newProduct.stock) || 0 },
    ]);
    setNewProduct({ name: "", price: "", stock: "" });
    setProductOpen(false);
  }

  function addFaq() {
    if (!newFaq.q || !newFaq.a) return;
    setFaqs([...faqs, newFaq]);
    setNewFaq({ q: "", a: "" });
    setFaqOpen(false);
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
              <Button onClick={addProduct}>Add product</Button>
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
            {products.map((p, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>${parseFloat(p.price).toFixed(2)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{getStockBadge(p.stock)}</TableCell>
                <TableCell>
                  <button
                    className="text-muted-foreground/40 hover:text-destructive transition-colors"
                    onClick={() => setProducts(products.filter((_, j) => j !== i))}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
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
              <Button onClick={addFaq}>Add FAQ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {faqs.map((f, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{f.q}</p>
                <p className="text-xs text-muted-foreground mt-1">{f.a}</p>
              </div>
              <button
                className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
              >
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
