import { z } from 'zod';

export const CreatorSchema = z.object({
  participantId: z.number().int().positive(),
})