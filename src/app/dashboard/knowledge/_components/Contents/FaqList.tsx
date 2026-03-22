"use client";

import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Faq } from "@/lib/types";

export function FaqList({
  faqs,
  onDelete,
}: {
  faqs: Faq[];
  onDelete: (id: string) => void;
}) {
  return (
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
                onClick={() => onDelete(f.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
