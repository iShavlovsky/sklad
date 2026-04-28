import { z } from 'zod';

import { recordCodeInputSchema } from '@/domain/codes/record-code.input.ts';

const updateDepartureDirectoryInputSchema = z.object({
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

export const updateDepartureInputSchema = z.object({
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
  note: z.string().trim().nullable(),
  direction: z.string().trim().nullable(),

  supplier: updateDepartureDirectoryInputSchema,
  product: updateDepartureDirectoryInputSchema,
  category: updateDepartureDirectoryInputSchema,

  mode: z.enum(['profit', 'loss']),
  basedOnArrivalId: z.string().trim().min(1).nullable(),

  codes: z.array(recordCodeInputSchema),
});

export type UpdateDepartureInputSchema = z.infer<
  typeof updateDepartureInputSchema
>;
