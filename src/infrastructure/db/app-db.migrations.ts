import type { AppDb } from './app-db';

function normalizeQuantityCost(record: Record<string, unknown>): void {
  const amount = typeof record.amount === 'number' ? record.amount : null;
  const currency = typeof record.currency === 'string' ? record.currency : null;
  const hasCurrency = currency !== null && currency.trim() !== '';

  if (typeof record.quantity !== 'number') {
    record.quantity = !hasCurrency && amount !== null ? amount : null;
  }

  if (typeof record.totalCost !== 'number') {
    record.totalCost = hasCurrency ? amount : null;
  }

  if (typeof record.unitCost !== 'number') {
    const quantity =
      typeof record.quantity === 'number' && record.quantity > 0
        ? record.quantity
        : null;
    const totalCost =
      typeof record.totalCost === 'number' ? record.totalCost : null;

    record.unitCost =
      quantity !== null && totalCost !== null ? totalCost / quantity : null;
  }
}

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

  db.version(3)
    .stores({
      // quantity/cost fields are non-indexed record properties.
    })
    .upgrade(async (tx) => {
      await Promise.all([
        tx.table('arrivals').toCollection().modify(normalizeQuantityCost),
        tx.table('departures').toCollection().modify(normalizeQuantityCost),
      ]);
    });
}
