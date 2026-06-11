import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
          "transition-colors duration-150",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/40 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "motion-reduce:transition-none",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
