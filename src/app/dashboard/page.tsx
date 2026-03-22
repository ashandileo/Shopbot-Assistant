import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import {
  MessageSquare,
  MessagesSquare,
  Package,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:border-muted-foreground/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-sm font-semibold mb-3">Recent conversations</h2>
      {recentConversations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No conversations yet.</p>
            <p className="text-xs mt-1">
              Messages will appear here once customers start chatting via
              WhatsApp.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {recentConversations.map((convo) => (
            <Link
              key={convo.id}
              href="/dashboard/conversations"
            >
              <Card className="hover:border-muted-foreground/30 transition-colors cursor-pointer overflow-hidden">
                <CardContent className="p-4 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold truncate">{convo.phone}</span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatTime(convo.last_message_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {convo.preview}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
