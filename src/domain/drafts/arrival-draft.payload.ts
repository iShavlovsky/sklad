import type { SubjectKind } from '../common/record-kinds.ts';
import type {
  DirectoryRefSnapshot,
  MoneyValue,
  QuantityCostValue,
} from '../common/value-objects';

import type { DraftCodeInput } from './draft-code.input';

export interface ArrivalDraftPayload {
  subjectKind: SubjectKind;
  title: string;
  description: string | null;
  occurredAt: string | null;
  money: MoneyValue;
  quantityCost: QuantityCostValue;
  linkUrl: string | null;
  note: string | null;
  supplier: DirectoryRefSnapshot;
  product: DirectoryRefSnapshot;
  category: DirectoryRefSnapshot;
  codes: DraftCodeInput[];
}
