export const TABLE_NAMES = {
  suppliers: 'suppliers',
  categories: 'categories',
  products: 'products',
  arrivals: 'arrivals',
  departures: 'departures',
  drafts: 'drafts',
  recordCodes: 'recordCodes',
  settings: 'settings',
  favorites: 'favorites',
  profiles: 'profiles',
  backupCheckpoints: 'backupCheckpoints',
  backupHistory: 'backupHistory',
} as const;

export type TableName = keyof typeof TABLE_NAMES;

export const ARRIVAL_WRITE_TABLE_NAMES = [
  TABLE_NAMES.arrivals,
  TABLE_NAMES.suppliers,
  TABLE_NAMES.categories,
  TABLE_NAMES.products,
  TABLE_NAMES.recordCodes,
] as const satisfies TableName[];

export const DEPARTURE_WRITE_TABLE_NAMES = [
  TABLE_NAMES.departures,
  TABLE_NAMES.suppliers,
  TABLE_NAMES.categories,
  TABLE_NAMES.products,
  TABLE_NAMES.recordCodes,
] as const satisfies TableName[];

export const DRAFT_PUBLISH_WRITE_TABLE_NAMES = [
  TABLE_NAMES.drafts,
  TABLE_NAMES.arrivals,
  TABLE_NAMES.departures,
  TABLE_NAMES.suppliers,
  TABLE_NAMES.categories,
  TABLE_NAMES.products,
  TABLE_NAMES.recordCodes,
] as const satisfies TableName[];
