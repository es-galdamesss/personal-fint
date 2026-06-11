# docs/PRODUCT.md

## Product Summary

This project is a personal budgeting web application.

The user can define a monthly budget, register expenses, track budget usage, set category limits, manage recurring expenses, compare months, and export filtered expenses to Excel.

This is not a full accounting app. The correct product focus is:

```text
Personal budget control application.
```

Core logic:

```text
Monthly budget - registered expenses = available money
```

## Product Language

Use budget-oriented language:

* Monthly budget
* Used budget
* Available money
* Budget usage
* Expense history
* Category limits
* Budget status
* Budget traffic light

Avoid focusing the product on income vs expenses. Do not implement income tracking unless explicitly requested.

## Main Views

Defined routes:

```text
/dashboard
/movements
/movements/new
/settings
```

Do not create new main views without approval.

## Dashboard

Route:

```text
/dashboard
```

The dashboard should use tabs or internal sections to avoid a crowded page.

Expected tabs:

```text
Monthly Summary
Categories
Monthly Comparison
```

It should show:

* Monthly budget
* Total used
* Available money
* Budget usage percentage
* General traffic light
* Category traffic lights
* Highest spending category
* Recurring expenses or pending recurring expenses
* Comparison with previous month

## Movements

Route:

```text
/movements
```

This view represents the expense history.

It must allow:

* List registered expenses
* Filter by month
* Filter by category
* Filter by recurring/non-recurring when applicable
* Export the currently filtered list to Excel

Excel export must respect active filters. Do not export the full database when the user is viewing a filtered list.

## New Movement

Route:

```text
/movements/new
```

This view must allow registering:

* Normal expense
* Monthly recurring expense

Expected fields:

* Description
* Amount
* Date
* Category
* Optional notes
* Recurring expense checkbox

For recurring expenses, the date represents the start date and monthly charge day.

## Settings

Route:

```text
/settings
```

It must include:

* Monthly budget
* Categories
* Category limits
* Appearance
* Accessibility

Appearance and accessibility can be stored in frontend/localStorage for the MVP. They do not need to be stored in PostgreSQL.

Expected visual settings:

* Light/dark mode
* Normal/large font size
* Normal/high contrast

Do not add currency configuration. Currency is fixed: CLP.

## Monthly Budget

Rules:

* Only one budget can exist per year/month.
* If the budget already exists, update it.
* Amount must be greater than 0.
* Amount is stored as an integer in CLP.
* Do not use decimals.

## Categories

Initial categories:

```text
Food
Transport
Health
Services
Education
Leisure
Home
Other
```

Rules:

* A category must have a name.
* Duplicate categories are not allowed.
* Use a unique `slug` to avoid duplicates caused by casing, accents, or spaces.
* A category may have a color.
* A category may have an icon.
* If a category has history, do not physically delete it.
* Deleting a category means setting `isActive = false`.
* Inactive categories must not appear when creating new expenses.
* Inactive categories must still appear in historical expenses.

## Category Limits

Rules:

* Category limits are monthly.
* A limit belongs to a monthly budget.
* A limit belongs to a category.
* A category may have different limits across different months.
* Do not store the limit directly in `Category`.
* If a category has no limit for the month, show it as “no limit”.
* Do not calculate a category traffic light if there is no defined limit.

## Budget Traffic Light

Applies to both general budget and category limits.

Rule:

```text
Green: usage below 80%
Yellow: usage from 80% to 100%
Red: usage above 100%
```

Formula:

```text
usagePercentage = currentExpense / definedLimit * 100
```

## Normal Expenses

A normal expense is a real expense registered by the user.

Rules:

* Amount must be greater than 0.
* Date is required.
* Category is required.
* The expense counts immediately for its corresponding month.

## Recurring Expenses

Recurring expenses represent subscriptions or monthly payments.

Examples:

```text
Netflix
Internet
Phone plan
Gym
```

Approved rule:

```text
If the user registers a recurring expense on June 15, that expense counts as a real June expense and is shown as pending for July.
```

For the next month pending expense, the user can only:

```text
1. Change the amount
2. Cancel it
```

If the user does nothing, the system automatically registers it as a real expense on the charge date.

For the MVP, automatic charging may run when the user opens the dashboard or movement history. Do not implement cron, workers, or external schedulers unless explicitly requested.

## Monthly Comparison

The dashboard must compare the current month with the previous month.

It should calculate:

* Current month total expense
* Previous month total expense
* Absolute difference
* Percentage difference
* Category with the highest increase
* Category with the highest decrease

Do not store these values in the database. Calculate them on demand.

## Excel Export

Rules:

* Export only the visible/filtered list.
* Respect active filters.
* Include normal expenses and recurring expenses already registered as real expenses.
* If pending recurring expenses are shown, do not mix them with real expenses unless their status is clearly indicated.

Suggested columns:

```text
Date
Description
Category
Amount
Recurring
Source
Notes
```
