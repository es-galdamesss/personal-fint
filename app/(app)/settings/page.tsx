"use client";

import { MonthlyBudgetSection } from "@/components/settings/monthly-budget-section";
import { CategoriesSection } from "@/components/settings/categories-section";
import { CategoryLimitsSection } from "@/components/settings/category-limits-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { AccessibilitySection } from "@/components/settings/accessibility-section";

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="mt-1 text-muted-foreground">
          Ajustes de tu presupuesto y preferencias
        </p>
      </header>

      {/* Budget & Categories — primary sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyBudgetSection />
        <CategoriesSection />
      </div>

      {/* Category Limits — full width */}
      <CategoryLimitsSection />

      {/* Visual preferences */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AppearanceSection />
        <AccessibilitySection />
      </div>
    </div>
  );
}
