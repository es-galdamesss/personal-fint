import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrafficLightIndicator } from "./traffic-light-indicator";
import type { DashboardCategoryData } from "@/services/dashboard.service";

function formatCLP(value: number): string {
  return "$" + new Intl.NumberFormat("es-CL").format(value);
}

interface CategoriesTabProps {
  categories: DashboardCategoryData[];
}

export function CategoriesTab({ categories }: CategoriesTabProps) {
  if (categories.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <p className="text-center text-sm text-muted-foreground">
            No hay categorías con gastos este mes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat, i) => (
        <Card
          key={cat.categoryId}
          className="animate-fade-in transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>{cat.categoryName}</span>
              <TrafficLightIndicator status={cat.trafficLight} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Gastado</span>
                <span className="font-mono text-sm font-semibold tracking-tight">
                  {formatCLP(cat.spent)}
                </span>
              </div>
              {cat.limit !== null ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Límite</span>
                    <span className="font-mono text-sm font-medium">
                      {formatCLP(cat.limit)}
                    </span>
                  </div>
                  {cat.usagePercentage !== null && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Uso</span>
                      <span className="font-mono text-sm font-medium">
                        {cat.usagePercentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Límite</span>
                  <span className="text-sm text-muted-foreground">Sin límite</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
