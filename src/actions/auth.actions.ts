"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession, clearSession } from "@/lib/session";
import type { ActionResult } from "@/types";

export async function loginAction(userId: string): Promise<ActionResult<void>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await setSession(userId);

    if (user.role === "EMPLOYEE") {
      redirect("/idp/summary");
    }
    redirect("/dashboard");
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) {
      throw e;
    }
    return { success: false, error: "Login failed" };
  }
}

export async function logoutAction(): Promise<ActionResult<void>> {
  try {
    await clearSession();
    redirect("/");
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) {
      throw e;
    }
    return { success: false, error: "Logout failed" };
  }
}
