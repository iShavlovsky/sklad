import type { ComponentType, ReactElement } from 'react';
import { ThemeIcon } from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconBarcode,
  IconBox,
  IconCalendarTime,
  IconCalculator,
  IconCategory,
  IconCurrencyRubel,
  IconFileText,
  IconHash,
  IconLink,
  IconListCheck,
  IconMapPin,
  IconNumbers,
  IconPackage,
  IconPencil,
  IconReceipt,
  IconTag,
  IconTruckDelivery,
  IconWallet,
} from '@tabler/icons-react';

import { getAppIconProps } from '@/app/theme/iconography/tokens.ts';

type FieldIconComponent = ComponentType<{
  size?: number | string;
  stroke?: number | string;
}>;

export type FieldVisualKey =
  | 'amount'
  | 'balance'
  | 'category'
  | 'codes'
  | 'currency'
  | 'departureMode'
  | 'description'
  | 'direction'
  | 'draftKind'
  | 'kind'
  | 'linkUrl'
  | 'note'
  | 'occurredAt'
  | 'product'
  | 'quantity'
  | 'source'
  | 'subjectKind'
  | 'supplier'
  | 'title'
  | 'totalCost'
  | 'unitCost'
  | 'updatedAt';

interface FieldVisualDefinition {
  color: string;
  icon: FieldIconComponent;
  label: string;
}

const FIELD_VISUALS: Record<FieldVisualKey, FieldVisualDefinition> = {
  amount: {
    color: 'teal',
    icon: IconWallet,
    label: 'Сумма',
  },
  balance: {
    color: 'green',
    icon: IconBox,
    label: 'Остаток',
  },
  category: {
    color: 'gray',
    icon: IconCategory,
    label: 'Категория',
  },
  codes: {
    color: 'blue',
    icon: IconBarcode,
    label: 'Коды',
  },
  currency: {
    color: 'yellow',
    icon: IconCurrencyRubel,
    label: 'Валюта',
  },
  departureMode: {
    color: 'orange',
    icon: IconArrowUp,
    label: 'Режим отгрузки',
  },
  description: {
    color: 'cyan',
    icon: IconFileText,
    label: 'Описание',
  },
  direction: {
    color: 'red',
    icon: IconMapPin,
    label: 'Направление',
  },
  draftKind: {
    color: 'violet',
    icon: IconPencil,
    label: 'Тип черновика',
  },
  kind: {
    color: 'indigo',
    icon: IconTag,
    label: 'Тип',
  },
  linkUrl: {
    color: 'blue',
    icon: IconLink,
    label: 'Ссылка',
  },
  note: {
    color: 'grape',
    icon: IconListCheck,
    label: 'Заметка',
  },
  occurredAt: {
    color: 'orange',
    icon: IconCalendarTime,
    label: 'Дата события',
  },
  product: {
    color: 'indigo',
    icon: IconPackage,
    label: 'Товар',
  },
  quantity: {
    color: 'cyan',
    icon: IconNumbers,
    label: 'Количество',
  },
  source: {
    color: 'blue',
    icon: IconArrowDown,
    label: 'Источник',
  },
  subjectKind: {
    color: 'teal',
    icon: IconTag,
    label: 'Тип записи',
  },
  supplier: {
    color: 'grape',
    icon: IconTruckDelivery,
    label: 'Поставщик',
  },
  title: {
    color: 'blue',
    icon: IconHash,
    label: 'Название',
  },
  totalCost: {
    color: 'teal',
    icon: IconReceipt,
    label: 'Общая стоимость',
  },
  unitCost: {
    color: 'lime',
    icon: IconCalculator,
    label: 'Цена за единицу',
  },
  updatedAt: {
    color: 'gray',
    icon: IconCalendarTime,
    label: 'Обновлено',
  },
};

export function FieldInlineIcon({
  field,
  size = 'sm',
}: Readonly<{
  field: FieldVisualKey;
  size?: Parameters<typeof getAppIconProps>[0];
}>): ReactElement {
  const visual = FIELD_VISUALS[field];
  const Icon = visual.icon;

  return <Icon {...getAppIconProps(size)} aria-hidden />;
}

export function FieldToneIcon({
  field,
  size = 'sm',
}: Readonly<{
  field: FieldVisualKey;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}>): ReactElement {
  const visual = FIELD_VISUALS[field];
  const Icon = visual.icon;

  return (
    <ThemeIcon color={visual.color} radius="md" size={size} variant="light">
      <Icon {...getAppIconProps(size === 'xs' ? 'xs' : 'sm')} aria-hidden />
    </ThemeIcon>
  );
}
