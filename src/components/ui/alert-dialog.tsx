"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: "default" | "destructive";
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "default",
}: AlertDialogProps) {
  const [isPending, setIsPending] = React.useState(false);

  async function handleConfirm() {
    setIsPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-desc"
    >
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden
        onClick={() => !isPending && onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl border border-[#e8e4e0] bg-white p-6 shadow-xl",
        )}
      >
        <h2 id="alert-dialog-title" className="text-lg font-semibold text-[#5c5a57]">
          {title}
        </h2>
        <p id="alert-dialog-desc" className="mt-2 text-sm text-[#9c9894]">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => !isPending && onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
