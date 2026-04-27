import { createElement, useMemo, useState } from 'react';

import type { RecordKind, SubjectKind } from '@/domain/common/record-kinds.ts';
import { useDraftList } from '@/features/drafts/data/hooks/use-draft-list.ts';
import type { CollectionFilterMenuConfig } from '@/shared/ui/collection-section/types.ts';
import { FieldToneIcon } from '@/shared/ui/field-visuals';

import {
  DRAFT_KIND_LABELS,
  DRAFT_KIND_OPTIONS,
  DRAFT_SUBJECT_KIND_LABELS,
  DRAFT_SUBJECT_KIND_OPTIONS,
} from './drafts-page-formatters.ts';

export function useDraftsPageState() {
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState<string | null>('updatedAt-desc');
  const [kind, setKind] = useState<RecordKind | null>(null);
  const [subjectKind, setSubjectKind] = useState<SubjectKind | null>(null);

  const drafts = useDraftList({
    filters: {
      kind,
      search: searchValue,
      subjectKind,
      updatedAt: { from: null, to: null },
    },
    limit: null,
    offset: 0,
    sort:
      sortValue === 'updatedAt-asc'
        ? { direction: 'asc', field: 'updatedAt' }
        : sortValue === 'createdAt-desc'
          ? { direction: 'desc', field: 'createdAt' }
          : sortValue === 'title-asc'
            ? { direction: 'asc', field: 'title' }
            : { direction: 'desc', field: 'updatedAt' },
  });

  const filterMenu = useMemo<CollectionFilterMenuConfig>(
    () => ({
      triggerLabel: 'Фильтры',
      groups: [
        {
          key: 'kind',
          label: 'Тип черновика',
          items: [
            {
              checked: kind === null,
              closeMenuOnClick: false,
              key: 'kind-all',
              label: 'Все типы',
              leftSection: createElement(FieldToneIcon, {
                field: 'draftKind',
                size: 'xs',
              }),
              onClick: () => setKind(null),
            },
            ...DRAFT_KIND_OPTIONS.map((value) => ({
              checked: kind === value,
              closeMenuOnClick: false,
              key: `kind-${value}`,
              label: DRAFT_KIND_LABELS[value],
              onClick: () => setKind(value),
            })),
          ],
        },
        {
          key: 'subject-kind',
          label: 'Тип записи',
          items: [
            {
              key: 'subject-kind-root',
              label: subjectKind
                ? DRAFT_SUBJECT_KIND_LABELS[subjectKind]
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
                ...DRAFT_SUBJECT_KIND_OPTIONS.map((value) => ({
                  checked: subjectKind === value,
                  closeMenuOnClick: false,
                  key: `subject-kind-${value}`,
                  label: DRAFT_SUBJECT_KIND_LABELS[value],
                  onClick: () => setSubjectKind(value),
                })),
              ],
            },
          ],
        },
      ],
    }),
    [kind, subjectKind]
  );

  return {
    drafts,
    filterMenu,
    searchValue,
    setSearchValue,
    sortValue,
    setSortValue,
  };
}
