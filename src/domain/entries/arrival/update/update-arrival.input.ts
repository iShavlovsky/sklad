import type { RecordCodeInput } from '../../../codes/record-code.input.ts';
import type { SubjectKind } from '../../../common/record-kinds.ts';
import type {
  MoneyValue,
  QuantityCostValue,
} from '../../../common/value-objects.ts';
import type { CreateArrivalDirectoryInput } from '../create/create-arrival.input.ts';

export interface UpdateArrivalInput {
  id: string;
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
}
