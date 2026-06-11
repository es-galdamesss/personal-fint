"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Budget {
  id: string;
  year: number;
  month: number;
  amount: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function MonthlyBudgetSection() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [amount, setAmount] = useState("");
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setFeedback(null);
      try {
        const res = await fetch("/api/budgets");
        const json: ApiResponse<Budget[]> = await res.json();
        if (!ignore && json.success) {
          const found = json.data.find((b) => b.year === year && b.month === month);
          setCurrentBudget(found ?? null);
          setAmount(found ? String(found.amount) : "");
        }
      } catch {
        if (!ignore) setFeedback({ type: "error", message: "Error al cargar el presupuesto" });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [year, month]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) {
      setFeedback({ type: "error", message: "El monto debe ser mayor a 0" });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, amount: numAmount }),
      });
      const json: ApiResponse<Budget> = await res.json();
      if (res.ok && json.success) {
        setCurrentBudget(json.data);
        setFeedback({
          type: "success",
          message: currentBudget
            ? "Presupuesto actualizado"
            : "Presupuesto creado",
        });
      } else {
        setFeedback({ type: "error", message: "Error al guardar" });
      }
    } catch {
      setFeedback({ type: "error", message: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presupuesto Mensual</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Month & Year selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="settings-budget-month">Mes</Label>
              <select
                id="settings-budget-month"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/40 focus-visible:border-primary"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-budget-year">Año</Label>
              <Input
                id="settings-budget-year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2020}
                max={2100}
                className="font-mono"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="settings-budget-amount">Monto mensual (CLP)</Label>
            <Input
              id="settings-budget-amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              className="font-mono"
            />
          </div>

          {/* Current budget display */}
          {!loading && currentBudget && (
            <div className="rounded-md bg-muted px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Presupuesto actual para{" "}
                <span className="font-medium text-foreground">
                  {MONTH_NAMES[currentBudget.month - 1]} {currentBudget.year}
                </span>
              </p>
              <p className="mt-1 font-mono text-lg font-semibold">
                {formatCLP(currentBudget.amount)}
              </p>
            </div>
          )}

          {!loading && !currentBudget && (
            <p className="text-sm text-muted-foreground">
              No hay presupuesto definido para {MONTH_NAMES[month - 1]} {year}.
            </p>
          )}

          {/* Feedback */}
          {feedback && (
            <p
              role="status"
              className={
                feedback.type === "success"
                  ? "text-sm text-success"
                  : "text-sm text-danger"
              }
            >
              {feedback.message}
            </p>
          )}

          <Button
            id="settings-budget-save"
            type="submit"
            disabled={saving || loading}
          >
            {saving
              ? "Guardando…"
              : currentBudget
                ? "Actualizar Presupuesto"
                : "Crear Presupuesto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
