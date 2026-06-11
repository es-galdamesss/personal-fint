import { describe, it, expect } from 'vitest';
import { calculateTrafficLight, calculateCategoryTrafficLight } from '../domain/traffic-light';

describe('traffic-light business logic', () => {
  describe('calculateTrafficLight', () => {
    it('should return GREEN for usage below 80%', () => {
      expect(calculateTrafficLight(0)).toBe('GREEN');
      expect(calculateTrafficLight(79.99)).toBe('GREEN');
    });

    it('should return YELLOW for usage from 80% to 100%', () => {
      expect(calculateTrafficLight(80)).toBe('YELLOW');
      expect(calculateTrafficLight(90)).toBe('YELLOW');
      expect(calculateTrafficLight(100)).toBe('YELLOW');
    });

    it('should return RED for usage above 100%', () => {
      expect(calculateTrafficLight(100.01)).toBe('RED');
      expect(calculateTrafficLight(150)).toBe('RED');
    });
  });

  describe('calculateCategoryTrafficLight', () => {
    it('should return NO_LIMIT if limit is null, undefined, or non-positive', () => {
      expect(calculateCategoryTrafficLight(5000, null)).toBe('NO_LIMIT');
      expect(calculateCategoryTrafficLight(5000, undefined)).toBe('NO_LIMIT');
      expect(calculateCategoryTrafficLight(5000, 0)).toBe('NO_LIMIT');
      expect(calculateCategoryTrafficLight(5000, -100)).toBe('NO_LIMIT');
    });

    it('should calculate correct status based on spending and limit', () => {
      // 5000 / 10000 * 100 = 50% -> GREEN
      expect(calculateCategoryTrafficLight(5000, 10000)).toBe('GREEN');

      // 8000 / 10000 * 100 = 80% -> YELLOW
      expect(calculateCategoryTrafficLight(8000, 10000)).toBe('YELLOW');

      // 11000 / 10000 * 100 = 110% -> RED
      expect(calculateCategoryTrafficLight(11000, 10000)).toBe('RED');
    });
  });
});
