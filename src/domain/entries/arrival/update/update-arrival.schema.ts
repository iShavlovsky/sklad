import { z } from 'zod';

import { recordCodeInputSchema } from '@/domain/codes/record-code.input.ts';

const updateArrivalDirectoryInputSchema = z.object({
  id: z.string().trim().min(1).nullable(),
  name: z.string().trim().min(1).nullable(),
  createIfMissing: z.boolean(),
});

const moneyValueSchema = z.object({
  amount: z.number().nullable(),
  currency: z.string().trim().min(1).nullable(),
});

const quantityCostValueSchema = z.object({
  quantity: z.number().nullable(),
  totalCost: z.number().nullable(),
  unitCost: z.number().nullable(),
});

export const updateArrivalInputSchema = z.object({
  id: z.string().trim().min(1),
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
  quantityCost: quantityCostValueSchema,
  linkUrl: z.string().trim().nullable(),
  note: z.string().trim().nullable(),

  supplier: updateArrivalDirectoryInputSchema,
  product: updateArrivalDirectoryInputSchema,
  category: updateArrivalDirectoryInputSchema,

  codes: z.array(recordCodeInputSchema),
});

export type UpdateArrivalInputSchema = z.infer<typeof updateArrivalInputSchema>;
