import { describe, it, expect } from 'vitest';
import { calculateMonthlyComparison, type CategorySpending } from '../domain/monthly-comparison';

describe('calculateMonthlyComparison', () => {
  it('should compare expenses correctly and identify highest increase and decrease categories', () => {
    const currentExpenses: CategorySpending[] = [
      { categoryId: 'food', categoryName: 'Food', amount: 150000 },
      { categoryId: 'transport', categoryName: 'Transport', amount: 50000 },
    ];

    const previousExpenses: CategorySpending[] = [
      { categoryId: 'food', categoryName: 'Food', amount: 120000 },
      { categoryId: 'transport', categoryName: 'Transport', amount: 80000 },
      { categoryId: 'health', categoryName: 'Health', amount: 10000 },
    ];

    const result = calculateMonthlyComparison(currentExpenses, previousExpenses);

    expect(result.currentTotal).toBe(200000);
    expect(result.previousTotal).toBe(210000);
    expect(result.absoluteDifference).toBe(-10000);
    // (-10000 / 210000) * 100 = -4.7619... -> -4.76
    expect(result.percentageDifference).toBe(-4.76);

    // Food increased by 30000.
    expect(result.highestIncreaseCategory).toEqual({
      categoryId: 'food',
      categoryName: 'Food',
      difference: 30000,
    });

    // Transport decreased by 30000. Health decreased by 10000.
    // So Transport has the highest decrease (-30000).
    expect(result.highestDecreaseCategory).toEqual({
      categoryId: 'transport',
      categoryName: 'Transport',
      difference: -30000,
    });
  });

  it('should handle zero expenses in both months', () => {
    const result = calculateMonthlyComparison([], []);
    expect(result.currentTotal).toBe(0);
    expect(result.previousTotal).toBe(0);
    expect(result.absoluteDifference).toBe(0);
    expect(result.percentageDifference).toBe(0);
    expect(result.highestIncreaseCategory).toBeNull();
    expect(result.highestDecreaseCategory).toBeNull();
  });

  it('should return percentageDifference = null if previous total is 0 and current total is > 0', () => {
    const currentExpenses: CategorySpending[] = [
      { categoryId: 'food', categoryName: 'Food', amount: 50000 },
    ];
    const result = calculateMonthlyComparison(currentExpenses, []);
    expect(result.currentTotal).toBe(50000);
    expect(result.previousTotal).toBe(0);
    expect(result.absoluteDifference).toBe(50000);
    expect(result.percentageDifference).toBeNull();

    expect(result.highestIncreaseCategory).toEqual({
      categoryId: 'food',
      categoryName: 'Food',
      difference: 50000,
    });
    expect(result.highestDecreaseCategory).toBeNull();
  });

  it('should return null for highest increase/decrease categories if there are no changes', () => {
    const currentExpenses: CategorySpending[] = [
      { categoryId: 'food', categoryName: 'Food', amount: 50000 },
    ];
    const previousExpenses: CategorySpending[] = [
      { categoryId: 'food', categoryName: 'Food', amount: 50000 },
    ];
    const result = calculateMonthlyComparison(currentExpenses, previousExpenses);
    expect(result.absoluteDifference).toBe(0);
    expect(result.percentageDifference).toBe(0);
    expect(result.highestIncreaseCategory).toBeNull();
    expect(result.highestDecreaseCategory).toBeNull();
  });

  it('should correctly select the absolute maximum increase/decrease when multiple categories change', () => {
    const currentExpenses: CategorySpending[] = [
      { categoryId: 'leisure', categoryName: 'Leisure', amount: 20000 }, // +15000 increase (highest)
      { categoryId: 'food', categoryName: 'Food', amount: 10000 }, // +5000 increase
      { categoryId: 'transport', categoryName: 'Transport', amount: 5000 }, // -15000 decrease (highest decrease)
      { categoryId: 'health', categoryName: 'Health', amount: 12000 }, // -3000 decrease
    ];

    const previousExpenses: CategorySpending[] = [
      { categoryId: 'leisure', categoryName: 'Leisure', amount: 5000 },
      { categoryId: 'food', categoryName: 'Food', amount: 5000 },
      { categoryId: 'transport', categoryName: 'Transport', amount: 20000 },
      { categoryId: 'health', categoryName: 'Health', amount: 15000 },
    ];

    const result = calculateMonthlyComparison(currentExpenses, previousExpenses);
    
    // Leisure has the highest increase (+15000 vs Food +5000)
    expect(result.highestIncreaseCategory?.categoryId).toBe('leisure');
    expect(result.highestIncreaseCategory?.difference).toBe(15000);

    // Transport has the highest decrease (-15000 vs Health -3000)
    expect(result.highestDecreaseCategory?.categoryId).toBe('transport');
    expect(result.highestDecreaseCategory?.difference).toBe(-15000);
  });
});
