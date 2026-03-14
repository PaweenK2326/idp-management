"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { updateIdpAction } from "@/actions/idp.actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IdpFormSchema, type IdpFormInput } from "@/types";
import type { IdpSubmission } from "@prisma/client";

interface IdpFormEditProps {
  idpId: string;
  idp: IdpSubmission;
}

export function IdpFormEdit({ idpId, idp }: IdpFormEditProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IdpFormInput>({
    resolver: zodResolver(IdpFormSchema),
    defaultValues: {
      year: idp.year,
      quarterStart: idp.quarterStart,
      quarterEnd: idp.quarterEnd,
      skillGoal: idp.skillGoal,
      actionPlan: idp.actionPlan,
      status: idp.status,
    },
  });

  async function onSubmit(data: IdpFormInput) {
    setError(null);
    const result = await updateIdpAction(idpId, data);
    if (result.success) {
      toast.success("IDP updated successfully!");
      router.push("/idp/summary");
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("year")} />
      <div>
        <label className="mb-1 block text-sm font-medium">Quarter Start</label>
        <Select {...register("quarterStart", { valueAsNumber: true })}>
          {[1, 2, 3, 4].map((q) => (
            <option key={q} value={q}>Q{q}</option>
          ))}
        </Select>
        {errors.quarterStart && (
          <p className="mt-1 text-sm text-[#8b4545]">{errors.quarterStart.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Quarter End</label>
        <Select {...register("quarterEnd", { valueAsNumber: true })}>
          {[1, 2, 3, 4].map((q) => (
            <option key={q} value={q}>Q{q}</option>
          ))}
        </Select>
        {errors.quarterEnd && (
          <p className="mt-1 text-sm text-[#8b4545]">{errors.quarterEnd.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Skill Goal</label>
        <Textarea {...register("skillGoal")} rows={3} />
        {errors.skillGoal && (
          <p className="mt-1 text-sm text-[#8b4545]">{errors.skillGoal.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Action Plan</label>
        <Textarea {...register("actionPlan")} rows={3} />
        {errors.actionPlan && (
          <p className="mt-1 text-sm text-[#8b4545]">{errors.actionPlan.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Status</label>
        <Select {...register("status")}>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </Select>
        {errors.status && (
          <p className="mt-1 text-sm text-[#8b4545]">{errors.status.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-[#8b4545]">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
        <Link
          href="/idp/summary"
          className="inline-flex h-10 items-center justify-center rounded-md border border-[#e8e4e0] bg-white px-4 text-sm font-medium hover:bg-[#f5f2ef]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
