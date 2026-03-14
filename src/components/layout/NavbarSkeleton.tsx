import { Skeleton } from "@/components/ui/skeleton";

export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e8e4e0] bg-white">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </header>
  );
}
