export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
}

export interface MonthlyComparisonResult {
  currentTotal: number;
  previousTotal: number;
  absoluteDifference: number;
  percentageDifference: number | null;
  highestIncreaseCategory: {
    categoryId: string;
    categoryName: string;
    difference: number;
  } | null;
  highestDecreaseCategory: {
    categoryId: string;
    categoryName: string;
    difference: number;
  } | null;
}

/**
 * Compares expenses between the current month and the previous month.
 * Calculates total spending, differences, and identifies categories with the highest increase and decrease.
 *
 * @param currentExpenses List of category spending for the current month.
 * @param previousExpenses List of category spending for the previous month.
 */
export function calculateMonthlyComparison(
  currentExpenses: CategorySpending[],
  previousExpenses: CategorySpending[]
): MonthlyComparisonResult {
  // Sum totals
  const currentTotal = currentExpenses.reduce((sum, item) => sum + item.amount, 0);
  const previousTotal = previousExpenses.reduce((sum, item) => sum + item.amount, 0);

  const absoluteDifference = currentTotal - previousTotal;

  // Percentage difference calculation
  let percentageDifference: number | null = null;
  if (previousTotal > 0) {
    const rawPct = (absoluteDifference / previousTotal) * 100;
    percentageDifference = Math.round(rawPct * 100) / 100;
  } else {
    percentageDifference = currentTotal === 0 ? 0 : null;
  }

  // Map category spendings by categoryId for easy lookup
  const previousMap = new Map<string, CategorySpending>();
  previousExpenses.forEach((item) => previousMap.set(item.categoryId, item));

  const currentMap = new Map<string, CategorySpending>();
  currentExpenses.forEach((item) => currentMap.set(item.categoryId, item));

  // Gather all unique category IDs from both months
  const allCategoryIds = new Set([...previousMap.keys(), ...currentMap.keys()]);

  let highestIncrease: { categoryId: string; categoryName: string; difference: number } | null = null;
  let highestDecrease: { categoryId: string; categoryName: string; difference: number } | null = null;

  allCategoryIds.forEach((categoryId) => {
    const prevItem = previousMap.get(categoryId);
    const currItem = currentMap.get(categoryId);

    const prevAmount = prevItem?.amount ?? 0;
    const currAmount = currItem?.amount ?? 0;
    const difference = currAmount - prevAmount;

    const categoryName = currItem ? currItem.categoryName : prevItem!.categoryName;

    // Check for highest increase (difference > 0)
    if (difference > 0) {
      if (!highestIncrease || difference > highestIncrease.difference) {
        highestIncrease = {
          categoryId,
          categoryName,
          difference,
        };
      }
    }

    // Check for highest decrease (difference < 0, i.e., most negative difference)
    if (difference < 0) {
      if (!highestDecrease || difference < highestDecrease.difference) {
        highestDecrease = {
          categoryId,
          categoryName,
          difference,
        };
      }
    }
  });

  return {
    currentTotal,
    previousTotal,
    absoluteDifference,
    percentageDifference,
    highestIncreaseCategory: highestIncrease,
    highestDecreaseCategory: highestDecrease,
  };
}
