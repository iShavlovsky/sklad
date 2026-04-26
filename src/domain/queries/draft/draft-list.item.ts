import type {
  DepartureMode,
  RecordKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';

export type DraftListItemPayloadSummary =
  | {
      kind: 'arrival';
      subjectKind: SubjectKind;
      occurredAt: string | null;
      linkUrl: string | null;
      note: string | null;
    }
  | {
      kind: 'departure';
      subjectKind: SubjectKind;
      occurredAt: string | null;
      note: string | null;
      direction: string | null;
      mode: DepartureMode;
      basedOnArrivalId: string | null;
    };

export interface DraftListItem {
  id: string;
  kind: RecordKind;
  title: string;
  createdAt: string;
  updatedAt: string;
  hasCodes: boolean;
  payloadSummary: DraftListItemPayloadSummary;
}
