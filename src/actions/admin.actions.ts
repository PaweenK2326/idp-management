"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { CreateCompanySchema, CreateUserSchema } from "@/types";
import type { ActionResult } from "@/types";

export async function createCompanyAction(
  data: unknown
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.role !== "HR_GROUP") return { success: false, error: "HR Group only" };

    const parsed = CreateCompanySchema.safeParse(data);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return { success: false, error: first?.message ?? "Invalid input" };
    }

    const parent = await prisma.company.findUnique({
      where: { id: parsed.data.parentId },
    });
    if (!parent) return { success: false, error: "Parent company not found" };

    await prisma.company.create({
      data: {
        name: parsed.data.name,
        parentId: parsed.data.parentId,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/companies");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error("createCompanyAction", e);
    return { success: false, error: "Failed to create company" };
  }
}

export async function createUserAction(data: unknown): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.role !== "HR_GROUP") return { success: false, error: "HR Group only" };

    const parsed = CreateUserSchema.safeParse(data);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return { success: false, error: first?.message ?? "Invalid input" };
    }

    const company = await prisma.company.findUnique({
      where: { id: parsed.data.companyId },
    });
    if (!company) return { success: false, error: "Company not found" };

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) return { success: false, error: "Email already in use" };

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        companyId: parsed.data.companyId,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error("createUserAction", e);
    return { success: false, error: "Failed to create user" };
  }
}

export async function getCompaniesForAdmin() {
  const session = await getSession();
  if (!session || session.role !== "HR_GROUP") return [];

  return prisma.company.findMany({
    orderBy: { name: "asc" },
    include: { parent: true, _count: { select: { users: true, children: true } } },
  });
}

export async function getUsersForAdmin() {
  const session = await getSession();
  if (!session || session.role !== "HR_GROUP") return [];

  return prisma.user.findMany({
    orderBy: { name: "asc" },
    include: { company: true },
  });
}
