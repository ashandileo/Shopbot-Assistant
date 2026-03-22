"use client";

import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types";

export type ConversationWithPreview = Conversation & {
  preview: string;
  unread_count?: number;
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: ConversationWithPreview[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      {conversations.map((convo) => (
        <button
          key={convo.id}
          type="button"
          className={cn(
            "w-full text-left px-3 py-3 rounded-lg transition-colors hover:bg-muted/60",
            convo.id === selectedId && "bg-muted",
          )}
          onClick={() => onSelect(convo.id)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {convo.phone.slice(-2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">
                  {convo.phone}
                </span>
                <span className="text-[11px] text-muted-foreground ml-2 shrink-0">
                  {formatTime(convo.last_message_at)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {convo.preview}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
