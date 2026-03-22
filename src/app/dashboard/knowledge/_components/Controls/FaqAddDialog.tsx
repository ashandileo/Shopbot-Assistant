"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FaqAddDialog({
  open,
  onOpenChange,
  onAdd,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (faq: { q: string; a: string }) => void;
  isPending: boolean;
}) {
  const [newFaq, setNewFaq] = useState({ q: "", a: "" });

  function handleAdd() {
    if (!newFaq.q || !newFaq.a) return;
    onAdd(newFaq);
  }

  function handleOpenChange(value: boolean) {
    if (!value) setNewFaq({ q: "", a: "" });
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Add FAQ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
