"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare } from "lucide-react";
import {
  ConversationList,
  type ConversationWithPreview,
} from "./_components/Contents/ConversationList";
import { ChatPanel } from "./_components/Contents/ChatPanel";
import { ConversationSearchFilter } from "./_components/Controls/ConversationSearchFilter";

const supabase = createClient();

// --- Data fetching ---

async function fetchConversations(): Promise<ConversationWithPreview[]> {
  const { data: convos, error } = await supabase
    .from("conversations")
    .select("*")
    .order("last_message_at", { ascending: false });

  if (error) throw error;
  if (!convos || convos.length === 0) return [];

  // Fetch the last message for each conversation as preview
  const withPreviews = await Promise.all(
    convos.map(async (convo) => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("body, role")
        .eq("conversation_id", convo.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastMsg = msgs?.[0];
      return {
        ...convo,
        preview: lastMsg
          ? `${lastMsg.role === "bot" ? "Bot: " : ""}${lastMsg.body}`
          : "No messages yet",
      } as ConversationWithPreview;
    }),
  );

  return withPreviews;
}

// --- Main Page ---

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  // Real-time subscription for conversation updates
  useEffect(() => {
    const channel = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filtered = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    return conversations.filter((convo) => {
      if (search) {
        const q = search.toLowerCase();
        const matchPhone = convo.phone.toLowerCase().includes(q);
        const matchPreview = convo.preview.toLowerCase().includes(q);
        if (!matchPhone && !matchPreview) return false;
      }

      if (filter === "today") {
        return new Date(convo.last_message_at).toDateString() === todayStr;
      }
      if (filter === "7days") {
        return new Date(convo.last_message_at).getTime() > weekAgo;
      }
      return true;
    });
  }, [conversations, search, filter]);

  const selectedConvo = conversations.find((c) => c.id === selectedId);

  // Auto-select first conversation
  useEffect(() => {
    if (!selectedId && filtered.length > 0) {
      setTimeout(() => {
        setSelectedId(filtered[0].id);
      }, 0);
    }
  }, [filtered, selectedId]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)]">
      <div className="shrink-0 mb-4">
        <h1 className="text-xl font-semibold">Conversations</h1>
        <p className="text-sm text-muted-foreground">
          Chat history between customers and the AI via WhatsApp
        </p>
      </div>

      {isLoading ? (
        <Card className="flex-1">
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : conversations.length === 0 ? (
        <Card className="flex-1">
          <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="text-xs mt-1">
              Messages will appear here once customers start chatting via
              WhatsApp.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex-1 flex min-h-0 rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
          {/* Left panel - conversation list */}
          <div className="w-80 border-r flex flex-col shrink-0">
            {/* Search & Filter */}
            <ConversationSearchFilter
              search={search}
              onSearchChange={setSearch}
              filter={filter}
              onFilterChange={setFilter}
            />

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No conversations match your search
                </div>
              ) : (
                <ConversationList
                  conversations={filtered}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              )}
            </div>

            {/* Count */}
            <div className="border-t px-3 py-2">
              <p className="text-[11px] text-muted-foreground">
                {filtered.length} conversation{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Right panel - chat */}
          {selectedConvo ? (
            <ChatPanel
              key={selectedConvo.id}
              conversationId={selectedConvo.id}
              phone={selectedConvo.phone}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
