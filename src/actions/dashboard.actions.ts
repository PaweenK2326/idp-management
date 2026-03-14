"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getCurrentQuarter, getSubsidiaryIds } from "@/lib/utils";
import type { DashboardStats, SubmissionRow } from "@/types";

export async function getDashboardStats(
  companyId?: string,
  quarter?: number,
  year?: number
): Promise<DashboardStats | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "EMPLOYEE") return null;

  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const targetQuarter = quarter ?? currentQuarter;
  const targetYear = year ?? currentYear;

  let companyIds: string[];

  if (session.role === "HR_GROUP") {
    if (companyId) {
      companyIds = [companyId];
    } else {
      const companies = await prisma.company.findMany();
      companyIds = companies.map((c) => c.id);
    }
  } else {
    const companies = await prisma.company.findMany();
    companyIds = getSubsidiaryIds(companies, session.companyId);
  }

  const employees = await prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
      companyId: { in: companyIds },
    },
  });

  const employeeIds = employees.map((e) => e.id);

  const submittedInQuarter = await prisma.idpSubmission.findMany({
    where: {
      userId: { in: employeeIds },
      year: targetYear,
      quarterStart: { lte: targetQuarter },
      quarterEnd: { gte: targetQuarter },
    },
    distinct: ["userId"],
  });

  const submittedCount = submittedInQuarter.length;
  const totalEmployees = employees.length;
  const pendingCount = totalEmployees - submittedCount;
  const completionRate =
    totalEmployees > 0
      ? Math.round((submittedCount / totalEmployees) * 100)
      : 0;

  return {
    totalEmployees,
    submittedCount,
    pendingCount,
    completionRate,
    quarter: targetQuarter,
    year: targetYear,
  };
}

export async function getSubmissionList(
  companyId?: string,
  quarter?: number,
  year?: number
): Promise<SubmissionRow[]> {
  const session = await getSession();
  if (!session) return [];
  if (session.role === "EMPLOYEE") return [];

  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const targetQuarter = quarter ?? currentQuarter;
  const targetYear = year ?? currentYear;

  let companyIds: string[];

  if (session.role === "HR_GROUP") {
    if (companyId) {
      companyIds = [companyId];
    } else {
      const companies = await prisma.company.findMany();
      companyIds = companies.map((c) => c.id);
    }
  } else {
    const companies = await prisma.company.findMany();
    companyIds = getSubsidiaryIds(companies, session.companyId);
  }

  const idps = await prisma.idpSubmission.findMany({
    where: {
      user: { companyId: { in: companyIds } },
      year: targetYear,
      quarterStart: { lte: targetQuarter },
      quarterEnd: { gte: targetQuarter },
    },
    include: { user: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return idps.map((idp) => ({
    id: idp.id,
    userName: idp.user.name,
    companyName: idp.user.company.name,
    quarterStart: idp.quarterStart,
    quarterEnd: idp.quarterEnd,
    year: idp.year,
    skillGoal:
      idp.skillGoal.length > 40
        ? idp.skillGoal.slice(0, 40) + "..."
        : idp.skillGoal,
    status: idp.status,
    createdAt: idp.createdAt,
  }));
}

export async function getCompaniesForSelector() {
  const session = await getSession();
  if (!session) return [];
  if (session.role === "EMPLOYEE") return [];

  if (session.role === "HR_GROUP") {
    return prisma.company.findMany({ orderBy: { name: "asc" } });
  }

  const companies = await prisma.company.findMany();
  const ids = getSubsidiaryIds(companies, session.companyId);
  return prisma.company.findMany({
    where: { id: { in: ids } },
    orderBy: { name: "asc" },
  });
}
