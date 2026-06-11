/**
 * prisma/seed.ts
 *
 * Seeds the database with the initial set of categories defined in PRODUCT.md.
 * Run with: pnpm prisma:seed
 */

import "dotenv/config";
import { PrismaClient } from "../generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
};

const INITIAL_CATEGORIES: CategorySeed[] = [
  {
    name: "Alimentación",
    slug: "food",
    description: "Gastos en comida, supermercado y restaurantes.",
    color: "#F59E0B",
    icon: "🍔",
  },
  {
    name: "Transporte",
    slug: "transport",
    description: "Gastos en transporte público, gasolina y movilidad.",
    color: "#3B82F6",
    icon: "🚌",
  },
  {
    name: "Salud",
    slug: "health",
    description: "Gastos en medicamentos, médicos y bienestar.",
    color: "#10B981",
    icon: "🏥",
  },
  {
    name: "Servicios",
    slug: "services",
    description: "Gastos en servicios básicos como agua, luz e internet.",
    color: "#8B5CF6",
    icon: "⚡",
  },
  {
    name: "Educación",
    slug: "education",
    description: "Gastos en cursos, libros y formación.",
    color: "#6366F1",
    icon: "📚",
  },
  {
    name: "Ocio",
    slug: "leisure",
    description:
      "Gastos en entretenimiento, streaming y actividades recreativas.",
    color: "#EC4899",
    icon: "🎮",
  },
  {
    name: "Hogar",
    slug: "home",
    description: "Gastos en arriendo, reparaciones y artículos del hogar.",
    color: "#14B8A6",
    icon: "🏠",
  },
  {
    name: "Otros",
    slug: "other",
    description: "Gastos varios no clasificados.",
    color: "#6B7280",
    icon: "📦",
  },
];

async function main(): Promise<void> {
  console.log("🌱  Seeding categories...");

  for (const category of INITIAL_CATEGORIES) {
    const result = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        icon: category.icon,
        isActive: true,
      },
    });

    console.log(`  ✔  ${result.slug} → ${result.name} (id: ${result.id})`);
  }

  console.log(
    `\n✅  Seeded ${INITIAL_CATEGORIES.length} categories successfully.`
  );
}

main()
  .catch((error) => {
    console.error("❌  Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
