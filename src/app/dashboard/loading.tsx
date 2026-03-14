import { NavbarSkeleton } from "@/components/layout/NavbarSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <NavbarSkeleton />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="mb-8 flex flex-wrap gap-4">
          <Skeleton className="h-10 w-40 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <div className="rounded-xl border border-[#e8e4e0] bg-white shadow-sm">
            <div className="border-b border-[#e8e4e0] px-6 py-4">
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
