import { describe, expect, it } from 'vitest';

import type { ArrivalDetails } from '../../../../../src/domain/queries/arrival/arrival-details.query.ts';
import {
  applyLinkedArrivalToDepartureValues,
  buildCreateDepartureInput,
  createEmptyDepartureEditorValues,
} from '../../../../../src/features/departures/editor/form/model/departure-editor.form-mappers.ts';

describe('departure-form.mappers', () => {
  it('builds create input from editor values', () => {
    const values = {
      ...createEmptyDepartureEditorValues(),
      title: 'Отгрузка на доставку',
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
      title: 'Отгрузка на доставку',
      subjectKind: 'other',
      description: null,
      occurredAt: '2026-04-21T12:30:00.000Z',
      money: {
        amount: 1250.5,
        currency: 'RUB',
      },
      quantityCost: {
        quantity: null,
        totalCost: null,
        unitCost: null,
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
        currency: 'EUR',
        quantity: null,
        totalCost: 2500,
        unitCost: null,
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
        currency: 'EUR',
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

  it('appends linked arrival codes without duplicates and keeps manual code kind', () => {
    const current = {
      ...createEmptyDepartureEditorValues(),
      codeKind: 'custom' as const,
      codes: 'DEP-LOCAL-001\nARR-001',
    };
    const details: ArrivalDetails = {
      arrival: {
        id: 'arrival-1',
        kind: 'arrival',
        title: 'Поставка оборудования',
        normalizedTitle: 'поставка оборудования',
        subjectKind: 'product',
        description: null,
        amount: null,
        currency: 'RUB',
        quantity: null,
        totalCost: null,
        unitCost: null,
        occurredAt: '2026-04-20T09:00:00.000Z',
        linkUrl: null,
        note: null,
        supplierId: null,
        supplierName: null,
        normalizedSupplierName: null,
        productId: null,
        productName: null,
        normalizedProductName: null,
        categoryId: null,
        categoryName: null,
        normalizedCategoryName: null,
        originDraftId: null,
        originKind: 'manual',
        createdAt: '2026-04-20T09:00:00.000Z',
        updatedAt: '2026-04-20T09:00:00.000Z',
      },
      codes: [
        { id: 'code-1', kind: 'qr', value: 'ARR-001' },
        { id: 'code-2', kind: 'qr', value: 'ARR-002' },
      ],
    };

    const next = applyLinkedArrivalToDepartureValues(current, details);

    expect(next.codes).toBe('DEP-LOCAL-001\nARR-001\nARR-002');
    expect(next.codeKind).toBe('custom');
  });

  it('uses linked arrival code kind when empty departure codes share one kind', () => {
    const current = {
      ...createEmptyDepartureEditorValues(),
      codeKind: 'custom' as const,
      codes: '',
    };
    const details: ArrivalDetails = {
      arrival: {
        id: 'arrival-1',
        kind: 'arrival',
        title: 'Поставка оборудования',
        normalizedTitle: 'поставка оборудования',
        subjectKind: 'product',
        description: null,
        amount: null,
        currency: 'RUB',
        quantity: null,
        totalCost: null,
        unitCost: null,
        occurredAt: '2026-04-20T09:00:00.000Z',
        linkUrl: null,
        note: null,
        supplierId: null,
        supplierName: null,
        normalizedSupplierName: null,
        productId: null,
        productName: null,
        normalizedProductName: null,
        categoryId: null,
        categoryName: null,
        normalizedCategoryName: null,
        originDraftId: null,
        originKind: 'manual',
        createdAt: '2026-04-20T09:00:00.000Z',
        updatedAt: '2026-04-20T09:00:00.000Z',
      },
      codes: [
        { id: 'code-1', kind: 'vendor', value: 'ARR-001' },
        { id: 'code-2', kind: 'vendor', value: 'ARR-002' },
      ],
    };

    const next = applyLinkedArrivalToDepartureValues(current, details);

    expect(next.codes).toBe('ARR-001\nARR-002');
    expect(next.codeKind).toBe('vendor');
  });
});
