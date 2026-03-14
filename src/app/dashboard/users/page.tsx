import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getUsersForAdmin } from "@/actions/admin.actions";
import { Navbar } from "@/components/layout/Navbar";
import { UserForm } from "@/components/admin/UserForm";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "HR_GROUP") redirect("/dashboard");

  const [users, companies] = await Promise.all([
    getUsersForAdmin(),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);

  const roleLabels: Record<string, string> = {
    EMPLOYEE: "Employee",
    HR_COMPANY: "HR (Company)",
    HR_GROUP: "HR (Group)",
  };

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
              Manage Users
            </h1>
            <p className="mt-1 text-sm text-[#9c9894]">
              Add users and assign them to a company and role.
            </p>
          </div>
        </div>

        <UserForm companies={companies} />

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-[#5c5a57]">
            All users ({users.length})
          </h2>
          <ul className="space-y-2 rounded-xl border border-[#e8e4e0] bg-white p-4">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-[#e8e4e0] bg-[#faf8f6] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[#5c5a57]">{u.name}</p>
                  <p className="text-xs text-[#9c9894]">
                    {u.email} · {roleLabels[u.role]} · {u.company.name}
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
