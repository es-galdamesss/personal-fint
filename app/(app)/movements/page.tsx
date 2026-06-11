"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterBar } from "@/components/movements/filter-bar";
import { ExportButton } from "@/components/movements/export-button";

interface Category {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  source: string;
  notes?: string | null;
  category: {
    id: string;
    name: string;
  };
}

export default function MovementsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSource, setSelectedSource] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedYear) params.append("year", selectedYear);
        if (selectedMonth) params.append("month", selectedMonth);
        if (selectedCategoryId) params.append("categoryId", selectedCategoryId);
        if (selectedSource) params.append("source", selectedSource);

        const response = await fetch(`/api/movements?${params.toString()}`);
        const data = await response.json();
        if (data.success) {
          setExpenses(data.data);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [selectedMonth, selectedYear, selectedCategoryId, selectedSource]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Movimientos</h2>
          <p className="mt-1 text-muted-foreground">Historial de gastos</p>
        </div>
        <div className="flex gap-2">
          <ExportButton expenses={expenses} disabled={isLoading} />
          <Link href="/movements/new">
            <Button>Nuevo Gasto</Button>
          </Link>
        </div>
      </header>

      <FilterBar
        categories={categories}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedCategoryId={selectedCategoryId}
        selectedSource={selectedSource}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onCategoryChange={setSelectedCategoryId}
        onSourceChange={setSelectedSource}
      />

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Cargando...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                No hay movimientos registrados.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-mono text-sm">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        {expense.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {expense.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{expense.category.name}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatAmount(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          expense.source === "RECURRING" ? "default" : "outline"
                        }
                      >
                        {expense.source === "RECURRING"
                          ? "Recurrente"
                          : "Manual"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
