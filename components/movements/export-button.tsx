"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  source: string;
  notes?: string | null;
  category: {
    name: string;
  };
}

interface ExportButtonProps {
  expenses: Expense[];
  disabled?: boolean;
}

export function ExportButton({ expenses, disabled = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (expenses.length === 0) return;

    setIsExporting(true);

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Movimientos");

      worksheet.columns = [
        { header: "Fecha", key: "date", width: 15 },
        { header: "Descripción", key: "description", width: 30 },
        { header: "Categoría", key: "category", width: 20 },
        { header: "Monto", key: "amount", width: 15 },
        { header: "Tipo", key: "source", width: 15 },
        { header: "Notas", key: "notes", width: 30 },
      ];

      worksheet.getRow(1).font = { bold: true };

      expenses.forEach((expense) => {
        worksheet.addRow({
          date: new Date(expense.date).toLocaleDateString("es-CL"),
          description: expense.description,
          category: expense.category.name,
          amount: expense.amount,
          source: expense.source === "RECURRING" ? "Recurrente" : "Manual",
          notes: expense.notes || "",
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `movimientos-${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled || isExporting || expenses.length === 0}
    >
      {isExporting ? "Exportando..." : "Exportar a Excel"}
    </Button>
  );
}
