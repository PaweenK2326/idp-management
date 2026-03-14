import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  getDashboardStats,
  getSubmissionList,
  getCompaniesForSelector,
} from "@/actions/dashboard.actions";

export const dynamic = "force-dynamic";
import { getCurrentQuarter } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SubmissionTable } from "@/components/dashboard/SubmissionTable";
import { SubmissionChart } from "@/components/dashboard/SubmissionChart";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";

/** Parse "quarter-year" e.g. "1-2025" -> { quarter: 1, year: 2025 } */
function parsePeriod(period: string | undefined): { quarter?: number; year?: number } {
  if (!period) return {};
  const [q, y] = period.split("-").map(Number);
  if (Number.isInteger(q) && Number.isInteger(y) && q >= 1 && q <= 4) {
    return { quarter: q, year: y };
  }
  return {};
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; period?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "EMPLOYEE") redirect("/idp/summary");

  const params = await searchParams;
  const companyId = params.companyId ?? undefined;
  const { quarter: quarterParam, year: yearParam } = parsePeriod(params.period);

  const currentQuarter = getCurrentQuarter();
  const currentYear = new Date().getFullYear();

  const [stats, submissions, companies] = await Promise.all([
    getDashboardStats(companyId, quarterParam, yearParam),
    getSubmissionList(companyId, quarterParam, yearParam),
    getCompaniesForSelector(),
  ]);

  if (!stats) redirect("/");

  const headingCompany =
    session.role === "HR_GROUP" && companyId
      ? companies.find((c: { id: string; name: string }) => c.id === companyId)?.name ?? "All Companies"
      : session.role === "HR_GROUP"
        ? "All Companies"
        : session.company.name;

  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-[#5c5a57]">
            IDP Dashboard
          </h1>
          <p className="text-[#9c9894]">
            {headingCompany} · Q{stats.quarter} {stats.year}
          </p>
        </div>

        <div className="mb-8">
          <DashboardFilters
            companies={companies}
            currentQuarter={currentQuarter}
            currentYear={currentYear}
            showCompanyFilter={session.role === "HR_GROUP"}
          />
        </div>

        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-[#e8e4e0] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#5c5a57]">
              Submission Overview — Q{stats.quarter} {stats.year}
            </h2>
            <SubmissionChart stats={stats} />
          </div>
          <div className="rounded-xl border border-[#e8e4e0] bg-white shadow-sm">
            <div className="border-b border-[#e8e4e0] px-6 py-4">
              <h2 className="text-base font-semibold text-[#5c5a57]">
                Submission Table
              </h2>
            </div>
            <SubmissionTable rows={submissions} pendingCount={stats.pendingCount} />
          </div>
        </div>
      </main>
    </div>
  );
}
