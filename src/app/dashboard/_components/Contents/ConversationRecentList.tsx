import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

type ConversationPreview = {
  id: string;
  phone: string;
  last_message_at: string;
  preview: string;
};

export default function ConversationRecentList({
  conversations,
  formatTime,
}: {
  conversations: ConversationPreview[];
  formatTime: (dateStr: string) => string;
}) {
  return (
    <>
      <h2 className="text-sm font-semibold mb-3">Recent conversations</h2>
      {conversations.length === 0 ? (
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
          {conversations.map((convo) => (
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
    </>
  );
}
