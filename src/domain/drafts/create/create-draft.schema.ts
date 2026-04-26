import { z } from 'zod';

import {
  draftKindSchema,
  draftPayloadSchema,
  draftTitleSchema,
} from '../draft.schema.ts';

export const createDraftInputSchema = z.object({
  kind: draftKindSchema,
  title: draftTitleSchema,
  payload: draftPayloadSchema,
});
