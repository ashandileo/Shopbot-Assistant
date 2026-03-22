import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

type StatItem = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

export default function StatsGrid({ stats }: { stats: StatItem[] }) {
  return (
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
  );
}
