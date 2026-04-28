import type { RecordCodeInput } from '../../../codes/record-code.input.ts';
import type {
  DepartureMode,
  SubjectKind,
} from '../../../common/record-kinds.ts';
import type {
  DirectoryRefSnapshot,
  MoneyValue,
  QuantityCostValue,
} from '../../../common/value-objects.ts';

export interface CreateDepartureDirectoryInput extends DirectoryRefSnapshot {
  createIfMissing: boolean;
}

export interface CreateDepartureInput {
  title: string;
  subjectKind: SubjectKind;
  description: string | null;
  occurredAt: string;

  money: MoneyValue;
  quantityCost: QuantityCostValue;
  note: string | null;
  direction: string | null;

  supplier: CreateDepartureDirectoryInput;
  product: CreateDepartureDirectoryInput;
  category: CreateDepartureDirectoryInput;

  mode: DepartureMode;
  basedOnArrivalId: string | null;

  codes: RecordCodeInput[];

  originDraftId: string | null;
}
