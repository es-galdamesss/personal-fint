import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
  placeholder?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
          "transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/40 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "motion-reduce:transition-none",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
