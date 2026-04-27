import { describe, expect, it } from 'vitest';

import type { RecordCodeRecord } from '../../../../../src/domain/codes/record-code.record.ts';
import type { ArrivalRecord } from '../../../../../src/domain/entries/arrival/arrival.record.ts';
import type { DepartureRecord } from '../../../../../src/domain/entries/departure.record.ts';
import type { StockListQuery } from '../../../../../src/domain/queries/stock/stock-list.query.ts';
import type { AppDb } from '../../../../../src/infrastructure/db/app-db.ts';
import { StockQueries } from '../../../../../src/infrastructure/queries/stock/stock.queries.ts';

const baseQuery: StockListQuery = {
  filters: {
    categoryId: null,
    inStockOnly: false,
    productId: null,
    search: '',
    subjectKind: null,
    supplierId: null,
  },
  limit: null,
  offset: 0,
  sort: {
    direction: 'asc',
    field: 'title',
  },
};

function createArrival(
  overrides: Partial<ArrivalRecord> & Pick<ArrivalRecord, 'id' | 'title'>
): ArrivalRecord {
  const { title } = overrides;

  return {
    amount: 1,
    categoryId: null,
    categoryName: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    currency: null,
    description: null,
    id: overrides.id,
    kind: 'arrival',
    linkUrl: null,
    normalizedCategoryName: null,
    normalizedProductName: null,
    normalizedSupplierName: null,
    normalizedTitle: title.toLowerCase(),
    note: null,
    occurredAt: '2026-01-01',
    originDraftId: null,
    originKind: 'manual',
    productId: null,
    productName: null,
    subjectKind: 'product',
    supplierId: null,
    supplierName: null,
    title,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createDeparture(
  overrides: Partial<DepartureRecord> & Pick<DepartureRecord, 'id' | 'title'>
): DepartureRecord {
  const { title } = overrides;

  return {
    amount: 1,
    basedOnArrivalId: null,
    categoryId: null,
    categoryName: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    currency: null,
    description: null,
    direction: null,
    id: overrides.id,
    kind: 'departure',
    mode: 'loss',
    normalizedCategoryName: null,
    normalizedProductName: null,
    normalizedSupplierName: null,
    normalizedTitle: title.toLowerCase(),
    note: null,
    occurredAt: '2026-01-01',
    originDraftId: null,
    originKind: 'manual',
    productId: null,
    productName: null,
    subjectKind: 'product',
    supplierId: null,
    supplierName: null,
    title,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createCode(
  overrides: Pick<RecordCodeRecord, 'ownerKind' | 'ownerId' | 'value'> &
    Partial<RecordCodeRecord>
): RecordCodeRecord {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    id: `${overrides.ownerKind}-${overrides.ownerId}-${overrides.value}`,
    kind: 'custom',
    normalizedValue: overrides.value.toLowerCase(),
    ...overrides,
  };
}

function createStockQueries(input: {
  arrivals?: ArrivalRecord[];
  departures?: DepartureRecord[];
  recordCodes?: RecordCodeRecord[];
}): StockQueries {
  return new StockQueries({
    arrivals: {
      toArray: async () => input.arrivals ?? [],
    },
    departures: {
      toArray: async () => input.departures ?? [],
    },
    recordCodes: {
      toArray: async () => input.recordCodes ?? [],
    },
  } as unknown as AppDb);
}

describe('StockQueries.list', () => {
  it('uses record codes as movement units before amount fallback', async () => {
    const queries = createStockQueries({
      arrivals: [
        createArrival({
          amount: 10,
          id: 'arrival-1',
          title: 'Adapter',
        }),
      ],
      departures: [
        createDeparture({
          amount: 5,
          id: 'departure-1',
          title: 'Adapter',
        }),
      ],
      recordCodes: [
        createCode({
          ownerId: 'arrival-1',
          ownerKind: 'arrival',
          value: 'A-001',
        }),
        createCode({
          ownerId: 'arrival-1',
          ownerKind: 'arrival',
          value: 'A-002',
        }),
        createCode({
          ownerId: 'departure-1',
          ownerKind: 'departure',
          value: 'A-001',
        }),
      ],
    });

    const [item] = await queries.list(baseQuery);

    expect(item).toMatchObject({
      arrivalCount: 2,
      availableCodes: ['A-002'],
      balance: 1,
      departureCount: 1,
      title: 'Adapter',
    });
  });

  it('groups movements by subject, supplier, product, and category identity', async () => {
    const queries = createStockQueries({
      arrivals: [
        createArrival({
          amount: 3,
          categoryId: 'category-tools',
          categoryName: 'Tools',
          id: 'arrival-tools-1',
          productId: 'product-drill',
          productName: 'Drill',
          supplierId: 'supplier-a',
          supplierName: 'Supplier A',
          title: 'Cordless drill',
        }),
        createArrival({
          amount: 2,
          categoryId: 'category-tools',
          categoryName: 'Tools',
          id: 'arrival-tools-2',
          productId: 'product-drill',
          productName: 'Drill',
          supplierId: 'supplier-a',
          supplierName: 'Supplier A',
          title: 'Updated drill title',
          updatedAt: '2026-01-02T00:00:00.000Z',
        }),
        createArrival({
          amount: 4,
          categoryId: 'category-office',
          categoryName: 'Office',
          id: 'arrival-office-1',
          productId: 'product-drill',
          productName: 'Drill',
          supplierId: 'supplier-a',
          supplierName: 'Supplier A',
          title: 'Office drill',
        }),
      ],
      departures: [
        createDeparture({
          amount: 1,
          categoryId: 'category-tools',
          categoryName: 'Tools',
          id: 'departure-tools-1',
          productId: 'product-drill',
          productName: 'Drill',
          supplierId: 'supplier-a',
          supplierName: 'Supplier A',
          title: 'Cordless drill out',
        }),
      ],
    });

    const rows = await queries.list({
      ...baseQuery,
      sort: {
        direction: 'desc',
        field: 'balance',
      },
    });

    expect(rows).toHaveLength(2);
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          balance: 4,
          categoryId: 'category-tools',
          title: 'Updated drill title',
        }),
        expect.objectContaining({
          balance: 4,
          categoryId: 'category-office',
          title: 'Office drill',
        }),
      ])
    );
  });

  it('applies filters, sorting, and pagination after stock projection', async () => {
    const queries = createStockQueries({
      arrivals: [
        createArrival({
          amount: 5,
          categoryId: 'category-a',
          categoryName: 'Category A',
          id: 'arrival-alpha',
          productId: 'product-alpha',
          productName: 'Alpha product',
          supplierId: 'supplier-a',
          supplierName: 'Supplier A',
          title: 'Alpha unit',
        }),
        createArrival({
          amount: 1,
          categoryId: 'category-a',
          categoryName: 'Category A',
          id: 'arrival-beta',
          productId: 'product-beta',
          productName: 'Beta product',
          supplierId: 'supplier-a',
          supplierName: 'Supplier A',
          title: 'Beta unit',
        }),
        createArrival({
          amount: 8,
          categoryId: 'category-b',
          categoryName: 'Category B',
          id: 'arrival-gamma',
          productId: 'product-gamma',
          productName: 'Gamma product',
          supplierId: 'supplier-b',
          supplierName: 'Supplier B',
          title: 'Gamma unit',
        }),
      ],
      departures: [
        createDeparture({
          amount: 1,
          categoryId: 'category-a',
          categoryName: 'Category A',
          id: 'departure-beta',
          productId: 'product-beta',
          productName: 'Beta product',
          supplierId: 'supplier-a',
          supplierName: 'Supplier A',
          title: 'Beta unit',
        }),
      ],
    });

    const rows = await queries.list({
      ...baseQuery,
      filters: {
        ...baseQuery.filters,
        categoryId: 'category-a',
        inStockOnly: true,
        search: 'product',
        supplierId: 'supplier-a',
      },
      limit: 1,
      offset: 0,
      sort: {
        direction: 'desc',
        field: 'balance',
      },
    });

    expect(rows).toEqual([
      expect.objectContaining({
        balance: 5,
        productId: 'product-alpha',
        title: 'Alpha unit',
      }),
    ]);
  });
});
