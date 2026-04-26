import { z } from 'zod';

export const deleteDepartureInputSchema = z.object({
  id: z.string().trim().min(1),
});
