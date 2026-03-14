import { NavbarSkeleton } from "@/components/layout/NavbarSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function IdpSummaryLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <NavbarSkeleton />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-6 h-14 w-full rounded-lg" />
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-56" />
            <Skeleton className="h-4 w-52" />
          </div>
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <div className="space-y-8">
          <div>
            <Skeleton className="mb-3 h-6 w-16" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
