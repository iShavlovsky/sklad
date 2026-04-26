import { z } from 'zod';

export const deleteDraftInputSchema = z.object({
  id: z.string().trim().min(1),
});
