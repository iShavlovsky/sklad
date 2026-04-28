import { describe, expect, it } from 'vitest';

import type { ArrivalDetails } from '../../../../../src/domain/queries/arrival/arrival-details.query.ts';
import {
  applyLinkedArrivalToDraftValues,
  createEmptyDraftValues,
} from '../../../../../src/features/drafts/editor/form/model/draft-editor.form-mappers.ts';

describe('draft-editor.form-mappers', () => {
  it('applies linked arrival data without overwriting draft-local departure fields', () => {
    const current = {
      ...createEmptyDraftValues(),
      basedOnArrivalId: 'arrival-1',
      codeKind: 'vendor' as const,
      codes: 'DRAFT-LOCAL-001',
      currency: 'USD',
      departureMode: 'profit' as const,
      direction: 'warehouse',
      kind: 'departure' as const,
      linkUrl: 'https://example.test/local',
      note: 'local note',
      occurredAt: '2026-04-21T12:30:00.000Z',
    };
    const details: ArrivalDetails = {
      arrival: {
        amount: 2500,
        categoryId: 'category-1',
        categoryName: 'Category',
        createdAt: '2026-04-20T09:00:00.000Z',
        currency: 'EUR',
        description: 'Arrival description',
        id: 'arrival-1',
        kind: 'arrival',
        linkUrl: null,
        normalizedCategoryName: 'category',
        normalizedProductName: 'product',
        normalizedSupplierName: 'supplier',
        normalizedTitle: 'arrival title',
        note: null,
        occurredAt: '2026-04-20T09:00:00.000Z',
        originDraftId: null,
        originKind: 'manual',
        productId: 'product-1',
        productName: 'Product',
        quantity: 5,
        subjectKind: 'product',
        supplierId: 'supplier-1',
        supplierName: 'Supplier',
        title: 'Arrival title',
        totalCost: 2500,
        unitCost: 500,
        updatedAt: '2026-04-20T09:00:00.000Z',
      },
      codes: [],
    };

    expect(applyLinkedArrivalToDraftValues(current, details)).toMatchObject({
      amount: '2500',
      basedOnArrivalId: 'arrival-1',
      categoryId: 'category-1',
      categoryName: 'Category',
      codeKind: 'vendor',
      codes: 'DRAFT-LOCAL-001',
      currency: 'USD',
      departureMode: 'profit',
      description: 'Arrival description',
      direction: 'warehouse',
      kind: 'departure',
      linkUrl: 'https://example.test/local',
      note: 'local note',
      occurredAt: '2026-04-21T12:30:00.000Z',
      productId: 'product-1',
      productName: 'Product',
      subjectKind: 'product',
      supplierId: 'supplier-1',
      supplierName: 'Supplier',
      title: 'Arrival title',
    });
  });
});
