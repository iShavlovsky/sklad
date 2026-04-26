import { z } from 'zod';

import { recordCodeInputSchema } from '@/domain/codes/record-code.input.ts';

const createArrivalDirectoryInputSchema = z.object({
  id: z.string().trim().min(1).nullable(),
  name: z.string().trim().min(1).nullable(),
  createIfMissing: z.boolean(),
});

const moneyValueSchema = z.object({
  amount: z.number().nullable(),
  currency: z.string().trim().min(1).nullable(),
});

export const createArrivalInputSchema = z.object({
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
  linkUrl: z.string().trim().nullable(),
  note: z.string().trim().nullable(),

  supplier: createArrivalDirectoryInputSchema,
  product: createArrivalDirectoryInputSchema,
  category: createArrivalDirectoryInputSchema,

  codes: z.array(recordCodeInputSchema),

  originDraftId: z.string().trim().min(1).nullable(),
});

export type CreateArrivalInputSchema = z.infer<typeof createArrivalInputSchema>;
