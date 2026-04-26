import { z } from 'zod';

import type { RecordCodeKind } from '../common/record-kinds.ts';

export interface RecordCodeInput {
  value: string;
  kind: RecordCodeKind;
}

export const recordCodeInputSchema = z.object({
  value: z.string().trim().min(1),
  kind: z.enum(['qr', 'barcode', 'vendor', 'custom']),
});
