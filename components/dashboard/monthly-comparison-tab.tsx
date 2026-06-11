import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MonthlyComparisonResult } from "@/domain/monthly-comparison";

function formatCLP(value: number): string {
  return "$" + new Intl.NumberFormat("es-CL").format(value);
}

interface MonthlyComparisonTabProps {
  comparison: MonthlyComparisonResult;
}

export function MonthlyComparisonTab({ comparison }: MonthlyComparisonTabProps) {
  const {
    currentTotal,
    previousTotal,
    absoluteDifference,
    percentageDifference,
    highestIncreaseCategory,
    highestDecreaseCategory,
  } = comparison;

  const diffLabel =
    absoluteDifference > 0
      ? "Más gasto"
      : absoluteDifference < 0
        ? "Menos gasto"
        : "Sin cambio";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card
        className="animate-fade-in transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        style={{ animationDelay: "0ms" }}
      >
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Comparación Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Mes actual</span>
              <span className="font-mono text-sm font-semibold tracking-tight">
                {formatCLP(currentTotal)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Mes anterior</span>
              <span className="font-mono text-sm font-medium">
                {formatCLP(previousTotal)}
              </span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{diffLabel}</span>
                <span className="flex items-center gap-2">
                  <span
                    className={`font-mono text-sm font-bold ${
                      absoluteDifference > 0
                        ? "text-danger"
                        : absoluteDifference < 0
                          ? "text-success"
                          : ""
                    }`}
                  >
                    {absoluteDifference > 0 ? "+" : ""}
                    {formatCLP(absoluteDifference)}
                  </span>
                  {percentageDifference !== null && (
                    <Badge
                      variant={
                        absoluteDifference > 0
                          ? "danger"
                          : absoluteDifference < 0
                            ? "success"
                            : "secondary"
                      }
                    >
                      {absoluteDifference > 0 ? "+" : ""}
                      {percentageDifference.toFixed(1)}%
                    </Badge>
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card
          className="animate-fade-in transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
          style={{ animationDelay: "60ms" }}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mayor Aumento por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highestIncreaseCategory ? (
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">
                  {highestIncreaseCategory.categoryName}
                </span>
                <span className="font-mono text-sm font-semibold tracking-tight text-danger">
                  +{formatCLP(highestIncreaseCategory.difference)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin aumentos</p>
            )}
          </CardContent>
        </Card>

        <Card
          className="animate-fade-in transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
          style={{ animationDelay: "120ms" }}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mayor Disminución por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highestDecreaseCategory ? (
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">
                  {highestDecreaseCategory.categoryName}
                </span>
                <span className="font-mono text-sm font-semibold tracking-tight text-success">
                  {formatCLP(highestDecreaseCategory.difference)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin disminuciones</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
