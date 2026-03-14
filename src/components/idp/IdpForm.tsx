"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { submitIdpAction } from "@/actions/idp.actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IdpFormSchema, type IdpFormInput } from "@/types";

interface IdpFormProps {
  currentYear: number;
  currentQuarter: number;
}

export function IdpForm({ currentYear, currentQuarter }: IdpFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<IdpFormInput>({
    resolver: zodResolver(IdpFormSchema),
    defaultValues: {
      year: currentYear,
      quarterStart: currentQuarter,
      quarterEnd: currentQuarter,
      skillGoal: "",
      actionPlan: "",
      budget: undefined,
      status: "TODO",
    },
  });

  async function onSubmit(data: IdpFormInput) {
    setError(null);
    const result = await submitIdpAction(data);
    if (result.success) {
      toast.success("IDP submitted successfully!");
      reset({
        year: currentYear,
        quarterStart: currentQuarter,
        quarterEnd: currentQuarter,
        skillGoal: "",
        actionPlan: "",
        budget: undefined,
        status: "TODO",
      });
      router.push("/idp/summary");
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
            <option key={q} value={q}>
              Q{q}
            </option>
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
            <option key={q} value={q}>
              Q{q}
            </option>
          ))}
        </Select>
        {errors.quarterEnd && (
          <p className="mt-1 text-sm text-[#8b4545]">{errors.quarterEnd.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Skill Goal</label>
        <Textarea
          {...register("skillGoal")}
          placeholder="e.g. Advanced TypeScript & React Patterns"
          rows={3}
        />
        {errors.skillGoal && (
          <p className="mt-1 text-sm text-[#8b4545]">{errors.skillGoal.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Action Plan</label>
        <Textarea
          {...register("actionPlan")}
          placeholder="e.g. Complete online courses and build sample projects"
          rows={3}
        />
        {errors.actionPlan && (
          <p className="mt-1 text-sm text-[#8b4545]">{errors.actionPlan.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Budget (optional)</label>
        <input
          type="number"
          min={0}
          {...register("budget", { valueAsNumber: true, setValueAs: (v) => (v === "" || Number.isNaN(v) ? undefined : v) })}
          className="w-full rounded-md border border-[#e8e4e0] bg-white px-3 py-2 text-sm focus:border-[#8ab4e0] focus:outline-none focus:ring-1 focus:ring-[#8ab4e0]"
          placeholder="e.g. 5000"
        />
        {errors.budget && (
          <p className="mt-1 text-sm text-[#8b4545]">{errors.budget.message}</p>
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
      {error && (
        <p className="text-sm text-[#8b4545]">{error}</p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit IDP"}
      </Button>
    </form>
  );
}
