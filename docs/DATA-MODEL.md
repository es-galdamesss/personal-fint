# docs/DATA_MODEL.md

## Overview

The project uses PostgreSQL as the relational database and Prisma ORM to define the data model, generate migrations, and access data from Next.js.

Prisma does not replace PostgreSQL. PostgreSQL is still the real database. Prisma defines the model in code and generates the corresponding migrations.

## Models

The Prisma schema must include:

```text
Category
MonthlyBudget
CategoryLimit
Expense
RecurringExpense
RecurringExpenseOverride
```

Enums:

```text
ExpenseSource
RecurringOverrideStatus
```

## Category

Represents expense categories.

Main fields:

* `id`
* `name`
* `slug`
* `description`
* `color`
* `icon`
* `isActive`
* `createdAt`
* `updatedAt`

Relations:

* Has many `Expense`.
* Has many `RecurringExpense`.
* Has many `CategoryLimit`.

Rules:

* `slug` must be unique.
* Do not physically delete categories with history.
* Delete by setting `isActive = false`.
* Do not store monthly limits inside `Category`.

## MonthlyBudget

Represents the general budget for one month.

Main fields:

* `id`
* `year`
* `month`
* `amount`
* `createdAt`
* `updatedAt`

Constraint:

```text
year + month must be unique.
```

Rules:

* Only one budget can exist per month/year.
* If it already exists, update it.
* `amount` must be greater than 0.
* Amounts are stored as integers in CLP.

## CategoryLimit

Represents a monthly limit for one category.

Main fields:

* `id`
* `budgetId`
* `categoryId`
* `amount`
* `createdAt`
* `updatedAt`

Relations:

* Belongs to `MonthlyBudget`.
* Belongs to `Category`.

Constraint:

```text
budgetId + categoryId must be unique.
```

Rules:

* A category cannot have two limits in the same monthly budget.
* If a budget is deleted, its limits are deleted.
* If a category becomes inactive, historical limits must remain.

## Expense

Represents a real counted expense.

Main fields:

* `id`
* `description`
* `amount`
* `date`
* `source`
* `categoryId`
* `recurringExpenseId`
* `notes`
* `createdAt`
* `updatedAt`

Relations:

* Belongs to `Category`.
* May belong to `RecurringExpense`.

`source` indicates whether the expense was manually created or generated from a recurring expense:

```text
MANUAL
RECURRING
```

Recommended constraint:

```text
recurringExpenseId + date must be unique.
```

Purpose:

* Avoid duplicate automatic charges for the same recurring expense on the same date.

## RecurringExpense

Represents the base template for a monthly recurring expense.

Main fields:

* `id`
* `description`
* `defaultAmount`
* `startDate`
* `chargeDay`
* `isActive`
* `categoryId`
* `notes`
* `createdAt`
* `updatedAt`

Relations:

* Belongs to `Category`.
* Has many `Expense`.
* Has many `RecurringExpenseOverride`.

Rules:

* `defaultAmount` must be greater than 0.
* `chargeDay` must be between 1 and 31.
* `startDate` represents the recurrence start date.
* `chargeDay` represents the monthly charge day.
* If inactive, it must not generate future expenses.

## RecurringExpenseOverride

Represents a one-month change for a recurring expense.

Possible statuses:

```text
AMOUNT_CHANGED
CANCELLED
```

Main fields:

* `id`
* `recurringExpenseId`
* `year`
* `month`
* `status`
* `customAmount`
* `createdAt`
* `updatedAt`

Constraint:

```text
recurringExpenseId + year + month must be unique.
```

Rules:

* If `status = AMOUNT_CHANGED`, `customAmount` must be greater than 0.
* If `status = CANCELLED`, `customAmount` must be null.
* An override affects only one specific month.
* It must not modify the base recurring template.

## Calculated Data

Do not store values that can be calculated from existing records.

Do not store:

* Monthly total expense
* Available money
* Usage percentage
* Traffic light status
* Monthly comparison
* Highest spending category
* Excel export result
* Visual user preferences in the MVP

Calculate these values in `domain/` or `services/`.

## Implementation Notes

Pure business logic should live in `domain/`.

Examples:

* Traffic light calculation
* Available money calculation
* Monthly comparison
* Recurring charge date calculation
* Override application
* Amount validation

Logic that interacts with Prisma should live in `services/`.

Examples:

* Create expense
* Get filtered expenses
* Create or update budget
* Update category limit
* Get monthly dashboard data
* Generate real expense from due recurring expense
