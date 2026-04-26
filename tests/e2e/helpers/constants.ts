import { APP_DB_NAME as APP_INDEXED_DB_NAME } from '../../../src/infrastructure/db/app-db.schema';

/** IndexedDB database name used by the runtime Dexie app database. */
export const APP_DB_NAME = APP_INDEXED_DB_NAME;

/**
 * Default supplier names seeded by the Dexie populate hook on first DB creation.
 * These are available in every test after resetAppState().
 */
export const DEFAULT_SUPPLIER = 'Денис';
