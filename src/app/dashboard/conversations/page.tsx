"use client";

import { useState } from "react";
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

type Message = { role: "user" | "bot"; text: string };

type Conversation = {
  phone: string;
  time: string;
  preview: string;
  messages: Message[];
};

const conversations: Conversation[] = [
  {
    phone: "+1 (415) 555-0123",
    time: "Today, 2:32 PM",
    preview: "Hey, do you have the premium roast coffee in stock?",
    messages: [
      { role: "user", text: "Hey, do you have the premium roast coffee in stock?" },
      {
        role: "bot",
        text: "Hi! Yes, our Premium Roast Coffee (1lb) is in stock at $14.99. Would you like to place an order?",
      },
      { role: "user", text: "Nice! What about the green tea?" },
      {
        role: "bot",
        text: "Sorry, our Organic Green Tea 20ct is currently out of stock. I can let you know when it's back if you'd like! In the meantime, we have Cold Brew Concentrate (32oz) for $12.99 — would that interest you?",
      },
      {
        role: "user",
        text: "Sure, I'll take 2 of the coffee. Can you ship to Chicago?",
      },
    ],
  },
  {
    phone: "+1 (312) 555-0456",
    time: "15 min ago",
    preview: "What's the price for a 5-pack of protein bars?",
    messages: [
      { role: "user", text: "What's the price for a 5-pack of protein bars?" },
    ],
  },
  {
    phone: "+1 (718) 555-0789",
    time: "1 hr ago",
    preview: "Are you guys open on Sundays?",
    messages: [{ role: "user", text: "Are you guys open on Sundays?" }],
  },
];

export default function ConversationsPage() {
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const active = conversations[selected];

  return (
    <div>
      <h1 className="text-xl font-semibold">Conversations</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Chat history between customers and the AI
      </p>

      <div className="flex gap-3 mb-4">
        <Input
          className="flex-1"
          placeholder="Search by phone or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
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

      {/* Active chat detail */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">{active.phone}</span>
            <span className="text-xs text-muted-foreground">{active.time}</span>
          </div>
          <div className="space-y-3">
            {active.messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <span
                  className={cn(
                    "max-w-[70%] px-3 py-2 rounded-xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-blue-50 text-blue-900"
                      : "bg-muted text-foreground"
                  )}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation list */}
      <div className="space-y-2">
        {conversations.map((convo, i) => (
          <Card
            key={convo.phone}
            className={cn(
              "cursor-pointer transition-colors hover:border-muted-foreground/30",
              i === selected && "border-foreground/20 bg-muted/50"
            )}
            onClick={() => setSelected(i)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">{convo.phone}</span>
                <span className="text-xs text-muted-foreground">
                  {convo.time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {convo.preview}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
