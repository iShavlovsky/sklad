import {
  Fragment,
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Box,
  Button,
  Checkbox,
  Menu,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useSelection } from '@mantine/hooks';
import { IconAdjustmentsHorizontal, IconSearch } from '@tabler/icons-react';

import type {
  CollectionFilterMenuItem,
  CollectionFooterContext,
  CollectionRenderItemContext,
  CollectionSectionProps,
} from './types.ts';

import styles from './styles.module.css';

function buildFilterIndicator(
  item: CollectionFilterMenuItem
): ReactNode | undefined {
  if (item.leftSection) {
    return item.leftSection;
  }

  if (item.checked === undefined) {
    return undefined;
  }

  return (
    <Checkbox
      checked={item.checked}
      readOnly
      style={{ pointerEvents: 'none' }}
      tabIndex={-1}
    />
  );
}

function renderFilterItem(item: CollectionFilterMenuItem): ReactElement {
  if (item.submenu && item.submenu.length > 0) {
    return (
      <Menu.Sub key={item.key}>
        <Menu.Sub.Target>
          <Menu.Sub.Item
            disabled={item.disabled}
            leftSection={buildFilterIndicator(item)}
            rightSection={item.rightSection}
          >
            {item.label}
          </Menu.Sub.Item>
        </Menu.Sub.Target>
        <Menu.Sub.Dropdown>
          {item.submenu.map((subItem) => renderFilterItem(subItem))}
        </Menu.Sub.Dropdown>
      </Menu.Sub>
    );
  }

  return (
    <Menu.Item
      closeMenuOnClick={item.closeMenuOnClick}
      disabled={item.disabled}
      key={item.key}
      leftSection={buildFilterIndicator(item)}
      onClick={item.onClick}
      rightSection={item.rightSection}
    >
      {item.label}
    </Menu.Item>
  );
}

export function CollectionSection<TItem, TId extends string>({
  emptyState,
  filterMenu,
  footer,
  getItemId,
  items,
  listLabel,
  loading = false,
  onSearchChange,
  onSortChange,
  renderItem,
  searchPlaceholder,
  searchValue,
  selection,
  sortOptions,
  sortValue,
}: CollectionSectionProps<TItem, TId>): ReactElement {
  const selectionEnabled = selection?.enabled === true;
  const selectableIds = useMemo(
    () =>
      selectionEnabled
        ? items
            .filter((item) => selection.isItemSelectable?.(item) ?? true)
            .map((item) => getItemId(item))
        : [],
    [getItemId, items, selection, selectionEnabled]
  );
  const [selectedIds, selectionHandlers] = useSelection<TId>({
    data: selectableIds,
    defaultSelection: selection?.initialSelectedIds ?? [],
  });

  const selectableIdSet = useMemo(
    () => new Set(selectableIds),
    [selectableIds]
  );
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIdSet.has(getItemId(item))),
    [getItemId, items, selectedIdSet]
  );
  const lastReportedSelectionKeyRef = useRef<string | null>(null);
  const allVisibleSelected =
    selectableIds.length > 0 &&
    selectableIds.every((itemId) => selectedIdSet.has(itemId));
  const someVisibleSelected =
    !allVisibleSelected &&
    selectableIds.some((itemId) => selectedIdSet.has(itemId));

  useEffect(() => {
    if (!selectionEnabled && selectedIds.length > 0) {
      selectionHandlers.resetSelection();
    }
  }, [selectedIds.length, selectionEnabled, selectionHandlers]);

  useEffect(() => {
    if (!selectionEnabled) {
      return;
    }

    const nextSelection = selectedIds.filter((itemId) =>
      selectableIdSet.has(itemId)
    );

    if (nextSelection.length !== selectedIds.length) {
      selectionHandlers.setSelection(nextSelection);
    }
  }, [selectableIdSet, selectedIds, selectionEnabled, selectionHandlers]);

  useEffect(() => {
    if (!selectionEnabled) {
      if (lastReportedSelectionKeyRef.current !== '') {
        lastReportedSelectionKeyRef.current = '';
        selection?.onChange?.([], []);
      }
      return;
    }

    const selectionKey = selectedIds.join('\u0000');

    if (lastReportedSelectionKeyRef.current === selectionKey) {
      return;
    }

    lastReportedSelectionKeyRef.current = selectionKey;
    selection?.onChange?.(selectedIds, selectedItems);
  }, [selectedIds, selectedItems, selectionEnabled]);

  const footerContext: CollectionFooterContext<TItem, TId> = {
    allVisibleSelected,
    clearSelection: selectionHandlers.resetSelection,
    items,
    selectedCount: selectedIds.length,
    selectedIds,
    selectedItems,
    selectionEnabled,
    someVisibleSelected,
    toggleAllVisible: () => {
      if (!selectionEnabled) {
        return;
      }

      if (allVisibleSelected) {
        selectionHandlers.resetSelection();
        return;
      }

      selectionHandlers.setSelection(selectableIds);
    },
  };

  return (
    <Stack className={styles.root} gap="md">
      <Stack className={styles.toolbar} gap="sm">
        <TextInput
          className={styles.searchControl}
          leftSection={<IconSearch size={16} stroke={1.8} />}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder={searchPlaceholder}
          value={searchValue}
        />

        <div
          className={styles.toolbarControls}
          data-has-filter={filterMenu ? 'true' : 'false'}
          data-selection-enabled={selectionEnabled ? 'true' : 'false'}
        >
          {selectionEnabled ? (
            <Checkbox
              aria-label="Выбрать все"
              checked={allVisibleSelected}
              className={styles.selectionToggle}
              indeterminate={someVisibleSelected}
              onChange={() => footerContext.toggleAllVisible()}
            />
          ) : null}

          {filterMenu ? (
            <Menu position="bottom-start" withinPortal>
              <Menu.Target>
                <Button
                  className={styles.actionButton}
                  color="blue"
                  leftSection={
                    <IconAdjustmentsHorizontal size={16} stroke={1.8} />
                  }
                  size="xxs"
                  variant="light"
                >
                  {filterMenu.triggerLabel}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {filterMenu.groups.map((group, index) => (
                  <Fragment key={group.key}>
                    {index > 0 && <Menu.Divider />}
                    {group.label ? (
                      <Menu.Label>{group.label}</Menu.Label>
                    ) : null}
                    {group.items.map((item) => renderFilterItem(item))}
                  </Fragment>
                ))}
              </Menu.Dropdown>
            </Menu>
          ) : null}

          <Select
            aria-label="Сортировка списка"
            className={styles.sortControl}
            data={sortOptions}
            onChange={onSortChange}
            placeholder="Сортировка"
            size="xxs"
            styles={{
              dropdown: {
                padding: '0.375rem',
              },
              option: {
                borderRadius: '0.5rem',
                padding: '0.5rem 0.625rem',
              },
              options: {
                gap: '0.125rem',
              },
            }}
            value={sortValue}
          />
        </div>
      </Stack>

      <Box className={styles.listSurface}>
        <ScrollArea
          aria-label={listLabel}
          className={styles.scrollArea}
          h="100%"
          offsetScrollbars
          scrollbarSize={6}
        >
          {items.length > 0 ? (
            <Stack className={styles.listStack} gap="sm">
              {items.map((item, index) => {
                const id = getItemId(item);
                const selectable = selectionEnabled
                  ? (selection?.isItemSelectable?.(item) ?? true)
                  : false;
                const selected = selectionEnabled && selectedIdSet.has(id);
                const context: CollectionRenderItemContext<TItem, TId> = {
                  id,
                  index,
                  item,
                  selectable,
                  selected,
                  selectionEnabled,
                  toggleSelection: () => {
                    if (!selectionEnabled || !selectable) {
                      return;
                    }

                    selectionHandlers.toggle(id);
                  },
                };

                return (
                  <Fragment key={id}>{renderItem(item, context)}</Fragment>
                );
              })}
            </Stack>
          ) : (
            <Stack
              align="center"
              className={styles.emptyState}
              justify="center"
              px="sm"
              py="md"
            >
              {loading ? (
                <Text c="dimmed" size="sm">
                  Загрузка списка...
                </Text>
              ) : (
                (emptyState ?? (
                  <Text c="dimmed" size="sm">
                    Ничего не найдено.
                  </Text>
                ))
              )}
            </Stack>
          )}
        </ScrollArea>
      </Box>

      {typeof footer === 'function' ? (
        <div className={styles.footer}>{footer(footerContext)}</div>
      ) : footer ? (
        <div className={styles.footer}>{footer}</div>
      ) : null}
    </Stack>
  );
}
