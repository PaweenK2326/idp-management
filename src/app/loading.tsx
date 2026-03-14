import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#faf8f6] p-4">
      <Skeleton className="h-12 w-full max-w-md rounded-lg" />
      <Skeleton className="mt-4 h-10 w-24 rounded-md" />
    </div>
  );
}
