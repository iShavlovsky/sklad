import { Children, isValidElement, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MoneyFieldFamily } from '../../../../src/features/form-controls/money/index.tsx';

interface MoneyTestValues {
  amount: string;
  currency: string;
}

interface InputProps {
  onChange?: (value: number | string | null) => void;
  placeholder?: string;
  value?: string | number;
}

function createForm(values: MoneyTestValues) {
  return {
    errors: {},
    getInputProps: (path: keyof MoneyTestValues) => ({
      onChange: (event: { currentTarget: { value: string } }) => {
        values[path] = event.currentTarget.value;
      },
      value: values[path],
    }),
    getValues: () => values,
    key: (path: string) => path,
    setFieldValue: vi.fn(
      (
        path: keyof MoneyTestValues,
        value: MoneyTestValues[keyof MoneyTestValues]
      ) => {
        values[path] = value;
      }
    ),
  };
}

function getMoneyInputProps(values: MoneyTestValues): {
  amountInput: InputProps;
  currencyInput: InputProps;
  form: ReturnType<typeof createForm>;
} {
  const form = createForm(values);
  const element = MoneyFieldFamily<MoneyTestValues>({
    amountPath: 'amount',
    currencyPath: 'currency',
    form: form as never,
  });

  const controls = Children.toArray(
    (element as ReactElement<{ children?: ReactElement[] | ReactElement }>)
      .props.children
  ).filter(isValidElement) as Array<ReactElement<InputProps>>;

  const [amountInput, currencyInput] = controls.map((control) => control.props);

  if (amountInput === undefined || currencyInput === undefined) {
    throw new Error(
      'MoneyFieldFamily did not render amount and currency controls.'
    );
  }

  return { amountInput, currencyInput, form };
}

describe('MoneyFieldFamily', () => {
  it('renders amount and currency controls with metadata placeholders', () => {
    const { amountInput, currencyInput } = getMoneyInputProps({
      amount: '',
      currency: 'RUB',
    });

    expect(amountInput.value).toBe('');
    expect(amountInput.placeholder).toBe('0');
    expect(currencyInput.value).toBe('RUB');
    expect(currencyInput.placeholder).toBe('RUB');
  });

  it('coerces numeric amount changes into string form state', () => {
    const { amountInput, form } = getMoneyInputProps({
      amount: '',
      currency: 'RUB',
    });

    amountInput.onChange?.(1250.5);

    expect(form.setFieldValue).toHaveBeenCalledWith('amount', '1250.5');
  });

  it('coerces empty and null amount changes into empty string form state', () => {
    const { amountInput, form } = getMoneyInputProps({
      amount: '12',
      currency: 'RUB',
    });

    amountInput.onChange?.('');
    amountInput.onChange?.(null);

    expect(form.setFieldValue).toHaveBeenNthCalledWith(1, 'amount', '');
    expect(form.setFieldValue).toHaveBeenNthCalledWith(2, 'amount', '');
  });

  it('keeps currency controlled through form input props', () => {
    const values = {
      amount: '',
      currency: 'RUB',
    };
    const { currencyInput } = getMoneyInputProps(values);

    currencyInput.onChange?.({ currentTarget: { value: 'EUR' } } as never);

    expect(values.currency).toBe('EUR');
  });
});
