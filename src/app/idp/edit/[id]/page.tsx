import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getIdpById } from "@/actions/idp.actions";
import { Navbar } from "@/components/layout/Navbar";
import { IdpFormEdit } from "@/components/idp/IdpFormEdit";
import { Card, CardContent } from "@/components/ui/card";

export default async function IdpEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "EMPLOYEE") redirect("/dashboard");

  const { id } = await params;
  const idp = await getIdpById(id);
  if (!idp) notFound();

  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/idp/summary"
            className="cursor-pointer text-sm text-[#5c5a57] hover:text-[#2d4a6a]"
          >
            ← Back to Summary
          </Link>
        </div>
        <h1 className="mb-6 text-2xl font-bold">Edit IDP</h1>
        <Card>
          <CardContent className="pt-6">
            <IdpFormEdit idpId={idp.id} idp={idp} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
