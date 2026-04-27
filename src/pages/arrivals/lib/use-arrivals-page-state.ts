import { createElement, useMemo, useState } from 'react';

import type { SubjectKind } from '@/domain/common/record-kinds.ts';
import { useArrivalList } from '@/features/arrivals/data/hooks/use-arrival-list.ts';
import type { CollectionFilterMenuConfig } from '@/shared/ui/collection-section/types.ts';
import { FieldToneIcon } from '@/shared/ui/field-visuals';

import {
  ARRIVAL_SUBJECT_KIND_LABELS,
  ARRIVAL_SUBJECT_KIND_OPTIONS,
} from './arrivals-page-formatters.ts';

export function useArrivalsPageState() {
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState<string | null>('occurredAt-desc');
  const [hasCodes, setHasCodes] = useState<boolean | null>(null);
  const [subjectKind, setSubjectKind] = useState<SubjectKind | null>(null);

  const arrivals = useArrivalList({
    filters: {
      categoryId: null,
      createdAt: { from: null, to: null },
      hasCodes,
      occurredAt: { from: null, to: null },
      originKind: null,
      productId: null,
      search: searchValue,
      subjectKind,
      supplierId: null,
    },
    limit: null,
    offset: 0,
    sort:
      sortValue === 'occurredAt-asc'
        ? { direction: 'asc', field: 'occurredAt' }
        : sortValue === 'title-asc'
          ? { direction: 'asc', field: 'title' }
          : sortValue === 'amount-desc'
            ? { direction: 'desc', field: 'amount' }
            : { direction: 'desc', field: 'occurredAt' },
  });

  const filterMenu = useMemo<CollectionFilterMenuConfig>(
    () => ({
      triggerLabel: 'Фильтры',
      groups: [
        {
          key: 'codes',
          label: 'Коды',
          items: [
            {
              checked: hasCodes === true,
              closeMenuOnClick: false,
              key: 'has-codes',
              label: 'Только записи с кодами',
              leftSection: createElement(FieldToneIcon, {
                field: 'codes',
                size: 'xs',
              }),
              onClick: () =>
                setHasCodes((current) => (current === true ? null : true)),
            },
            {
              disabled: hasCodes === null,
              key: 'codes-reset',
              label: 'Показывать все записи',
              onClick: () => setHasCodes(null),
            },
          ],
        },
        {
          key: 'subject-kind',
          label: 'Тип записи',
          items: [
            {
              key: 'subject-kind-root',
              label: subjectKind
                ? ARRIVAL_SUBJECT_KIND_LABELS[subjectKind]
                : 'Все типы',
              leftSection: createElement(FieldToneIcon, {
                field: 'subjectKind',
                size: 'xs',
              }),
              onClick: () => undefined,
              submenu: [
                {
                  checked: subjectKind === null,
                  closeMenuOnClick: false,
                  key: 'subject-kind-all',
                  label: 'Все типы',
                  onClick: () => setSubjectKind(null),
                },
                ...ARRIVAL_SUBJECT_KIND_OPTIONS.map((value) => ({
                  checked: subjectKind === value,
                  closeMenuOnClick: false,
                  key: `subject-kind-${value}`,
                  label: ARRIVAL_SUBJECT_KIND_LABELS[value],
                  onClick: () => setSubjectKind(value),
                })),
              ],
            },
          ],
        },
      ],
    }),
    [hasCodes, subjectKind]
  );

  return {
    arrivals,
    filterMenu,
    searchValue,
    setSearchValue,
    sortValue,
    setSortValue,
  };
}
