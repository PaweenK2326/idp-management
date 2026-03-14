import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const CARDS = [
  {
    key: "total",
    title: "Total Employees",
    getValue: (s: DashboardStats) => s.totalEmployees,
    icon: "👥",
    bg: "bg-[#e8f0f8]",
  },
  {
    key: "submitted",
    title: "Submitted",
    getValue: (s: DashboardStats) => s.submittedCount,
    icon: "✓",
    bg: "bg-[#e8f5ec]",
  },
  {
    key: "pending",
    title: "Not yet submitted",
    getValue: (s: DashboardStats) => s.pendingCount,
    icon: "○",
    bg: "bg-[#f5f0e8]",
  },
  {
    key: "rate",
    title: "Completion Rate",
    getValue: (s: DashboardStats) => `${s.completionRate}%`,
    icon: "%",
    bg: "bg-[#f0e8f5]",
  },
] as const;

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => (
        <Card
          key={card.key}
          className="overflow-hidden border-[#e8e4e0] transition-shadow hover:shadow-md"
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg ${card.bg}`}
            >
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#9c9894]">{card.title}</p>
              <p className="mt-0.5 text-2xl font-bold text-[#5c5a57]">
                {card.getValue(stats)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
