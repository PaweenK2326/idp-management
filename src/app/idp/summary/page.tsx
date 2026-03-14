import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getMyIdps, getIdpBannerState } from "@/actions/idp.actions";
import { getCurrentQuarter } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { DeadlineBanner } from "@/components/layout/DeadlineBanner";
import { Card, CardContent } from "@/components/ui/card";
import { formatQuarterLabel } from "@/lib/utils";
import type { IdpStatus } from "@prisma/client";

const statusLabels: Record<IdpStatus, string> = {
  TODO: "TODO",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export default async function IdpSummaryPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "EMPLOYEE") redirect("/dashboard");

  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();

  const [idps, bannerState] = await Promise.all([
    getMyIdps(),
    getIdpBannerState(session.id),
  ]);

  const byYearQuarter = idps.reduce<Record<string, typeof idps>>((acc, idp) => {
    const key = `${idp.year}-Q${idp.quarterStart}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(idp);
    return acc;
  }, {});

  const sortedKeys = Object.keys(byYearQuarter).sort((a, b) => {
    const [yA, qA] = a.split("-Q").map(Number);
    const [yB, qB] = b.split("-Q").map(Number);
    if (yA !== yB) return yB - yA;
    return qB - qA;
  });

  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <DeadlineBanner
          bannerState={bannerState}
          currentQuarter={currentQuarter}
          currentYear={currentYear}
        />
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#5c5a57]">IDP Summary by Quarter</h1>
            <p className="mt-1 text-sm text-[#9c9894]">
              View what you submitted each quarter
            </p>
          </div>
          <Link
            href="/idp"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#e8e4e0] bg-white px-3 text-sm font-medium hover:bg-[#f5f2ef]"
          >
            New IDP
          </Link>
        </div>

        {sortedKeys.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-[#9c9894]">
              <p className="mb-4">You have not submitted any IDP yet.</p>
              <Link
                href="/idp"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#8ab4e0] px-4 text-sm font-medium text-[#2d4a6a] hover:bg-[#7aa3d4]"
              >
                Create your first IDP
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {sortedKeys.map((key) => {
              const [year, q] = key.split("-Q").map(Number);
              const quarterIdps = byYearQuarter[key];
              const label = `Q${q} ${year}`;
              return (
                <div key={key}>
                  <h2 className="mb-3 text-lg font-semibold text-[#5c5a57]">
                    {label}
                  </h2>
                  <div className="space-y-3">
                    {quarterIdps.map((idp) => {
                      const isOverdue =
                        idp.status !== "COMPLETED" &&
                        (idp.year < currentYear ||
                          (idp.year === currentYear && idp.quarterEnd < currentQuarter));
                      return (
                        <Card
                          key={idp.id}
                          className={
                            isOverdue
                              ? "border-[#e8b4b4] bg-[#fdf2f2]"
                              : "border-[#e8e4e0]"
                          }
                        >
                          <CardContent className="flex items-start justify-between gap-4 pt-4">
                            <div className="min-w-0 flex-1 space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-medium text-[#9c9894]">
                                  {formatQuarterLabel(idp.quarterStart, idp.quarterEnd, idp.year)}
                                </p>
                                {isOverdue && (
                                  <span className="rounded bg-[#f5d5d5] px-1.5 py-0.5 text-xs font-medium text-[#8b4545]">
                                    Overdue
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-[#5c5a57]">{idp.skillGoal}</p>
                              <p className="text-[#9c9894]">{idp.actionPlan}</p>
                              <span className="inline-block rounded-full border border-[#e8e4e0] bg-[#f5f2ef] px-2 py-0.5 text-xs font-medium">
                                {statusLabels[idp.status]}
                              </span>
                            </div>
                            <Link
                              href={`/idp/edit/${idp.id}`}
                              className="shrink-0 text-sm font-medium text-[#8ab4e0] hover:underline"
                            >
                              Edit
                            </Link>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
