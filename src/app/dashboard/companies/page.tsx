import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getCompaniesForAdmin } from "@/actions/admin.actions";
import { Navbar } from "@/components/layout/Navbar";
import { CompanyForm } from "@/components/admin/CompanyForm";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "HR_GROUP") redirect("/dashboard");

  const companies = await getCompaniesForAdmin();

  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="cursor-pointer text-sm text-[#5c5a57] hover:text-[#2d4a6a]"
            >
              ← Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-[#5c5a57]">
              Manage Companies
            </h1>
            <p className="mt-1 text-sm text-[#9c9894]">
              Add child companies (subsidiaries) under a parent company.
            </p>
          </div>
        </div>

        <CompanyForm companies={companies} />

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-[#5c5a57]">
            All companies ({companies.length})
          </h2>
          <ul className="space-y-2 rounded-xl border border-[#e8e4e0] bg-white p-4">
            {companies.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-[#e8e4e0] bg-[#faf8f6] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[#5c5a57]">{c.name}</p>
                  <p className="text-xs text-[#9c9894]">
                    {c.parent ? `Parent: ${c.parent.name}` : "Root company"} ·{" "}
                    {c._count.users} user{c._count.users !== 1 ? "s" : ""} ·{" "}
                    {c._count.children} child companies
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
