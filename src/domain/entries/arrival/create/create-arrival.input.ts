import type { RecordCodeInput } from '../../../codes/record-code.input.ts';
import type { SubjectKind } from '../../../common/record-kinds.ts';
import type {
  DirectoryRefSnapshot,
  MoneyValue,
  QuantityCostValue,
} from '../../../common/value-objects.ts';

export interface CreateArrivalDirectoryInput extends DirectoryRefSnapshot {
  createIfMissing: boolean;
}

export interface CreateArrivalInput {
  title: string;
  subjectKind: SubjectKind;
  description: string | null;
  occurredAt: string;

  money: MoneyValue;
  quantityCost: QuantityCostValue;
  linkUrl: string | null;
  note: string | null;

  supplier: CreateArrivalDirectoryInput;
  product: CreateArrivalDirectoryInput;
  category: CreateArrivalDirectoryInput;

  codes: RecordCodeInput[];

  originDraftId: string | null;
}
