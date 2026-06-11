"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { MonthlySummaryTab } from "@/components/dashboard/monthly-summary-tab";
import { CategoriesTab } from "@/components/dashboard/categories-tab";
import { MonthlyComparisonTab } from "@/components/dashboard/monthly-comparison-tab";
import type { DashboardData } from "@/services/dashboard.service";

type Tab = "summary" | "categories" | "comparison";

const TABS: { id: Tab; label: string }[] = [
  { id: "summary", label: "Resumen Mensual" },
  { id: "categories", label: "Categorías" },
  { id: "comparison", label: "Comparación" },
];

function getDefaultMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

interface DashState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

type DashAction =
  | { type: "start" }
  | { type: "success"; data: DashboardData }
  | { type: "error"; message: string };

function dashReducer(state: DashState, action: DashAction): DashState {
  switch (action.type) {
    case "start":
      return { data: null, loading: true, error: null };
    case "success":
      return { data: action.data, loading: false, error: null };
    case "error":
      return { ...state, loading: false, error: action.message };
  }
}

export default function DashboardPage() {
  const [year, setYear] = useState(() => getDefaultMonth().year);
  const [month, setMonth] = useState(() => getDefaultMonth().month);
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [state, dispatch] = useReducer(dashReducer, {
    data: null,
    loading: true,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "start" });

    fetch(`/api/dashboard?year=${year}&month=${month}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (controller.signal.aborted) return;
        if (!json.success) {
          dispatch({ type: "error", message: json.error ?? "Error al cargar datos" });
          return;
        }
        dispatch({ type: "success", data: json.data as DashboardData });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          dispatch({ type: "error", message: "Error de conexión" });
        }
      });

    return () => {
      controller.abort();
    };
  }, [year, month]);

  const handleMonthChange = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen mensual de tu presupuesto
          </p>
        </div>
        <MonthSelector year={year} month={month} onChange={handleMonthChange} />
      </header>

      {state.loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-border bg-background p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="mt-3 h-7 w-32 rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {state.error && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-danger">{state.error}</p>
        </div>
      )}

      {!state.loading && !state.error && state.data && (
        <>
          <SummaryCards
            budgetAmount={state.data.budget?.amount ?? 0}
            totalUsed={state.data.totalUsed}
            availableMoney={state.data.availableMoney}
            usagePercentage={state.data.usagePercentage}
            trafficLight={state.data.trafficLight}
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium font-mono transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            {activeTab === "summary" && (
              <MonthlySummaryTab
                highestSpendingCategory={state.data.highestSpendingCategory}
                pendingRecurringExpenses={state.data.pendingRecurringExpenses}
              />
            )}
            {activeTab === "categories" && (
              <CategoriesTab categories={state.data.categories} />
            )}
            {activeTab === "comparison" && (
              <MonthlyComparisonTab comparison={state.data.monthlyComparison} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
