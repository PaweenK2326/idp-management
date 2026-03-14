"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createCompanyAction } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { CreateCompanySchema, type CreateCompanyInput } from "@/types";

type CompanyWithMeta = {
  id: string;
  name: string;
  parentId: string | null;
  parent: { name: string } | null;
  _count: { users: number; children: number };
};

interface CompanyFormProps {
  companies: CompanyWithMeta[];
}

export function CompanyForm({ companies }: CompanyFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCompanyInput>({
    resolver: zodResolver(CreateCompanySchema),
    defaultValues: { name: "", parentId: "" },
  });

  async function onSubmit(data: CreateCompanyInput) {
    setError(null);
    const result = await createCompanyAction(data);
    if (result.success) {
      toast.success("Company added.");
      reset({ name: "", parentId: "" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  if (companies.length === 0) {
    return (
      <p className="text-sm text-[#9c9894]">
        No companies yet. Run the database seed to create initial companies.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Add child company</h2>
        <p className="text-sm text-[#9c9894]">
          Create a new subsidiary under an existing company.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Parent company</label>
            <Select {...register("parentId")}>
              <option value="">Select parent...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.parent ? ` (under ${c.parent.name})` : " (root)"}
                </option>
              ))}
            </Select>
            {errors.parentId && (
              <p className="mt-1 text-sm text-[#8b4545]">{errors.parentId.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Company name</label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. TechGroup Gamma"
              className="flex h-10 w-full rounded-md border border-[#e8e4e0] bg-white px-3 py-2 text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-[#8b4545]">{errors.name.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-[#8b4545]">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add company"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
