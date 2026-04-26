import { useLiveQuery } from 'dexie-react-hooks';

import type { SupplierRecord } from '@/domain/directories/supplier.record.ts';
import type { SupplierListQuery } from '@/domain/queries/directory/supplier-list.query.ts';
import { appDb } from '@/infrastructure/db';
import { SupplierQueries } from '@/infrastructure/queries/directories/supplier.queries.ts';
import { SupplierRepository } from '@/infrastructure/repositories/directories/supplier.repository.ts';

const supplierRepository = new SupplierRepository(appDb.suppliers);
const supplierQueries = new SupplierQueries(supplierRepository);

/**
 * Live query hook for the supplier directory list.
 */
export function useSupplierList(query: SupplierListQuery): SupplierRecord[] {
  return useLiveQuery(() => supplierQueries.list(query), [query]) ?? [];
}
