export interface RecurringExpense {
  id: string;
  description: string;
  defaultAmount: number;
  startDate: Date;
  chargeDay: number;
  isActive: boolean;
  categoryId: string;
  notes?: string | null;
}

export interface RecurringExpenseOverride {
  id: string;
  recurringExpenseId: string;
  year: number;
  month: number; // 1-indexed (1-12)
  status: 'AMOUNT_CHANGED' | 'CANCELLED';
  customAmount?: number | null;
}

export interface ResolvedRecurringExpense {
  recurringExpenseId: string;
  description: string;
  categoryId: string;
  notes?: string | null;
  chargeDate: Date;
  originalAmount: number;
  amount: number;
  isCancelled: boolean;
  hasOverride: boolean;
}

/**
 * Calculates the number of days in a given month of a year.
 * @param year The year (e.g. 2026)
 * @param month The month (1-indexed, e.g. 2 for February)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Calculates the exact charge date for a recurring expense in a given year/month.
 * Returns null if the target month is before the recurrence startDate.
 * Caps the charge day to the maximum number of days in the target month (e.g., day 31 becomes 30 in April, or 28/29 in February).
 *
 * @param startDate The recurrence start date.
 * @param chargeDay The day of the month the charge occurs on (1-31).
 * @param year The target year.
 * @param month The target month (1-indexed).
 */
export function calculateChargeDate(
  startDate: Date,
  chargeDay: number,
  year: number,
  month: number
): Date | null {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1; // getMonth is 0-indexed

  // If target month/year is chronologically before the startDate, it doesn't apply
  if (year < startYear || (year === startYear && month < startMonth)) {
    return null;
  }

  // Validate chargeDay range
  const validChargeDay = Math.max(1, Math.min(31, chargeDay));
  
  // Cap chargeDay to the max days of target month
  const maxDays = getDaysInMonth(year, month);
  const actualDay = Math.min(validChargeDay, maxDays);

  // Return date at midnight local time
  return new Date(year, month - 1, actualDay);
}

/**
 * Resolves the state of a recurring expense for a given year/month, taking overrides into account.
 * Returns null if the recurring expense is inactive or has not started yet.
 *
 * @param expense The recurring expense template.
 * @param overrides The list of overrides for the target month.
 * @param year The target year.
 * @param month The target month (1-indexed).
 */
export function resolveRecurringExpense(
  expense: RecurringExpense,
  overrides: RecurringExpenseOverride[],
  year: number,
  month: number
): ResolvedRecurringExpense | null {
  // If inactive, it must not generate expenses
  if (!expense.isActive) {
    return null;
  }

  // Calculate the charge date for this month
  const chargeDate = calculateChargeDate(expense.startDate, expense.chargeDay, year, month);
  if (!chargeDate) {
    return null;
  }

  // Find if there is an override for this recurring expense in the target year/month
  const override = overrides.find(
    (o) =>
      o.recurringExpenseId === expense.id &&
      o.year === year &&
      o.month === month
  );

  if (override) {
    if (override.status === 'CANCELLED') {
      return {
        recurringExpenseId: expense.id,
        description: expense.description,
        categoryId: expense.categoryId,
        notes: expense.notes,
        chargeDate,
        originalAmount: expense.defaultAmount,
        amount: 0,
        isCancelled: true,
        hasOverride: true,
      };
    } else {
      const customAmount = override.customAmount ?? expense.defaultAmount;
      return {
        recurringExpenseId: expense.id,
        description: expense.description,
        categoryId: expense.categoryId,
        notes: expense.notes,
        chargeDate,
        originalAmount: expense.defaultAmount,
        amount: customAmount > 0 ? customAmount : expense.defaultAmount,
        isCancelled: false,
        hasOverride: true,
      };
    }
  }

  // Default: no override
  return {
    recurringExpenseId: expense.id,
    description: expense.description,
    categoryId: expense.categoryId,
    notes: expense.notes,
    chargeDate,
    originalAmount: expense.defaultAmount,
    amount: expense.defaultAmount,
    isCancelled: false,
    hasOverride: false,
  };
}
