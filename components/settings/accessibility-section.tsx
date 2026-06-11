"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ============================================
   SVG Icons — hoisted outside render
   ============================================ */
const iconContrast = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />
  </svg>
);

const toggleBaseClass = cn(
  "flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4",
  "cursor-pointer transition-all duration-150 motion-reduce:transition-none",
  "hover:bg-accent/50"
);

export function AccessibilitySection() {
  const { fontSize, contrast, setFontSize, setContrast } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accesibilidad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Font Size */}
        <fieldset>
          <legend className="mb-3 text-sm text-muted-foreground">
            Tamaño de fuente
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <button
              id="settings-font-normal"
              type="button"
              role="radio"
              aria-checked={fontSize === "normal"}
              onClick={() => setFontSize("normal")}
              className={cn(
                toggleBaseClass,
                fontSize === "normal"
                  ? "border-primary bg-accent shadow-sm"
                  : "border-border"
              )}
            >
              <span className="font-mono text-base font-semibold">Aa</span>
              <span className="text-sm font-medium">Normal</span>
            </button>

            <button
              id="settings-font-large"
              type="button"
              role="radio"
              aria-checked={fontSize === "large"}
              onClick={() => setFontSize("large")}
              className={cn(
                toggleBaseClass,
                fontSize === "large"
                  ? "border-primary bg-accent shadow-sm"
                  : "border-border"
              )}
            >
              <span className="font-mono text-xl font-semibold">Aa</span>
              <span className="text-sm font-medium">Grande</span>
            </button>
          </div>
        </fieldset>

        {/* Contrast */}
        <fieldset>
          <legend className="mb-3 text-sm text-muted-foreground">
            Contraste
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <button
              id="settings-contrast-normal"
              type="button"
              role="radio"
              aria-checked={contrast === "normal"}
              onClick={() => setContrast("normal")}
              className={cn(
                toggleBaseClass,
                contrast === "normal"
                  ? "border-primary bg-accent shadow-sm"
                  : "border-border"
              )}
            >
              <span className="rounded-full bg-muted p-2.5 text-muted-foreground">
                {iconContrast}
              </span>
              <span className="text-sm font-medium">Normal</span>
            </button>

            <button
              id="settings-contrast-high"
              type="button"
              role="radio"
              aria-checked={contrast === "high"}
              onClick={() => setContrast("high")}
              className={cn(
                toggleBaseClass,
                contrast === "high"
                  ? "border-primary bg-accent shadow-sm"
                  : "border-border"
              )}
            >
              <span className="rounded-full bg-foreground p-2.5 text-background">
                {iconContrast}
              </span>
              <span className="text-sm font-medium">Alto contraste</span>
            </button>
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}
