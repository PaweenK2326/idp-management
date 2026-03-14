"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { DashboardStats } from "@/types";

interface SubmissionChartProps {
  stats: DashboardStats;
}

const COLORS = {
  submitted: "#7bc9a0",
  pending: "#e8c88a",
};

export function SubmissionChart({ stats }: SubmissionChartProps) {
  const data = [
    { name: "Submitted", value: stats.submittedCount, color: COLORS.submitted },
    { name: "Pending", value: stats.pendingCount, color: COLORS.pending },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[#e8e4e0] bg-[#faf8f6]/50 text-[#9c9894]">
        <span className="text-3xl opacity-50">📊</span>
        <p className="mt-2 text-sm">No data for this period</p>
      </div>
    );
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
