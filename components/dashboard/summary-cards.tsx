import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrafficLightIndicator } from "./traffic-light-indicator";
import type { TrafficLightStatus } from "@/domain/traffic-light";

function formatCLP(value: number): string {
  return "$" + new Intl.NumberFormat("es-CL").format(value);
}

interface SummaryCardsProps {
  budgetAmount: number;
  totalUsed: number;
  availableMoney: number;
  usagePercentage: number;
  trafficLight: TrafficLightStatus;
}

export function SummaryCards({
  budgetAmount,
  totalUsed,
  availableMoney,
  usagePercentage,
  trafficLight,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        className="animate-fade-in transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        style={{ animationDelay: "0ms" }}
      >
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Presupuesto Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-2xl font-bold tracking-tight">
            {budgetAmount > 0 ? formatCLP(budgetAmount) : "$0"}
          </p>
        </CardContent>
      </Card>

      <Card
        className="animate-fade-in transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        style={{ animationDelay: "60ms" }}
      >
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Gastado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-2xl font-bold tracking-tight">
            {formatCLP(totalUsed)}
          </p>
        </CardContent>
      </Card>

      <Card
        className="animate-fade-in transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        style={{ animationDelay: "120ms" }}
      >
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-2xl font-bold tracking-tight">
            {formatCLP(availableMoney)}
          </p>
        </CardContent>
      </Card>

      <Card
        className="animate-fade-in transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        style={{ animationDelay: "180ms" }}
      >
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Estado del Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-2xl font-bold tracking-tight">
            {budgetAmount > 0 ? `${usagePercentage.toFixed(1)}%` : "—"}
          </p>
          <TrafficLightIndicator status={trafficLight} className="mt-1" />
        </CardContent>
      </Card>
    </div>
  );
}
