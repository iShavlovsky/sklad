import type {
  RecordCodeKind,
  RecordCodeOwnerKind,
} from '../common/record-kinds.ts';

export interface RecordCodeRecord {
  id: string;
  ownerKind: RecordCodeOwnerKind;
  ownerId: string;
  value: string;
  normalizedValue: string;
  kind: RecordCodeKind;
  createdAt: string;
}
