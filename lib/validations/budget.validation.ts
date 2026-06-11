import { z } from 'zod';

export const createBudgetSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  amount: z.number().int().positive('Amount must be greater than 0'),
});

export const updateBudgetSchema = z.object({
  amount: z.number().int().positive('Amount must be greater than 0'),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
