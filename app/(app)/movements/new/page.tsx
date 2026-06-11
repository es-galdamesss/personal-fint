"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

export default function NewMovementPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.filter((cat: Category & { isActive: boolean }) => cat.isActive));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          amount: parseInt(amount, 10),
          date: new Date(date).toISOString(),
          categoryId,
          notes: notes || null,
          isRecurring,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el gasto");
      }

      router.push("/movements");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nuevo Movimiento</h2>
          <p className="mt-1 text-muted-foreground">Registrar un gasto</p>
        </div>
        <Link href="/movements">
          <Button variant="outline">Volver</Button>
        </Link>
      </header>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Datos del Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Supermercado"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto (CLP)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="font-mono"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              {isRecurring && (
                <p className="text-xs text-muted-foreground">
                  Esta fecha será el día de cobro mensual y la fecha de inicio.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              {isLoading ? (
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              ) : (
                <Select
                  id="category"
                  options={categoryOptions}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  placeholder="Seleccionar categoría"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <Label htmlFor="recurring" className="font-normal">
                  Gasto recurrente mensual
                </Label>
              </div>
              {isRecurring && (
                <p className="text-xs text-muted-foreground pl-6">
                  El gasto se repetirá automáticamente cada mes en la fecha
                  seleccionada.
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar Gasto"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
