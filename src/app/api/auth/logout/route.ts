import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  await clearSession();
  const url = new URL("/", request.url);
  return NextResponse.redirect(url);
}
