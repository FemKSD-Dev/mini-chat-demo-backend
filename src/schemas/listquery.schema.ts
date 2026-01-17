import { z } from 'zod';

export const ListQuerySchema = z.object({
  limit: z
    .preprocess(val => (typeof val === 'string' ? Number(val) : val), z.number().int().min(1).max(50))
    .optional()
    .default(20),
  cursorAt: z.string().datetime().optional(),
  cursorId: z
    .preprocess(val => (typeof val === 'string' ? Number(val) : val), z.number().int().positive())
    .optional()
});