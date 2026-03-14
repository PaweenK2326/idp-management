import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

interface DashboardSummaryBoxProps {
  stats: DashboardStats;
}

export function DashboardSummaryBox({ stats }: DashboardSummaryBoxProps) {
  const pendingApproval = stats.submittedCount - stats.approvedCount;

  return (
    <Card className="overflow-hidden border-[#e8e4e0] bg-[#faf8f6]">
      <CardContent className="p-6">
        <h2 className="mb-4 text-base font-semibold text-[#5c5a57]">
          Quarter summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#9c9894]">
              Total budget requested
            </p>
            <p className="mt-1 text-xl font-bold text-[#5c5a57]">
              {stats.totalBudgetRequested.toLocaleString()}
            </p>
            <p className="mt-0.5 text-xs text-[#9c9894]">across all submissions</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#9c9894]">
              Approved
            </p>
            <p className="mt-1 text-xl font-bold text-[#458b6a]">
              {stats.approvedCount}
            </p>
            <p className="mt-0.5 text-xs text-[#9c9894]">IDP(s) approved by HR</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#9c9894]">
              Pending approval
            </p>
            <p className="mt-1 text-xl font-bold text-[#8b7a45]">
              {pendingApproval}
            </p>
            <p className="mt-0.5 text-xs text-[#9c9894]">awaiting HR review</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#9c9894]">
              Submission rate
            </p>
            <p className="mt-1 text-xl font-bold text-[#5c5a57]">
              {stats.completionRate}%
            </p>
            <p className="mt-0.5 text-xs text-[#9c9894]">
              {stats.submittedCount} / {stats.totalEmployees} employees
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
