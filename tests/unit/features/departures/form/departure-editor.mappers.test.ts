import { describe, expect, it } from 'vitest';

import type { ArrivalDetails } from '../../../../../src/domain/queries/arrival/arrival-details.query.ts';
import {
  applyLinkedArrivalToDepartureValues,
  buildCreateDepartureInput,
  createEmptyDepartureEditorValues,
} from '../../../../../src/features/departure-editor/form/departure-editor.mappers.ts';

describe('departure-editor.mappers', () => {
  it('builds create input from editor values', () => {
    const values = {
      ...createEmptyDepartureEditorValues(),
      title: 'Расход на доставку',
      occurredAt: '2026-04-21T12:30:00.000Z',
      amount: '1250,50',
      note: '  оплата  ',
      direction: '  склад  ',
      supplier: {
        id: '',
        name: 'ООО Поставщик',
        createIfMissing: true,
      },
      codes: 'DEP-001\nDEP-002',
      codeKind: 'vendor' as const,
    };

    expect(buildCreateDepartureInput(values)).toEqual({
      title: 'Расход на доставку',
      subjectKind: 'other',
      description: null,
      occurredAt: '2026-04-21T12:30:00.000Z',
      money: {
        amount: 1250.5,
        currency: 'RUB',
      },
      note: 'оплата',
      direction: 'склад',
      supplier: {
        id: null,
        name: 'ООО Поставщик',
        createIfMissing: true,
      },
      product: {
        id: null,
        name: null,
        createIfMissing: false,
      },
      category: {
        id: null,
        name: null,
        createIfMissing: false,
      },
      mode: 'loss',
      basedOnArrivalId: null,
      codes: [
        { value: 'DEP-001', kind: 'vendor' },
        { value: 'DEP-002', kind: 'vendor' },
      ],
      originDraftId: null,
    });
  });

  it('applies linked arrival data without overwriting local codes or mode', () => {
    const current = {
      ...createEmptyDepartureEditorValues(),
      mode: 'profit' as const,
      codes: 'DEP-LOCAL-001',
      note: 'комментарий',
      direction: 'магазин',
      currency: 'EUR',
    };
    const details: ArrivalDetails = {
      arrival: {
        id: 'arrival-1',
        kind: 'arrival',
        title: 'Поставка оборудования',
        normalizedTitle: 'поставка оборудования',
        subjectKind: 'product',
        description: 'Описание прихода',
        amount: 2500,
        currency: 'RUB',
        occurredAt: '2026-04-20T09:00:00.000Z',
        linkUrl: null,
        note: null,
        supplierId: 'supplier-1',
        supplierName: 'Поставщик',
        normalizedSupplierName: 'поставщик',
        productId: 'product-1',
        productName: 'Товар',
        normalizedProductName: 'товар',
        categoryId: 'category-1',
        categoryName: 'Категория',
        normalizedCategoryName: 'категория',
        originDraftId: null,
        originKind: 'manual',
        createdAt: '2026-04-20T09:00:00.000Z',
        updatedAt: '2026-04-20T09:00:00.000Z',
      },
      codes: [],
    };

    expect(applyLinkedArrivalToDepartureValues(current, details)).toMatchObject(
      {
        title: 'Поставка оборудования',
        subjectKind: 'product',
        description: 'Описание прихода',
        amount: '2500',
        currency: 'RUB',
        supplier: {
          id: 'supplier-1',
          name: 'Поставщик',
          createIfMissing: false,
        },
        product: {
          id: 'product-1',
          name: 'Товар',
          createIfMissing: false,
        },
        category: {
          id: 'category-1',
          name: 'Категория',
          createIfMissing: false,
        },
        mode: 'profit',
        codes: 'DEP-LOCAL-001',
        note: 'комментарий',
        direction: 'магазин',
      }
    );
  });
});
