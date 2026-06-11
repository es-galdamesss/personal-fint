/**
 * Calculates budget usage statistics.
 * The system currency is fixed to CLP (integers, no decimals).
 *
 * @param totalExpenses The sum of all registered expenses for the month.
 * @param budgetAmount The defined monthly budget amount (must be > 0).
 */
export interface BudgetUsage {
  availableMoney: number;
  usagePercentage: number;
}

export function calculateBudgetUsage(totalExpenses: number, budgetAmount: number): BudgetUsage {
  // Budget amount should be positive. If <= 0 or not provided, return 0% usage and negative available money.
  if (budgetAmount <= 0) {
    return {
      availableMoney: -totalExpenses,
      usagePercentage: 0,
    };
  }

  const availableMoney = budgetAmount - totalExpenses;
  const rawPercentage = (totalExpenses / budgetAmount) * 100;
  
  // Round percentage to 2 decimal places
  const usagePercentage = Math.round(rawPercentage * 100) / 100;

  return {
    availableMoney,
    usagePercentage,
  };
}
