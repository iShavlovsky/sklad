import { createElement, useMemo, useState } from 'react';

import type { SubjectKind } from '@/domain/common/record-kinds.ts';
import { useDepartureList } from '@/features/departures-data/hooks/use-departure-list.ts';
import { FieldToneIcon } from '@/features/form-fields/field-visuals';
import type { CollectionFilterMenuConfig } from '@/shared/ui/collection-section/types.ts';

import {
  DEPARTURE_SUBJECT_KIND_LABELS,
  DEPARTURE_SUBJECT_KIND_OPTIONS,
} from './departures-page-formatters.ts';

export function useDeparturesPageState() {
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState<string | null>('occurredAt-desc');
  const [hasCodes, setHasCodes] = useState<boolean | null>(null);
  const [subjectKind, setSubjectKind] = useState<SubjectKind | null>(null);

  const departures = useDepartureList({
    filters: {
      basedOnArrivalId: null,
      categoryId: null,
      createdAt: { from: null, to: null },
      hasCodes,
      mode: null,
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
                ? DEPARTURE_SUBJECT_KIND_LABELS[subjectKind]
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
                ...DEPARTURE_SUBJECT_KIND_OPTIONS.map((value) => ({
                  checked: subjectKind === value,
                  closeMenuOnClick: false,
                  key: `subject-kind-${value}`,
                  label: DEPARTURE_SUBJECT_KIND_LABELS[value],
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
    departures,
    filterMenu,
    searchValue,
    setSearchValue,
    sortValue,
    setSortValue,
  };
}
