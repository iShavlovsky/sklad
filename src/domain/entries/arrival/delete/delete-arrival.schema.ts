import { z } from 'zod';

export const deleteArrivalInputSchema = z.object({
  id: z.string().trim().min(1),
});
