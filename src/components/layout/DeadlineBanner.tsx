import { getQuarterDateRange } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import type { BannerStateWithDetails } from "@/types";

interface DeadlineBannerProps {
  bannerState: BannerStateWithDetails;
  currentQuarter: number;
  currentYear: number;
}

export function DeadlineBanner({
  bannerState,
  currentQuarter,
  currentYear,
}: DeadlineBannerProps) {
  const { state } = bannerState;
  if (state === "NONE") return null;

  const { end } = getQuarterDateRange(currentYear, currentQuarter);
  const deadlineStr = end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (state === "OVERDUE") {
    const q = bannerState.overdueQuarterEnd ?? 4;
    const y = bannerState.overdueYear ?? currentYear - 1;
    return (
      <Alert variant="destructive" className="mb-4">
        <p className="font-medium">
          🚨 You have overdue IDP(s) from Q{q} {y} that are not completed.
        </p>
        <p className="mt-1 text-sm opacity-90">
          Please update your IDP status as soon as possible.
        </p>
      </Alert>
    );
  }

  if (state === "MISSING_CURRENT") {
    return (
      <Alert
        className="mb-4 border-[#e8d4a8] bg-[#f5e6c8] text-[#8b7345] [&>svg]:text-[#b89b5c]"
      >
        <p className="font-medium">
          ⚠️ You have not submitted your IDP for Q{currentQuarter} {currentYear}.
        </p>
        <p className="mt-1 text-sm opacity-90">
          Deadline: {deadlineStr}.
        </p>
      </Alert>
    );
  }

  if (state === "TODO_CURRENT") {
    return (
      <Alert className="mb-4 border-[#c4d4e8] bg-[#e0eaf5] text-[#4a6a8b] [&>svg]:text-[#6a8ab4]">
        <p className="font-medium">
          📋 Your Q{currentQuarter} {currentYear} IDP is saved but not started yet.
        </p>
        <p className="mt-1 text-sm opacity-90">Remember to update your progress.</p>
      </Alert>
    );
  }

  return null;
}
