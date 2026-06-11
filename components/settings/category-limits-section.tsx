"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ============================================
   Types
   ============================================ */
interface Budget {
  id: string;
  year: number;
  month: number;
  amount: number;
}

interface Category {
  id: string;
  name: string;
  color: string | null;
  isActive: boolean;
}

interface CategoryLimit {
  id: string;
  budgetId: string;
  categoryId: string;
  amount: number;
  category?: Category;
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

/* ============================================
   Icons
   ============================================ */
const iconSave = (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const iconTrash = (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

/* ============================================
   Component
   ============================================ */
export function CategoryLimitsSection() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [limits, setLimits] = useState<CategoryLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state for adding a new limit
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // Inline edit state
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setFeedback(null);
      try {
        const [budgetsRes, categoriesRes] = await Promise.all([
          fetch("/api/budgets"),
          fetch("/api/categories"),
        ]);

        if (ignore) return;

        const budgetsJson: ApiResponse<Budget[]> = await budgetsRes.json();
        const categoriesJson: ApiResponse<Category[]> = await categoriesRes.json();

        if (categoriesJson.success) {
          setCategories(categoriesJson.data.filter((c) => c.isActive));
        }

        if (budgetsJson.success) {
          const found = budgetsJson.data.find(
            (b) => b.year === year && b.month === month
          );
          setBudget(found ?? null);

          if (found) {
            const limitsRes = await fetch(`/api/budgets/${found.id}/limits`);
            if (ignore) return;
            const limitsJson: ApiResponse<CategoryLimit[]> = await limitsRes.json();
            if (limitsJson.success) {
              setLimits(limitsJson.data);
            }
          } else {
            setLimits([]);
          }
        }
      } catch {
        if (!ignore) setFeedback({ type: "error", message: "Error al cargar datos" });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [year, month, refreshKey]);

  const reloadData = () => setRefreshKey((k) => k + 1);

  // Categories that don't yet have a limit for the selected budget
  const categoriesWithoutLimit = categories.filter(
    (cat) => !limits.some((l) => l.categoryId === cat.id)
  );

  const handleCreateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget || !selectedCategoryId || !limitAmount) return;

    const numAmount = parseInt(limitAmount, 10);
    if (!numAmount || numAmount <= 0) {
      setFeedback({ type: "error", message: "El monto debe ser mayor a 0" });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/budgets/${budget.id}/limits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: selectedCategoryId, amount: numAmount }),
      });
      if (res.ok) {
        setSelectedCategoryId("");
        setLimitAmount("");
        setFeedback({ type: "success", message: "Límite definido" });
        reloadData();
      } else {
        setFeedback({ type: "error", message: "Error al guardar el límite" });
      }
    } catch {
      setFeedback({ type: "error", message: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  };

  const startEditLimit = (limit: CategoryLimit) => {
    setEditingLimitId(limit.id);
    setEditAmount(String(limit.amount));
    setFeedback(null);
  };

  const handleUpdateLimit = async (limitId: string) => {
    if (!budget) return;
    const numAmount = parseInt(editAmount, 10);
    if (!numAmount || numAmount <= 0) {
      setFeedback({ type: "error", message: "El monto debe ser mayor a 0" });
      return;
    }

    setEditSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/budgets/${budget.id}/limits/${limitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount }),
      });
      if (res.ok) {
        setEditingLimitId(null);
        setFeedback({ type: "success", message: "Límite actualizado" });
        reloadData();
      } else {
        setFeedback({ type: "error", message: "Error al actualizar" });
      }
    } catch {
      setFeedback({ type: "error", message: "Error de conexión" });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteLimit = async (limitId: string) => {
    if (!budget) return;
    setFeedback(null);
    try {
      const res = await fetch(`/api/budgets/${budget.id}/limits/${limitId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedback({ type: "success", message: "Límite eliminado" });
        reloadData();
      } else {
        setFeedback({ type: "error", message: "Error al eliminar" });
      }
    } catch {
      setFeedback({ type: "error", message: "Error de conexión" });
    }
  };

  const getCategoryName = (categoryId: string): string => {
    const limit = limits.find((l) => l.categoryId === categoryId);
    if (limit?.category) return limit.category.name;
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name ?? "Desconocida";
  };

  const getCategoryColor = (categoryId: string): string => {
    const limit = limits.find((l) => l.categoryId === categoryId);
    if (limit?.category?.color) return limit.category.color;
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.color ?? "#a8a29e";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Límites por Categoría</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month & Year selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="settings-limits-month">Mes</Label>
            <select
              id="settings-limits-month"
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
            <Label htmlFor="settings-limits-year">Año</Label>
            <Input
              id="settings-limits-year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2020}
              max={2100}
              className="font-mono"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : !budget ? (
          <div className="rounded-md bg-muted px-4 py-3">
            <p className="text-sm text-muted-foreground">
              No hay presupuesto definido para{" "}
              <span className="font-medium text-foreground">
                {MONTH_NAMES[month - 1]} {year}
              </span>
              . Crea uno primero en la sección de Presupuesto Mensual.
            </p>
          </div>
        ) : (
          <>
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

            {/* Current limits */}
            {limits.length > 0 && (
              <div className="space-y-1">
                {limits.map((limit) => (
                  <div
                    key={limit.id}
                    className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    {editingLimitId === limit.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: getCategoryColor(limit.categoryId) }}
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium min-w-20">
                          {getCategoryName(limit.categoryId)}
                        </span>
                        <Input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="h-8 max-w-32 font-mono text-sm"
                          min={1}
                          aria-label="Monto del límite"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateLimit(limit.id)}
                          disabled={editSaving}
                          className="rounded-md p-1.5 text-success hover:bg-success/10 transition-colors"
                          aria-label="Guardar límite"
                        >
                          {iconSave}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingLimitId(null)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                          aria-label="Cancelar"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-block h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: getCategoryColor(limit.categoryId) }}
                            aria-hidden="true"
                          />
                          <span className="text-sm font-medium">
                            {getCategoryName(limit.categoryId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditLimit(limit)}
                            className={cn(
                              "font-mono text-sm font-medium",
                              "rounded-md px-2 py-1",
                              "hover:bg-muted transition-colors cursor-pointer"
                            )}
                            aria-label={`Editar límite de ${getCategoryName(limit.categoryId)}`}
                          >
                            {formatCLP(limit.amount)}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLimit(limit.id)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
                            aria-label={`Eliminar límite de ${getCategoryName(limit.categoryId)}`}
                          >
                            {iconTrash}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {limits.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay límites definidos para este mes.
              </p>
            )}

            {/* Add new limit form */}
            {categoriesWithoutLimit.length > 0 && (
              <form
                onSubmit={handleCreateLimit}
                className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
              >
                <p className="text-sm font-medium">Agregar límite</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="settings-limits-category">Categoría</Label>
                    <select
                      id="settings-limits-category"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/40 focus-visible:border-primary"
                    >
                      <option value="">Seleccionar…</option>
                      {categoriesWithoutLimit.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-limits-amount">Monto (CLP)</Label>
                    <Input
                      id="settings-limits-amount"
                      type="number"
                      value={limitAmount}
                      onChange={(e) => setLimitAmount(e.target.value)}
                      placeholder="0"
                      min={1}
                      className="font-mono"
                    />
                  </div>
                </div>
                <Button
                  id="settings-limits-save"
                  type="submit"
                  size="sm"
                  disabled={saving || !selectedCategoryId || !limitAmount}
                >
                  {saving ? "Guardando…" : "Definir límite"}
                </Button>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
