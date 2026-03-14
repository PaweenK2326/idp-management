import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { MockLoginForm } from "@/components/login/MockLoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    if (session.role === "EMPLOYEE") redirect("/idp/summary");
    redirect("/dashboard");
  }

  let users: (User & { company: { id: string; name: string } })[] = [];
  try {
    users = await prisma.user.findMany({
      include: { company: true },
    });
  } catch (e) {
    console.error("Database error on login page:", e);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f6] p-4">
        <p className="text-center text-[#5c5a57]">ไม่สามารถเชื่อมต่อฐานข้อมูลได้</p>
        <p className="mt-2 text-center text-sm text-[#9c9894]">
          ตรวจสอบว่าได้ตั้งค่า DATABASE_URL ใน Vercel Environment Variables แล้ว
        </p>
      </div>
    );
  }

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
