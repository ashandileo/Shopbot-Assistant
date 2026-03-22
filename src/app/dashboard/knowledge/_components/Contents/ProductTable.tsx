"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/lib/types";

function getStockBadge(stock: number) {
  if (stock === 0) return <Badge variant="destructive">Out of stock</Badge>;
  if (stock <= 10)
    return (
      <Badge
        variant="outline"
        className="border-amber-400 text-amber-600 bg-amber-50"
      >
        Low stock
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="border-green-400 text-green-700 bg-green-50"
    >
      In stock
    </Badge>
  );
}

export function ProductTable({
  products,
  onDelete,
}: {
  products: Product[];
  onDelete: (id: string) => void;
}) {
  return (
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
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-8"
              >
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
                    onClick={() => onDelete(p.id)}
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
  );
}
