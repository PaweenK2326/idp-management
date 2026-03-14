"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createUserAction } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { CreateUserSchema, type CreateUserInput } from "@/types";

type Company = { id: string; name: string };

interface UserFormProps {
  companies: Company[];
}

export function UserForm({ companies }: UserFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "EMPLOYEE",
      companyId: "",
    },
  });

  async function onSubmit(data: CreateUserInput) {
    setError(null);
    const result = await createUserAction(data);
    if (result.success) {
      toast.success("User added.");
      reset({ name: "", email: "", role: "EMPLOYEE", companyId: "" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  if (companies.length === 0) {
    return (
      <p className="text-sm text-[#9c9894]">
        No companies yet. Add companies first.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Add user</h2>
        <p className="text-sm text-[#9c9894]">
          Create a new user and assign company and role.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. John Doe"
              className="flex h-10 w-full rounded-md border border-[#e8e4e0] bg-white px-3 py-2 text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-[#8b4545]">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="e.g. john@company.com"
              className="flex h-10 w-full rounded-md border border-[#e8e4e0] bg-white px-3 py-2 text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-[#8b4545]">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Company</label>
            <Select {...register("companyId")}>
              <option value="">Select company...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {errors.companyId && (
              <p className="mt-1 text-sm text-[#8b4545]">{errors.companyId.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role</label>
            <Select {...register("role")}>
              <option value="EMPLOYEE">Employee</option>
              <option value="HR_COMPANY">HR (Company)</option>
              <option value="HR_GROUP">HR (Group)</option>
            </Select>
            {errors.role && (
              <p className="mt-1 text-sm text-[#8b4545]">{errors.role.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-[#8b4545]">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add user"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
