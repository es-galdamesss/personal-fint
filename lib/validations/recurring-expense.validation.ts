import { z } from 'zod';

export const createRecurringExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  defaultAmount: z.number().int().positive('Amount must be greater than 0'),
  startDate: z.string().datetime({ message: 'Valid ISO date string required' }),
  chargeDay: z.number().int().min(1).max(31),
  categoryId: z.string().min(1, 'Category is required'),
  notes: z.string().max(1000).nullable().optional(),
});

export const updateRecurringExpenseSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  defaultAmount: z.number().int().positive().optional(),
  chargeDay: z.number().int().min(1).max(31).optional(),
  categoryId: z.string().min(1).optional(),
  notes: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createOverrideSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  status: z.enum(['AMOUNT_CHANGED', 'CANCELLED']),
  customAmount: z.number().int().positive().nullable().optional(),
}).refine(
  (data) => {
    if (data.status === 'AMOUNT_CHANGED') {
      return data.customAmount != null && data.customAmount > 0;
    }
    if (data.status === 'CANCELLED') {
      return data.customAmount === null || data.customAmount === undefined;
    }
    return true;
  },
  {
    message: 'AMOUNT_CHANGED requires customAmount > 0; CANCELLED requires customAmount to be null',
  }
);

export type CreateRecurringExpenseInput = z.infer<typeof createRecurringExpenseSchema>;
export type UpdateRecurringExpenseInput = z.infer<typeof updateRecurringExpenseSchema>;
export type CreateOverrideInput = z.infer<typeof createOverrideSchema>;
