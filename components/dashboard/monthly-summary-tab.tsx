import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardData } from "@/services/dashboard.service";

function formatCLP(value: number): string {
  return "$" + new Intl.NumberFormat("es-CL").format(value);
}

interface MonthlySummaryTabProps {
  highestSpendingCategory: DashboardData["highestSpendingCategory"];
  pendingRecurringExpenses: DashboardData["pendingRecurringExpenses"];
}

export function MonthlySummaryTab({
  highestSpendingCategory,
  pendingRecurringExpenses,
}: MonthlySummaryTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card
        className="animate-fade-in transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        style={{ animationDelay: "0ms" }}
      >
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Mayor Gasto por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          {highestSpendingCategory ? (
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">
                {highestSpendingCategory.categoryName}
              </span>
              <span className="font-mono text-lg font-bold tracking-tight">
                {formatCLP(highestSpendingCategory.amount)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin gastos este mes</p>
          )}
        </CardContent>
      </Card>

      <Card
        className="animate-fade-in transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        style={{ animationDelay: "60ms" }}
      >
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Gastos Recurrentes Pendientes (Próximo Mes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRecurringExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay gastos pendientes</p>
          ) : (
            <ul className="space-y-2">
              {pendingRecurringExpenses.map((re) => (
                <li
                  key={re.recurringExpenseId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className={re.isCancelled ? "text-muted-foreground line-through" : ""}>
                    {re.description}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono font-medium">
                      {re.isCancelled ? "—" : formatCLP(re.amount)}
                    </span>
                    {re.isCancelled && (
                      <Badge variant="danger">Cancelado</Badge>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
