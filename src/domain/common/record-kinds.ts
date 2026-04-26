export type RecordKind = 'arrival' | 'departure';

export type SubjectKind =
  | 'product'
  | 'money'
  | 'salary'
  | 'cashback'
  | 'payment'
  | 'other';

export type DepartureMode = 'profit' | 'loss';

export type RecordOriginKind =
  | 'manual'
  | 'buffer'
  | 'draft'
  | 'linked-arrival'
  | 'prefill';

export type RecordCodeKind = 'qr' | 'barcode' | 'vendor' | 'custom';

export type RecordCodeOwnerKind = 'arrival' | 'departure' | 'draft';

export type BackupAction =
  | 'export'
  | 'import-dry-run'
  | 'import-merge'
  | 'restore';

export type BackupStatus = 'success' | 'error';
