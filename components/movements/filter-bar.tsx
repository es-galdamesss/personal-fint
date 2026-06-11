"use client";

import { Select } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

interface FilterBarProps {
  categories: Category[];
  selectedMonth: string;
  selectedYear: string;
  selectedCategoryId: string;
  selectedSource: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSourceChange: (value: string) => void;
}

export function FilterBar({
  categories,
  selectedMonth,
  selectedYear,
  selectedCategoryId,
  selectedSource,
  onMonthChange,
  onYearChange,
  onCategoryChange,
  onSourceChange,
}: FilterBarProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const categoryOptions = [
    { value: "", label: "Todas las categorías" },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  const sourceOptions = [
    { value: "", label: "Todos los tipos" },
    { value: "MANUAL", label: "Gastos manuales" },
    { value: "RECURRING", label: "Gastos recurrentes" },
  ];

  const yearOptions = [
    { value: "", label: "Todos los años" },
    ...years.map((y) => ({ value: String(y), label: String(y) })),
  ];

  const monthOptions = [
    { value: "", label: "Todos los meses" },
    ...months,
  ];

  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-full sm:w-auto">
        <Select
          options={yearOptions}
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          aria-label="Filtrar por año"
          className="w-full sm:w-[140px]"
        />
      </div>
      <div className="w-full sm:w-auto">
        <Select
          options={monthOptions}
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          aria-label="Filtrar por mes"
          className="w-full sm:w-[160px]"
        />
      </div>
      <div className="w-full sm:w-auto">
        <Select
          options={categoryOptions}
          value={selectedCategoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filtrar por categoría"
          className="w-full sm:w-[200px]"
        />
      </div>
      <div className="w-full sm:w-auto">
        <Select
          options={sourceOptions}
          value={selectedSource}
          onChange={(e) => onSourceChange(e.target.value)}
          aria-label="Filtrar por tipo"
          className="w-full sm:w-[180px]"
        />
      </div>
    </div>
  );
}
