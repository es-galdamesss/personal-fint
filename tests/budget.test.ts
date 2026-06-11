import { describe, it, expect } from 'vitest';
import { calculateBudgetUsage } from '../domain/budget';

describe('calculateBudgetUsage', () => {
  it('should calculate available money and usage percentage correctly when under budget', () => {
    const result = calculateBudgetUsage(30000, 100000);
    expect(result.availableMoney).toBe(70000);
    expect(result.usagePercentage).toBe(30);
  });

  it('should handle exact budget usage (100%)', () => {
    const result = calculateBudgetUsage(100000, 100000);
    expect(result.availableMoney).toBe(0);
    expect(result.usagePercentage).toBe(100);
  });

  it('should calculate negative available money and usage > 100% when over budget', () => {
    const result = calculateBudgetUsage(120000, 100000);
    expect(result.availableMoney).toBe(-20000);
    expect(result.usagePercentage).toBe(120);
  });

  it('should round usage percentage to two decimal places', () => {
    // 33333 / 100000 * 100 = 33.333... -> 33.33
    const result = calculateBudgetUsage(33333, 100000);
    expect(result.usagePercentage).toBe(33.33);
  });

  it('should handle budget amount <= 0 gracefully', () => {
    const resultZero = calculateBudgetUsage(5000, 0);
    expect(resultZero.availableMoney).toBe(-5000);
    expect(resultZero.usagePercentage).toBe(0);

    const resultNegative = calculateBudgetUsage(5000, -10000);
    expect(resultNegative.availableMoney).toBe(-5000);
    expect(resultNegative.usagePercentage).toBe(0);
  });

  it('should handle 0 expenses correctly', () => {
    const result = calculateBudgetUsage(0, 100000);
    expect(result.availableMoney).toBe(100000);
    expect(result.usagePercentage).toBe(0);
  });
});
