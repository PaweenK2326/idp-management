import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/layout/Navbar";
import { IdpForm } from "@/components/idp/IdpForm";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentQuarter } from "@/lib/utils";

export default async function IdpPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "EMPLOYEE") redirect("/dashboard");

  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();

  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            My IDP — Q{currentQuarter} {currentYear}
          </h1>
          <Link
            href="/idp/summary"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#e8e4e0] bg-white px-3 text-sm font-medium hover:bg-[#f5f2ef]"
          >
            View Summary
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6">
            <IdpForm
              currentYear={currentYear}
              currentQuarter={currentQuarter}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
