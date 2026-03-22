import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Total conversations", value: "127" },
  { label: "Messages today", value: "23" },
  { label: "Avg response time", value: "1.2s" },
];

const recentConversations = [
  {
    phone: "+1 (415) 555-0123",
    time: "2 min ago",
    preview: "Hey, do you have the premium roast coffee in stock?",
  },
  {
    phone: "+1 (312) 555-0456",
    time: "15 min ago",
    preview: "What's the price for a 5-pack of protein bars?",
  },
  {
    phone: "+1 (718) 555-0789",
    time: "1 hr ago",
    preview: "Are you guys open on Sundays?",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Overview of your AI assistant activity
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-sm font-semibold mb-3">Recent conversations</h2>
      <div className="space-y-2">
        {recentConversations.map((convo) => (
          <Card
            key={convo.phone}
            className="hover:border-muted-foreground/30 transition-colors cursor-pointer"
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
