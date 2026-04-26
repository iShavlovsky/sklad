import type { RecordCodeInput } from '@/domain/codes/record-code.input.ts';
import type { SubjectKind } from '@/domain/common/record-kinds.ts';
import type { MoneyValue } from '@/domain/common/value-objects.ts';

import type { CreateDepartureDirectoryInput } from '../create/create-departure.input.ts';

export interface UpdateDepartureInput {
  id: string;
  title: string;
  subjectKind: SubjectKind;
  description: string | null;
  occurredAt: string;

  money: MoneyValue;
  note: string | null;
  direction: string | null;

  supplier: CreateDepartureDirectoryInput;
  product: CreateDepartureDirectoryInput;
  category: CreateDepartureDirectoryInput;

  mode: 'profit' | 'loss';
  basedOnArrivalId: string | null;

  codes: RecordCodeInput[];
}
