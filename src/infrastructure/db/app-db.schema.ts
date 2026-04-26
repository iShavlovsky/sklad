export const APP_DB_NAME = 'sklad-db';
export const APP_DB_SCHEMA = {
  suppliers: 'id, normalizedName, isArchived, updatedAt',
  categories: 'id, normalizedName, isArchived, updatedAt',
  products: 'id, normalizedName, supplierId, categoryId, isArchived, updatedAt',

  arrivals: [
    'id',
    'occurredAt',
    'createdAt',
    'updatedAt',
    'normalizedTitle',
    'subjectKind',
    'supplierId',
    'productId',
    'categoryId',
    'normalizedSupplierName',
    'normalizedProductName',
    'normalizedCategoryName',
    'originDraftId',
  ].join(', '),

  departures: [
    'id',
    'occurredAt',
    'createdAt',
    'updatedAt',
    'normalizedTitle',
    'subjectKind',
    'supplierId',
    'productId',
    'categoryId',
    'normalizedSupplierName',
    'normalizedProductName',
    'normalizedCategoryName',
    'mode',
    'basedOnArrivalId',
    'originDraftId',
  ].join(', '),

  drafts: 'id, kind, normalizedTitle, createdAt, updatedAt',

  recordCodes: 'id, normalizedValue, ownerKind, ownerId, [ownerKind+ownerId]',

  settings: 'key, updatedAt',
  favorites: 'id, order, updatedAt',
  profiles: 'id, updatedAt',

  backupCheckpoints: 'id, createdAt',
  backupHistory: 'id, action, status, createdAt',
} as const;
