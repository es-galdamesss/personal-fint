export type TrafficLightStatus = 'GREEN' | 'YELLOW' | 'RED';
export type CategoryTrafficLightStatus = TrafficLightStatus | 'NO_LIMIT';

/**
 * Calculates the budget status traffic light based on usage percentage.
 * Green: usage below 80%
 * Yellow: usage from 80% to 100%
 * Red: usage above 100%
 *
 * @param usagePercentage The budget usage percentage.
 */
export function calculateTrafficLight(usagePercentage: number): TrafficLightStatus {
  if (usagePercentage < 80) {
    return 'GREEN';
  } else if (usagePercentage <= 100) {
    return 'YELLOW';
  } else {
    return 'RED';
  }
}

/**
 * Calculates the traffic light status for a category based on its spending and limit.
 * If a category has no limit, it returns 'NO_LIMIT'.
 *
 * @param categoryExpense The total spending for the category in the month.
 * @param categoryLimit The limit amount defined for the category (if any).
 */
export function calculateCategoryTrafficLight(
  categoryExpense: number,
  categoryLimit?: number | null
): CategoryTrafficLightStatus {
  if (categoryLimit === undefined || categoryLimit === null || categoryLimit <= 0) {
    return 'NO_LIMIT';
  }

  const usagePercentage = (categoryExpense / categoryLimit) * 100;
  return calculateTrafficLight(usagePercentage);
}
