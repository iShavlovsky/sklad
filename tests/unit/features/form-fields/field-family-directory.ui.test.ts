import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface SelectProps {
  data?: Array<{ label: string; value: string }>;
  onChange?: (value: string | null) => void;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  value?: string | null;
}

interface TextInputProps {
  onChange?: (event: { currentTarget: { value: string } }) => void;
  value?: string;
}

interface CheckboxProps {
  checked?: boolean;
  onChange?: (event: { currentTarget: { checked: boolean } }) => void;
}

const captured = vi.hoisted(() => ({
  checkboxProps: [] as CheckboxProps[],
  selectProps: [] as SelectProps[],
  textInputProps: [] as TextInputProps[],
  useCategoryList: vi.fn(),
  useProductList: vi.fn(),
  useSupplierList: vi.fn(),
}));

vi.mock('@mantine/core', () => ({
  Box: (props: { children?: ReactNode }) => props.children ?? null,
  Checkbox: (props: CheckboxProps) => {
    captured.checkboxProps.push(props);
    return null;
  },
  Group: (props: { children?: ReactNode }) => props.children ?? null,
  Select: (props: SelectProps) => {
    captured.selectProps.push(props);
    return null;
  },
  Stack: (props: { children?: ReactNode }) => props.children ?? null,
  Text: (props: { children?: ReactNode }) => props.children ?? null,
  TextInput: (props: TextInputProps) => {
    captured.textInputProps.push(props);
    return null;
  },
}));

vi.mock('@mantine/hooks', () => ({
  useDebouncedValue: <TValue>(value: TValue): [TValue] => [value],
}));

vi.mock('@/features/directories/hooks/use-category-list.ts', () => ({
  useCategoryList: captured.useCategoryList,
}));

vi.mock('@/features/directories/hooks/use-product-list.ts', () => ({
  useProductList: captured.useProductList,
}));

vi.mock('@/features/directories/hooks/use-supplier-list.ts', () => ({
  useSupplierList: captured.useSupplierList,
}));

import { DirectoryFieldFamily } from '../../../../src/features/form-fields/field-family-directory/index.tsx';
import { formPreferencesStore } from '../../../../src/features/form-preferences/model/form-preferences.store.ts';

interface DirectoryTestValues {
  supplier: {
    createIfMissing: boolean;
    id: string;
    name: string;
  };
}

function assignValueAtPath(
  values: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const parts = path.split('.');
  const lastPart = parts.pop();

  if (lastPart === undefined) {
    return;
  }

  let target = values;
  for (const part of parts) {
    const nextTarget = target[part];
    if (
      nextTarget === null ||
      nextTarget === undefined ||
      typeof nextTarget !== 'object'
    ) {
      target[part] = {};
    }

    target = target[part] as Record<string, unknown>;
  }

  target[lastPart] = value;
}

function createForm(values: DirectoryTestValues) {
  return {
    errors: {},
    getValues: () => values,
    key: (path: string) => path,
    setFieldValue: vi.fn((path: string, value: unknown) => {
      assignValueAtPath(
        values as unknown as Record<string, unknown>,
        path,
        value
      );
    }),
  };
}

function renderSupplierDirectoryField(values: DirectoryTestValues): {
  checkbox: CheckboxProps | undefined;
  form: ReturnType<typeof createForm>;
  select: SelectProps | undefined;
  textInput: TextInputProps | undefined;
} {
  const form = createForm(values);

  renderToStaticMarkup(
    createElement(DirectoryFieldFamily<DirectoryTestValues>, {
      form: form as never,
      kind: 'supplier',
      paths: {
        createIfMissingPath: 'supplier.createIfMissing',
        idPath: 'supplier.id',
        namePath: 'supplier.name',
      },
      preferenceKey: 'arrival.supplier.createIfMissing',
    })
  );

  return {
    checkbox: captured.checkboxProps.at(-1),
    form,
    select: captured.selectProps.at(-1),
    textInput: captured.textInputProps.at(-1),
  };
}

describe('DirectoryFieldFamily UI behavior', () => {
  beforeEach(() => {
    captured.checkboxProps.length = 0;
    captured.selectProps.length = 0;
    captured.textInputProps.length = 0;
    captured.useSupplierList.mockReset();
    captured.useProductList.mockReset();
    captured.useCategoryList.mockReset();
    captured.useSupplierList.mockReturnValue([
      { id: 'supplier-1', name: 'Acme' },
      { id: 'supplier-2', name: 'Globex' },
    ]);
    captured.useProductList.mockReturnValue([]);
    captured.useCategoryList.mockReturnValue([]);
    formPreferencesStore.setState({ values: {} });
  });

  it('selecting a directory option writes the expected id and name form values', () => {
    const { form, select } = renderSupplierDirectoryField({
      supplier: {
        createIfMissing: false,
        id: '',
        name: '',
      },
    });

    select?.onChange?.('supplier-1');

    expect(form.setFieldValue).toHaveBeenNthCalledWith(
      1,
      'supplier.id',
      'supplier-1'
    );
    expect(form.setFieldValue).toHaveBeenNthCalledWith(
      2,
      'supplier.name',
      'Acme'
    );
  });

  it('manual create mode writes free-text name form values', () => {
    const { form, select, textInput } = renderSupplierDirectoryField({
      supplier: {
        createIfMissing: true,
        id: '',
        name: 'Manual supplier',
      },
    });

    textInput?.onChange?.({ currentTarget: { value: 'New supplier' } });

    expect(select).toBeUndefined();
    expect(textInput?.value).toBe('Manual supplier');
    expect(form.setFieldValue).toHaveBeenCalledWith(
      'supplier.name',
      'New supplier'
    );
  });

  it('create-if-missing toggle clears selected id and remembers preference', () => {
    const { checkbox, form } = renderSupplierDirectoryField({
      supplier: {
        createIfMissing: false,
        id: 'supplier-1',
        name: 'Acme',
      },
    });

    checkbox?.onChange?.({ currentTarget: { checked: true } });

    expect(form.setFieldValue).toHaveBeenNthCalledWith(
      1,
      'supplier.createIfMissing',
      true
    );
    expect(form.setFieldValue).toHaveBeenNthCalledWith(2, 'supplier.id', '');
    expect(
      formPreferencesStore.getState().values['arrival.supplier.createIfMissing']
    ).toBe(true);
  });

  it('passes selected name into search state and directory option loading query', () => {
    const { select } = renderSupplierDirectoryField({
      supplier: {
        createIfMissing: false,
        id: 'supplier-1',
        name: 'Acme',
      },
    });

    expect(select?.searchValue).toBe('Acme');
    expect(captured.useSupplierList).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          search: 'Acme',
        }),
      })
    );
  });
});
