import { NavbarSkeleton } from "@/components/layout/NavbarSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function IdpEditLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <NavbarSkeleton />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Skeleton className="mb-6 h-4 w-32" />
          <Skeleton className="mb-6 h-8 w-32" />
        </div>
        <div className="rounded-lg border border-[#e8e4e0] bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </main>
    </div>
  );
}
