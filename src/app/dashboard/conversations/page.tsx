"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Conversation, Message } from "@/lib/types";
import { MessageSquare, Search, Bot, User } from "lucide-react";

const supabase = createClient();

type ConversationWithPreview = Conversation & {
  preview: string;
  unread_count?: number;
};

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

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Message[];
}

// --- Helpers ---

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

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="whitespace-pre-wrap break-words overflow-hidden space-y-0.5 [overflow-wrap:anywhere]">
      {lines.map((line, i) => (
        <div key={i}>{formatInline(line)}</div>
      ))}
    </div>
  );
}

function formatInline(text: string): React.ReactNode[] {
  // Match **bold**, *italic*, and _italic_
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // **bold**
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      // _italic_
      parts.push(<em key={match.index}>{match[4]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// --- Components ---

function ConversationList({
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

function ChatPanel({
  conversationId,
  phone,
}: {
  conversationId: string;
  phone: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["messages", conversationId],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b px-4 py-3">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn("flex", i % 2 === 0 ? "justify-end" : "")}
            >
              <Skeleton
                className={cn("h-12 rounded-xl", i % 2 === 0 ? "w-48" : "w-56")}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Group messages by date
  const grouped: { date: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const dateStr = new Date(msg.created_at).toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const last = grouped[grouped.length - 1];
    if (last && last.date === dateStr) {
      last.messages.push(msg);
    } else {
      grouped.push({ date: dateStr, messages: [msg] });
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      {/* Chat header */}
      <div className="border-b px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {phone.slice(-2)}
        </div>
        <div>
          <p className="text-sm font-semibold">{phone}</p>
          <p className="text-[11px] text-muted-foreground">WhatsApp</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm">No messages in this conversation</p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground font-medium">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Messages for this date */}
              <div className="space-y-2">
                {group.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {msg.role === "bot" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted mb-1">
                        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[70%] overflow-hidden px-3 py-2 rounded-2xl text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm",
                      )}
                    >
                      <FormattedMessage text={msg.body} />
                      <p
                        className={cn(
                          "text-[10px] mt-1 text-right",
                          msg.role === "user"
                            ? "text-white/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatMessageTime(msg.created_at)}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mb-1">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
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
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8 h-9 text-sm"
                  placeholder="Search phone or message..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All conversations</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
