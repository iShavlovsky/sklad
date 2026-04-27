import { describe, expect, it } from 'vitest';

import { getValueAtPath } from '../../../../src/features/form-fields/field-family-directory/field-family-directory.helpers.ts';

describe('getValueAtPath', () => {
  it('reads top-level and nested directory form values by dot path', () => {
    const values = {
      productName: 'Widget',
      supplier: {
        id: 'supplier-1',
        name: 'Acme',
      },
    };

    expect(getValueAtPath(values, 'productName')).toBe('Widget');
    expect(getValueAtPath(values, 'supplier.id')).toBe('supplier-1');
    expect(getValueAtPath(values, 'supplier.name')).toBe('Acme');
  });

  it('returns undefined for empty or missing paths', () => {
    const values = {
      supplier: {
        id: 'supplier-1',
      },
    };

    expect(getValueAtPath(values, undefined)).toBeUndefined();
    expect(getValueAtPath(values, '')).toBeUndefined();
    expect(getValueAtPath(values, 'supplier.name')).toBeUndefined();
  });

  it('stops safely when traversal reaches null, undefined, or primitive values', () => {
    const values = {
      category: null,
      product: {
        details: undefined,
      },
      supplier: {
        name: 'Acme',
      },
    };

    expect(getValueAtPath(values, 'category.id')).toBeUndefined();
    expect(getValueAtPath(values, 'product.details.name')).toBeUndefined();
    expect(getValueAtPath(values, 'supplier.name.value')).toBeUndefined();
  });
});
