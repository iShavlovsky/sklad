import type { DepartureMode, SubjectKind } from '../common/record-kinds.ts';
import type {
  DirectoryRefSnapshot,
  MoneyValue,
  QuantityCostValue,
} from '../common/value-objects';

import type { DraftCodeInput } from './draft-code.input';

export interface DepartureDraftPayload {
  subjectKind: SubjectKind;
  title: string;
  description: string | null;
  occurredAt: string | null;
  money: MoneyValue;
  quantityCost: QuantityCostValue;
  note: string | null;
  direction: string | null;
  supplier: DirectoryRefSnapshot;
  product: DirectoryRefSnapshot;
  category: DirectoryRefSnapshot;
  mode: DepartureMode;
  basedOnArrivalId: string | null;
  codes: DraftCodeInput[];
}
