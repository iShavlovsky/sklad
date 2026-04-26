import { z } from 'zod';

import {
  draftKindSchema,
  draftPayloadSchema,
  draftTitleSchema,
} from '../draft.schema.ts';

export const updateDraftInputSchema = z.object({
  id: z.string().trim().min(1),
  kind: draftKindSchema,
  title: draftTitleSchema,
  payload: draftPayloadSchema,
});
