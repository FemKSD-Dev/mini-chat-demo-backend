import { z } from 'zod';

export const MessageSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  timestamp: z.string().datetime().optional()
});

export const GetMessagesQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional()
});

export type Message = z.infer<typeof MessageSchema>;
export type GetMessagesQuery = z.infer<typeof GetMessagesQuerySchema>;
