import { z } from 'zod';

export const createCategoryLimitSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  amount: z.number().int().positive('Amount must be greater than 0'),
});

export const updateCategoryLimitSchema = z.object({
  amount: z.number().int().positive('Amount must be greater than 0'),
});

export type CreateCategoryLimitInput = z.infer<typeof createCategoryLimitSchema>;
export type UpdateCategoryLimitInput = z.infer<typeof updateCategoryLimitSchema>;
