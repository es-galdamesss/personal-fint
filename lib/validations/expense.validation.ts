import { z } from 'zod';

export const createExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().int().positive('Amount must be greater than 0'),
  date: z.string().datetime({ message: 'Valid ISO date string required' }),
  categoryId: z.string().min(1, 'Category is required'),
  notes: z.string().max(1000).nullable().optional(),
  isRecurring: z.boolean().optional().default(false),
});

export const updateExpenseSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  amount: z.number().int().positive().optional(),
  date: z.string().datetime().optional(),
  categoryId: z.string().min(1).optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const expenseFilterSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  categoryId: z.string().optional(),
  source: z.enum(['MANUAL', 'RECURRING']).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseFilterInput = z.infer<typeof expenseFilterSchema>;
