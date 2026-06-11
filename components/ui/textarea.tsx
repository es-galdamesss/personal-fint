import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
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
Textarea.displayName = "Textarea";

export { Textarea };
