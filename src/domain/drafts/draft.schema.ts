import { z } from 'zod';

import { recordCodeInputSchema } from '@/domain/codes/record-code.input.ts';

const directoryRefSnapshotSchema = z.object({
  id: z.string().trim().min(1).nullable(),
  name: z.string().trim().min(1).nullable(),
});

const moneyValueSchema = z.object({
  amount: z.number().nullable(),
  currency: z.string().trim().min(1).nullable(),
});

const draftCodeInputArraySchema = z.array(recordCodeInputSchema);

const draftBaseFieldsSchema = {
  title: z.string().trim().min(1),
};

const arrivalDraftPayloadSchema = z.object({
  subjectKind: z.enum([
    'product',
    'money',
    'salary',
    'cashback',
    'payment',
    'other',
  ]),
  title: z.string().trim().min(1),
  description: z.string().trim().nullable(),
  occurredAt: z.string().trim().min(1).nullable(),
  money: moneyValueSchema,
  linkUrl: z.string().trim().nullable(),
  note: z.string().trim().nullable(),
  supplier: directoryRefSnapshotSchema,
  product: directoryRefSnapshotSchema,
  category: directoryRefSnapshotSchema,
  codes: draftCodeInputArraySchema,
});

const departureDraftPayloadSchema = z.object({
  subjectKind: z.enum([
    'product',
    'money',
    'salary',
    'cashback',
    'payment',
    'other',
  ]),
  title: z.string().trim().min(1),
  description: z.string().trim().nullable(),
  occurredAt: z.string().trim().min(1).nullable(),
  money: moneyValueSchema,
  note: z.string().trim().nullable(),
  direction: z.string().trim().nullable(),
  supplier: directoryRefSnapshotSchema,
  product: directoryRefSnapshotSchema,
  category: directoryRefSnapshotSchema,
  mode: z.enum(['profit', 'loss']),
  basedOnArrivalId: z.string().trim().min(1).nullable(),
  codes: draftCodeInputArraySchema,
});

export const draftKindSchema = z.enum(['arrival', 'departure']);
export const draftTitleSchema = draftBaseFieldsSchema.title;
export const draftPayloadSchema = z.union([
  arrivalDraftPayloadSchema,
  departureDraftPayloadSchema,
]);
