"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { formatQuarterLabel } from "@/lib/utils";
import { approveIdpAction } from "@/actions/idp.actions";
import { toast } from "sonner";
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

function formatBudget(budget: number | null): string {
  if (budget == null) return "—";
  return budget.toLocaleString();
}

/** Format date for display; use fixed locale to avoid hydration mismatch (server vs client locale). */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function SubmissionTable({ rows, pendingCount }: SubmissionTableProps) {
  const router = useRouter();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<SubmissionRow | null>(null);

  async function handleApproveConfirm() {
    if (!approveTarget) return;
    const result = await approveIdpAction(approveTarget.id);
    if (result.success) {
      toast.success("IDP approved.");
      setApproveTarget(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function openApproveDialog(row: SubmissionRow) {
    setApproveTarget(row);
    setApproveDialogOpen(true);
  }

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
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#faf8f6] hover:bg-[#faf8f6]">
            <TableHead>Employee Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Q-Period</TableHead>
            <TableHead>Skill Goal</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Approval</TableHead>
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
              <TableCell>{formatBudget(row.budget)}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusClassName(row.status)}>
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDate(new Date(row.createdAt))}
              </TableCell>
              <TableCell>
                {row.approvedAt ? (
                  <span className="text-sm text-[#458b6a]">
                    ✓ {formatDate(new Date(row.approvedAt))}
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openApproveDialog(row)}
                  >
                    Approve
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={approveDialogOpen}
        onOpenChange={(open) => {
          setApproveDialogOpen(open);
          if (!open) setApproveTarget(null);
        }}
        title="Approve IDP"
        description={
          approveTarget ? (
            <>
              Approve IDP for <strong>{approveTarget.userName}</strong> (
              {formatQuarterLabel(approveTarget.quarterStart, approveTarget.quarterEnd, approveTarget.year)}
              )? This action will mark the submission as approved.
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Approve"
        onConfirm={handleApproveConfirm}
      />
    </>
  );
}
