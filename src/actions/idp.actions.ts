"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getCurrentQuarter } from "@/lib/utils";
import { IdpFormSchema } from "@/types";
import type { ActionResult, BannerStateWithDetails } from "@/types";

export async function submitIdpAction(
  data: unknown
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.role !== "EMPLOYEE") {
      return { success: false, error: "Only employees can submit IDP" };
    }

    const parsed = IdpFormSchema.safeParse(data);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message ?? "Invalid input",
      };
    }

    await prisma.idpSubmission.create({
      data: {
        userId: session.id,
        year: parsed.data.year,
        quarterStart: parsed.data.quarterStart,
        quarterEnd: parsed.data.quarterEnd,
        skillGoal: parsed.data.skillGoal,
        actionPlan: parsed.data.actionPlan,
        status: parsed.data.status,
      },
    });

    revalidatePath("/idp");
    return { success: true, data: undefined };
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("submitIdpAction error:", e);
    }
    return { success: false, error: "Internal server error" };
  }
}

export async function getMyIdps() {
  const session = await getSession();
  if (!session) return [];

  const idps = await prisma.idpSubmission.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return idps;
}

export async function getIdpById(idpId: string) {
  const session = await getSession();
  if (!session) return null;

  const idp = await prisma.idpSubmission.findFirst({
    where: { id: idpId, userId: session.id },
  });
  return idp;
}

export async function updateIdpAction(
  idpId: string,
  data: unknown
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.role !== "EMPLOYEE") return { success: false, error: "Only employees can edit IDP" };

    const existing = await prisma.idpSubmission.findFirst({
      where: { id: idpId, userId: session.id },
    });
    if (!existing) return { success: false, error: "IDP not found" };

    const parsed = IdpFormSchema.safeParse(data);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? "Invalid input" };
    }

    await prisma.idpSubmission.update({
      where: { id: idpId },
      data: {
        year: parsed.data.year,
        quarterStart: parsed.data.quarterStart,
        quarterEnd: parsed.data.quarterEnd,
        skillGoal: parsed.data.skillGoal,
        actionPlan: parsed.data.actionPlan,
        status: parsed.data.status,
      },
    });

    revalidatePath("/idp");
    revalidatePath("/idp/summary");
    return { success: true, data: undefined };
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error("updateIdpAction error:", e);
    return { success: false, error: "Internal server error" };
  }
}

export async function getIdpBannerState(
  userId: string
): Promise<BannerStateWithDetails> {
  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();

  const [overdue, currentQuarterIdp] = await Promise.all([
    prisma.idpSubmission.findFirst({
      where: {
        userId,
        status: { not: "COMPLETED" },
        OR: [
          { year: { lt: currentYear } },
          {
            year: currentYear,
            quarterEnd: { lt: currentQuarter },
          },
        ],
      },
      orderBy: [{ year: "desc" }, { quarterEnd: "desc" }],
    }),
    prisma.idpSubmission.findFirst({
      where: {
        userId,
        year: currentYear,
        quarterStart: { lte: currentQuarter },
        quarterEnd: { gte: currentQuarter },
      },
    }),
  ]);

  if (overdue) {
    return {
      state: "OVERDUE",
      overdueYear: overdue.year,
      overdueQuarterEnd: overdue.quarterEnd,
    };
  }
  if (!currentQuarterIdp) return { state: "MISSING_CURRENT" };
  if (currentQuarterIdp.status === "TODO") return { state: "TODO_CURRENT" };
  return { state: "NONE" };
}
