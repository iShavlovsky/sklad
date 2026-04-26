import { z } from 'zod';

import { recordCodeInputSchema } from '@/domain/codes/record-code.input.ts';

const createDepartureDirectoryInputSchema = z.object({
  id: z.string().trim().min(1).nullable(),
  name: z.string().trim().min(1).nullable(),
  createIfMissing: z.boolean(),
});

const moneyValueSchema = z.object({
  amount: z.number().nullable(),
  currency: z.string().trim().min(1).nullable(),
});

export const createDepartureInputSchema = z.object({
  title: z.string().trim().min(1),
  subjectKind: z.enum([
    'product',
    'money',
    'salary',
    'cashback',
    'payment',
    'other',
  ]),
  description: z.string().trim().nullable(),
  occurredAt: z.string().trim().min(1),

  money: moneyValueSchema,
  note: z.string().trim().nullable(),
  direction: z.string().trim().nullable(),

  supplier: createDepartureDirectoryInputSchema,
  product: createDepartureDirectoryInputSchema,
  category: createDepartureDirectoryInputSchema,

  mode: z.enum(['profit', 'loss']),
  basedOnArrivalId: z.string().trim().min(1).nullable(),

  codes: z.array(recordCodeInputSchema),

  originDraftId: z.string().trim().min(1).nullable(),
});

export type CreateDepartureInputSchema = z.infer<
  typeof createDepartureInputSchema
>;
