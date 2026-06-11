-- CreateEnum
CREATE TYPE "ExpenseSource" AS ENUM ('MANUAL', 'RECURRING');

-- CreateEnum
CREATE TYPE "RecurringOverrideStatus" AS ENUM ('AMOUNT_CHANGED', 'CANCELLED');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_budgets" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_limits" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "source" "ExpenseSource" NOT NULL DEFAULT 'MANUAL',
    "categoryId" TEXT NOT NULL,
    "recurringExpenseId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_expenses" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "defaultAmount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "chargeDay" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_expense_overrides" (
    "id" TEXT NOT NULL,
    "recurringExpenseId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "status" "RecurringOverrideStatus" NOT NULL,
    "customAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_expense_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_budgets_year_month_key" ON "monthly_budgets"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "category_limits_budgetId_categoryId_key" ON "category_limits"("budgetId", "categoryId");

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");

-- CreateIndex
CREATE INDEX "expenses_categoryId_idx" ON "expenses"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_recurringExpenseId_date_key" ON "expenses"("recurringExpenseId", "date");

-- CreateIndex
CREATE INDEX "recurring_expenses_categoryId_idx" ON "recurring_expenses"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_expense_overrides_recurringExpenseId_year_month_key" ON "recurring_expense_overrides"("recurringExpenseId", "year", "month");

-- AddForeignKey
ALTER TABLE "category_limits" ADD CONSTRAINT "category_limits_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "monthly_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_limits" ADD CONSTRAINT "category_limits_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recurringExpenseId_fkey" FOREIGN KEY ("recurringExpenseId") REFERENCES "recurring_expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_expenses" ADD CONSTRAINT "recurring_expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_expense_overrides" ADD CONSTRAINT "recurring_expense_overrides_recurringExpenseId_fkey" FOREIGN KEY ("recurringExpenseId") REFERENCES "recurring_expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
