import type { AppDb } from './app-db';

export function registerMigrations(db: AppDb): void {
  db.version(2)
    .stores({
      // next schema here
    })
    .upgrade(async (tx) => {
      await tx
        .table('products')
        .toCollection()
        .modify((record: Record<string, unknown>) => {
          if (
            typeof record.name === 'string' &&
            typeof record.normalizedName !== 'string'
          ) {
            record.normalizedName = record.name.trim().toLowerCase();
          }
        });
    });
}
