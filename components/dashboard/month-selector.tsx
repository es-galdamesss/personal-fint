"use client";

import { Button } from "@/components/ui/button";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

function getPrevious(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

function getNext(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

function isCurrentMonth(year: number, month: number) {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month;
}

export function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const prev = getPrevious(year, month);
  const next = getNext(year, month);
  const atCurrent = isCurrentMonth(year, month);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(prev.year, prev.month)}
        aria-label="Mes anterior"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </Button>

      <span className="min-w-[140px] text-center font-mono text-sm font-semibold tracking-tight">
        {MONTH_NAMES[month - 1]} {year}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(next.year, next.month)}
        disabled={atCurrent}
        aria-label="Mes siguiente"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </Button>
    </div>
  );
}
