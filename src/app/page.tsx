import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { MockLoginForm } from "@/components/login/MockLoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    if (session.role === "EMPLOYEE") redirect("/idp/summary");
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    include: { company: true },
  });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#faf8f6] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#e8f0f8_0%,transparent_50%)]" aria-hidden />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[radial-gradient(ellipse_at_bottom,#f5e6e8_0%,transparent_60%)]" aria-hidden />
      <div className="relative w-full max-w-lg">
        <MockLoginForm users={users} />
      </div>
    </div>
  );
}
