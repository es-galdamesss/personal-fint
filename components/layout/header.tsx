"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

/* ============================================
   Hoisted static SVG icons
   ============================================ */
const iconMoon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

const iconSun = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

const iconContrast = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />
  </svg>
);

const headerButtonClass = cn(
  "inline-flex items-center justify-center rounded-md p-2",
  "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  "transition-colors duration-150 motion-reduce:transition-none",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
);

export function Header() {
  const { theme, fontSize, contrast, setTheme, setFontSize, setContrast } = useTheme();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between",
        "border-b border-border bg-background/80 px-4 backdrop-blur-md",
        "supports-[backdrop-filter]:bg-background/60",
        "lg:px-6"
      )}
      role="banner"
    >
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium text-muted-foreground lg:hidden">
          Fint
        </h1>
      </div>

      <nav aria-label="Controles de accesibilidad" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={headerButtonClass}
          aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
        >
          {theme === "light" ? iconMoon : iconSun}
        </button>

        <button
          type="button"
          onClick={() => setFontSize(fontSize === "normal" ? "large" : "normal")}
          className={cn(headerButtonClass, "font-mono text-xs font-bold")}
          aria-label={fontSize === "normal" ? "Aumentar tamaño de fuente" : "Reducir tamaño de fuente"}
          aria-pressed={fontSize === "large"}
        >
          A
        </button>

        <button
          type="button"
          onClick={() => setContrast(contrast === "normal" ? "high" : "normal")}
          className={headerButtonClass}
          aria-label={contrast === "normal" ? "Activar alto contraste" : "Desactivar alto contraste"}
          aria-pressed={contrast === "high"}
        >
          {iconContrast}
        </button>
      </nav>
    </header>
  );
}
