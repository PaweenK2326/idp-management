import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Company } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)) as string;
}

export function getCurrentQuarter(): number {
  const month = new Date().getMonth() + 1;
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

export function getQuarterDateRange(
  year: number,
  quarter: number
): { start: Date; end: Date } {
  const quarterMonths: Record<number, { start: number; end: number }> = {
    1: { start: 0, end: 2 },
    2: { start: 3, end: 5 },
    3: { start: 6, end: 8 },
    4: { start: 9, end: 11 },
  };
  const { start: startMonth, end: endMonth } = quarterMonths[quarter];
  return {
    start: new Date(year, startMonth, 1),
    end: new Date(year, endMonth + 1, 0),
  };
}

export function formatQuarterLabel(
  qs: number,
  qe: number,
  year: number
): string {
  if (qs === qe) return `Q${qs} ${year}`;
  return `Q${qs}–Q${qe} ${year}`;
}

export function getSubsidiaryIds(
  companies: Company[],
  rootId: string
): string[] {
  const result: string[] = [rootId];
  const children = companies.filter((c) => c.parentId === rootId);
  for (const child of children) {
    result.push(...getSubsidiaryIds(companies, child.id));
  }
  return result;
}
