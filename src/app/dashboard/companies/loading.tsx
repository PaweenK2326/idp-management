import { NavbarSkeleton } from "@/components/layout/NavbarSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <NavbarSkeleton />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="mb-2 h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <section className="mt-8">
          <Skeleton className="mb-3 h-6 w-44" />
          <div className="space-y-2 rounded-xl border border-[#e8e4e0] bg-white p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
