"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const SwaggerUI = dynamic(() => import("swagger-ui-react").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center text-[#9c9894]">
      กำลังโหลด Swagger UI...
    </div>
  ),
});

import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <header className="sticky top-0 z-10 border-b border-[#e8e4e0] bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-[#5c5a57] hover:text-[#2d4a6a]"
            >
              ← กลับ
            </Link>
            <h1 className="text-lg font-semibold text-[#5c5a57]">
              API Docs (OpenAPI / Swagger)
            </h1>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-xl border border-[#e8e4e0] bg-white shadow-sm overflow-hidden">
          <SwaggerUI url="/api/openapi" />
        </div>
      </main>
    </div>
  );
}
