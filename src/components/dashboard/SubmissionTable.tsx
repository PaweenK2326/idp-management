import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatQuarterLabel } from "@/lib/utils";
import type { SubmissionRow } from "@/types";

interface SubmissionTableProps {
  rows: SubmissionRow[];
  pendingCount?: number;
}

function getStatusClassName(status: string): string {
  if (status === "TODO") return "bg-[#e8e4e0] text-[#5c5a57]";
  if (status === "IN_PROGRESS") return "bg-[#d4e0f0] text-[#4a6a8b]";
  return "bg-[#c5e4d8] text-[#458b6a]";
}

export function SubmissionTable({ rows, pendingCount }: SubmissionTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-[#9c9894]">
        <p className="text-4xl opacity-50">📋</p>
        <p className="mt-2 text-sm font-medium">No IDP submissions for this quarter yet.</p>
        {pendingCount !== undefined && pendingCount > 0 && (
          <p className="mt-1 text-xs">
            {pendingCount} employee{pendingCount !== 1 ? "s" : ""} in scope have not submitted.
          </p>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#faf8f6] hover:bg-[#faf8f6]">
          <TableHead>Employee Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Q-Period</TableHead>
          <TableHead>Skill Goal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow
            key={row.id}
            className={i % 2 === 1 ? "bg-[#faf8f6]/50" : undefined}
          >
            <TableCell className="font-medium">{row.userName}</TableCell>
            <TableCell>{row.companyName}</TableCell>
            <TableCell>
              {formatQuarterLabel(row.quarterStart, row.quarterEnd, row.year)}
            </TableCell>
            <TableCell>{row.skillGoal}</TableCell>
            <TableCell>
              <Badge variant="outline" className={getStatusClassName(row.status)}>
              {row.status}
            </Badge>
            </TableCell>
            <TableCell>
              {new Date(row.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
