import { describe, it, expect } from 'vitest';
import {
  getDaysInMonth,
  calculateChargeDate,
  resolveRecurringExpense,
  type RecurringExpense,
  type RecurringExpenseOverride,
} from '../domain/recurring-expense';

describe('recurring-expense business logic', () => {
  describe('getDaysInMonth', () => {
    it('should return correct days in standard months', () => {
      expect(getDaysInMonth(2026, 1)).toBe(31); // Jan
      expect(getDaysInMonth(2026, 4)).toBe(30); // Apr
      expect(getDaysInMonth(2026, 12)).toBe(31); // Dec
    });

    it('should handle February leap years correctly', () => {
      expect(getDaysInMonth(2026, 2)).toBe(28); // Non-leap year
      expect(getDaysInMonth(2024, 2)).toBe(29); // Leap year
    });
  });

  describe('calculateChargeDate', () => {
    const startDate = new Date(2026, 4, 15); // June 15, 2026 (Month is 0-indexed: 4 is May, 5 is June. Wait! Let's check.)
    // In JS Date, month is 0-indexed. 0 is Jan, 1 is Feb, 2 is Mar, 3 is Apr, 4 is May, 5 is June.
    // Let's create startDate = new Date(2026, 5, 15) to mean June 15, 2026.
    const startJune15 = new Date(2026, 5, 15);

    it('should return null if target date is before start date', () => {
      // May 2026 is before June 2026
      expect(calculateChargeDate(startJune15, 15, 2026, 5)).toBeNull();
      // Year 2025 is before 2026
      expect(calculateChargeDate(startJune15, 15, 2025, 12)).toBeNull();
    });

    it('should return correct charge date if target month is same as start date', () => {
      const date = calculateChargeDate(startJune15, 15, 2026, 6);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(5); // June (0-indexed)
      expect(date?.getDate()).toBe(15);
    });

    it('should return correct charge date if target month is after start date', () => {
      const date = calculateChargeDate(startJune15, 10, 2026, 7);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(6); // July (0-indexed)
      expect(date?.getDate()).toBe(10);
    });

    it('should cap the charge day to the end of the month if charge day is larger than days in month', () => {
      // April has 30 days. Charge day 31.
      const dateApr = calculateChargeDate(startJune15, 31, 2027, 4);
      expect(dateApr?.getFullYear()).toBe(2027);
      expect(dateApr?.getMonth()).toBe(3); // April
      expect(dateApr?.getDate()).toBe(30);

      // Feb 2027 has 28 days. Charge day 31.
      const dateFeb = calculateChargeDate(startJune15, 31, 2027, 2);
      expect(dateFeb?.getDate()).toBe(28);

      // Feb 2028 has 29 days (leap year). Charge day 30.
      const dateFebLeap = calculateChargeDate(startJune15, 30, 2028, 2);
      expect(dateFebLeap?.getDate()).toBe(29);
    });
  });

  describe('resolveRecurringExpense', () => {
    const mockExpense: RecurringExpense = {
      id: 'netflix-1',
      description: 'Netflix Subscription',
      defaultAmount: 8990,
      startDate: new Date(2026, 5, 15), // June 15, 2026
      chargeDay: 15,
      isActive: true,
      categoryId: 'leisure-slug',
      notes: 'Standard Plan',
    };

    it('should return null if recurring expense is inactive', () => {
      const inactiveExpense = { ...mockExpense, isActive: false };
      const result = resolveRecurringExpense(inactiveExpense, [], 2026, 6);
      expect(result).toBeNull();
    });

    it('should return null if target month is before start date', () => {
      const result = resolveRecurringExpense(mockExpense, [], 2026, 5); // May
      expect(result).toBeNull();
    });

    it('should resolve with default amount when there are no overrides', () => {
      const result = resolveRecurringExpense(mockExpense, [], 2026, 7); // July
      expect(result).not.toBeNull();
      expect(result?.amount).toBe(8990);
      expect(result?.originalAmount).toBe(8990);
      expect(result?.isCancelled).toBe(false);
      expect(result?.hasOverride).toBe(false);
      expect(result?.chargeDate.getDate()).toBe(15);
    });

    it('should resolve with custom amount when override status is AMOUNT_CHANGED', () => {
      const overrides: RecurringExpenseOverride[] = [
        {
          id: 'ov-1',
          recurringExpenseId: 'netflix-1',
          year: 2026,
          month: 7, // July
          status: 'AMOUNT_CHANGED',
          customAmount: 9990,
        },
      ];

      const result = resolveRecurringExpense(mockExpense, overrides, 2026, 7);
      expect(result).not.toBeNull();
      expect(result?.amount).toBe(9990);
      expect(result?.originalAmount).toBe(8990);
      expect(result?.isCancelled).toBe(false);
      expect(result?.hasOverride).toBe(true);
    });

    it('should resolve with default amount if custom amount is invalid in AMOUNT_CHANGED override', () => {
      const overrides: RecurringExpenseOverride[] = [
        {
          id: 'ov-1',
          recurringExpenseId: 'netflix-1',
          year: 2026,
          month: 7,
          status: 'AMOUNT_CHANGED',
          customAmount: -100, // Invalid custom amount
        },
      ];

      const result = resolveRecurringExpense(mockExpense, overrides, 2026, 7);
      expect(result?.amount).toBe(8990);
    });

    it('should resolve with default amount if custom amount is null or undefined in AMOUNT_CHANGED override', () => {
      const overrides: RecurringExpenseOverride[] = [
        {
          id: 'ov-1-null',
          recurringExpenseId: 'netflix-1',
          year: 2026,
          month: 7,
          status: 'AMOUNT_CHANGED',
          customAmount: null,
        },
      ];

      const result = resolveRecurringExpense(mockExpense, overrides, 2026, 7);
      expect(result?.amount).toBe(8990);
    });

    it('should resolve with isCancelled = true when override status is CANCELLED', () => {
      const overrides: RecurringExpenseOverride[] = [
        {
          id: 'ov-2',
          recurringExpenseId: 'netflix-1',
          year: 2026,
          month: 7,
          status: 'CANCELLED',
          customAmount: null,
        },
      ];

      const result = resolveRecurringExpense(mockExpense, overrides, 2026, 7);
      expect(result).not.toBeNull();
      expect(result?.amount).toBe(0);
      expect(result?.isCancelled).toBe(true);
      expect(result?.hasOverride).toBe(true);
    });

    it('should ignore overrides that belong to other months or other expenses', () => {
      const overrides: RecurringExpenseOverride[] = [
        {
          id: 'ov-3',
          recurringExpenseId: 'netflix-1',
          year: 2026,
          month: 8, // Different month (August)
          status: 'CANCELLED',
        },
        {
          id: 'ov-4',
          recurringExpenseId: 'gym-2', // Different expense
          year: 2026,
          month: 7,
          status: 'AMOUNT_CHANGED',
          customAmount: 15000,
        },
      ];

      const result = resolveRecurringExpense(mockExpense, overrides, 2026, 7);
      expect(result?.amount).toBe(8990);
      expect(result?.isCancelled).toBe(false);
      expect(result?.hasOverride).toBe(false);
    });
  });
});
