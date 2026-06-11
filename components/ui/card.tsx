import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-border bg-background p-6",
          "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
          "dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 pb-4", className)}
        {...props}
      />
    );
  }
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-lg font-semibold leading-none tracking-tight",
          className
        )}
        {...props}
      />
    );
  }
);
CardTitle.displayName = "CardTitle";

const CardContent = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("", className)} {...props} />;
  }
);
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
