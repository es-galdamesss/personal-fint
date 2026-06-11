import { cn } from "@/lib/utils";
import type { TrafficLightStatus, CategoryTrafficLightStatus } from "@/domain/traffic-light";

const colorMap: Record<TrafficLightStatus | "NO_LIMIT", string> = {
  GREEN: "bg-success",
  YELLOW: "bg-warning",
  RED: "bg-danger",
  NO_LIMIT: "bg-muted-foreground",
};

const labelMap: Record<TrafficLightStatus | "NO_LIMIT", string> = {
  GREEN: "OK",
  YELLOW: "Precaución",
  RED: "Excedido",
  NO_LIMIT: "Sin límite",
};

interface TrafficLightIndicatorProps {
  status: CategoryTrafficLightStatus;
  className?: string;
}

export function TrafficLightIndicator({ status, className }: TrafficLightIndicatorProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span
        className={cn("inline-block h-2.5 w-2.5 rounded-full", colorMap[status])}
        aria-hidden="true"
      />
      <span>{labelMap[status]}</span>
    </span>
  );
}
