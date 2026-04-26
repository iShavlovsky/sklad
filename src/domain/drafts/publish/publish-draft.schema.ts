import { z } from 'zod';

export const publishDraftInputSchema = z.object({
  id: z.string().trim().min(1),
  targetKind: z.enum(['arrival', 'departure']),
});
