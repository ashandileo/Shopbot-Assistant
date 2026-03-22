import { createClient } from "@/lib/supabase/server";
import {
  MessageSquare,
  MessagesSquare,
  Package,
  HelpCircle,
} from "lucide-react";
import StatsGrid from "./_components/Contents/StatsGrid";
import ConversationRecentList from "./_components/Contents/ConversationRecentList";

export default async function DashboardPage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Fetch stats in parallel
  const [
    { count: totalConversations },
    { count: totalMessages },
    { count: messagesToday },
    { count: totalProducts },
    { count: totalFaqs },
    { data: recentConvos },
  ] = await Promise.all([
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString()),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("faqs").select("*", { count: "exact", head: true }),
    supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(5),
  ]);

  // Fetch last message for each recent conversation
  const recentConversations = await Promise.all(
    (recentConvos ?? []).map(async (convo) => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("body, role")
        .eq("conversation_id", convo.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastMsg = msgs?.[0];
      return {
        id: convo.id,
        phone: convo.phone,
        last_message_at: convo.last_message_at,
        preview: lastMsg
          ? `${lastMsg.role === "bot" ? "Bot: " : ""}${lastMsg.body}`
          : "No messages yet",
      };
    }),
  );

  const stats = [
    {
      label: "Total Conversations",
      value: totalConversations ?? 0,
      icon: MessagesSquare,
      href: "/dashboard/conversations",
    },
    {
      label: "Total Messages",
      value: totalMessages ?? 0,
      icon: MessageSquare,
      href: "/dashboard/conversations",
    },
    {
      label: "Messages Today",
      value: messagesToday ?? 0,
      icon: MessageSquare,
      href: "/dashboard/conversations",
    },
    {
      label: "Products",
      value: totalProducts ?? 0,
      icon: Package,
      href: "/dashboard/knowledge",
    },
    {
      label: "FAQs",
      value: totalFaqs ?? 0,
      icon: HelpCircle,
      href: "/dashboard/knowledge",
    },
  ];

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay === 1) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return (
    <div className="min-w-0">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Overview of your AI assistant activity
      </p>

      <StatsGrid stats={stats} />
      <ConversationRecentList
        conversations={recentConversations}
        formatTime={formatTime}
      />
    </div>
  );
}
