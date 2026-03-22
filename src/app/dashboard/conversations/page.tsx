"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Conversation, Message } from "@/lib/types";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<
    (Conversation & { messages: Message[]; preview: string })[]
  >([]);
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      const supabase = createClient();

      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .order("last_message_at", { ascending: false });

      if (!convos || convos.length === 0) {
        setLoading(false);
        return;
      }

      const withMessages = await Promise.all(
        convos.map(async (convo) => {
          const { data: msgs } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", convo.id)
            .order("created_at", { ascending: true });

          const messages = (msgs ?? []) as Message[];
          const lastUserMsg = [...messages]
            .reverse()
            .find((m) => m.role === "user");

          return {
            ...convo,
            messages,
            preview: lastUserMsg?.body ?? "No messages yet",
          };
        }),
      );

      setConversations(withMessages);
      setLoading(false);
    }

    fetchConversations();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    return conversations.filter((convo) => {
      if (search) {
        const q = search.toLowerCase();
        const matchPhone = convo.phone.toLowerCase().includes(q);
        const matchMsg = convo.messages.some((m) =>
          m.body.toLowerCase().includes(q),
        );
        if (!matchPhone && !matchMsg) return false;
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

  const active = filtered[selected] ?? null;

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-semibold">Conversations</h1>
        <p className="text-sm text-muted-foreground mb-6">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Conversations</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Chat history between customers and the AI via WhatsApp
      </p>

      <div className="flex gap-3 mb-4">
        <Input
          className="flex-1"
          placeholder="Search by phone or keyword..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelected(0);
          }}
        />
        <Select
          value={filter}
          onValueChange={(v) => {
            if (v) {
              setFilter(v);
              setSelected(0);
            }
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No conversations yet. Messages will appear here once customers start
            chatting via WhatsApp.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active chat detail */}
          {active && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold">{active.phone}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(active.last_message_at)}
                  </span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {active.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] px-3 py-2 rounded-xl text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-blue-50 text-blue-900"
                            : "bg-muted text-foreground",
                        )}
                      >
                        <p>{msg.body}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation list */}
          <div className="space-y-2">
            {filtered.map((convo, i) => (
              <Card
                key={convo.id}
                className={cn(
                  "cursor-pointer transition-colors hover:border-muted-foreground/30",
                  i === selected && "border-foreground/20 bg-muted/50",
                )}
                onClick={() => setSelected(i)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{convo.phone}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(convo.last_message_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {convo.preview}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
