"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CompanyOption {
  id: string;
  name: string;
}

interface DashboardFiltersProps {
  companies: CompanyOption[];
  currentQuarter: number;
  currentYear: number;
  showCompanyFilter?: boolean;
}

/** Value format: "quarter-year" e.g. "1-2025" */
function buildPeriodValue(quarter: number, year: number) {
  return `${quarter}-${year}`;
}

function parsePeriodValue(value: string): { quarter: number; year: number } | null {
  const [q, y] = value.split("-").map(Number);
  if (Number.isInteger(q) && Number.isInteger(y) && q >= 1 && q <= 4) return { quarter: q, year: y };
  return null;
}

const YEARS_COUNT = 3;
const QUARTERS = [1, 2, 3, 4] as const;

export function DashboardFilters({
  companies,
  currentQuarter,
  currentYear,
  showCompanyFilter = false,
}: DashboardFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const periodInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") ?? "";
  const periodParam = searchParams.get("period");
  const parsed = periodParam ? parsePeriodValue(periodParam) : null;
  const selectedQuarter = parsed?.quarter ?? currentQuarter;
  const selectedYear = parsed?.year ?? currentYear;
  const selectedPeriodValue = buildPeriodValue(selectedQuarter, selectedYear);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverYear, setPopoverYear] = useState(selectedYear);

  useEffect(() => {
    setPopoverYear(selectedYear);
  }, [selectedYear]);

  const years = Array.from({ length: YEARS_COUNT }, (_, i) => currentYear - i);

  function handleSelectQuarter(quarter: number, year: number) {
    const value = buildPeriodValue(quarter, year);
    if (periodInputRef.current) periodInputRef.current.value = value;
    setPopoverOpen(false);
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      action="/dashboard"
      method="GET"
      className="flex flex-wrap items-center gap-4 rounded-xl border border-[#e8e4e0] bg-white p-4 shadow-sm"
    >
      <input
        ref={periodInputRef}
        type="hidden"
        name="period"
        defaultValue={selectedPeriodValue}
      />
      {showCompanyFilter && companies.length > 0 && (
        <div className="flex items-center gap-2">
          <label htmlFor="filter-company" className="text-sm font-medium text-[#5c5a57]">
            Company
          </label>
          <Select
            id="filter-company"
            name="companyId"
            defaultValue={companyId}
            onChange={() => formRef.current?.requestSubmit()}
            className="min-w-[160px] rounded-lg"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-[#5c5a57]">
          Quarter · Year
        </label>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="min-w-[120px] justify-between rounded-lg font-medium"
            >
              <span>Q{selectedQuarter} {selectedYear}</span>
              <span className="ml-1 opacity-60" aria-hidden>▾</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-0">
            <div className="p-2">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#9c9894]">
                เลือกปี
              </p>
              <div className="flex gap-1 rounded-lg bg-[#f5f2ef] p-1">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setPopoverYear(y)}
                    className={cn(
                      "cursor-pointer flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                      popoverYear === y
                        ? "bg-white text-[#2d4a6a] shadow-sm"
                        : "text-[#5c5a57] hover:bg-white/60"
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-[#e8e4e0] p-2">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#9c9894]">
                เลือก Quarter — {popoverYear}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {QUARTERS.map((q) => {
                  const isSelected = selectedQuarter === q && selectedYear === popoverYear;
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSelectQuarter(q, popoverYear)}
                      className={cn(
                        "cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                        isSelected
                          ? "border-[#8ab4e0] bg-[#e8f0f8] text-[#2d4a6a]"
                          : "border-[#e8e4e0] bg-white text-[#5c5a57] hover:border-[#ddd9d5] hover:bg-[#faf8f6]"
                      )}
                    >
                      Q{q}
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </form>
  );
}
