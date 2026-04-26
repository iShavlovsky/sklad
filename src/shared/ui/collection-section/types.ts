import type { ReactNode } from 'react';

export interface CollectionSortOption {
  label: string;
  value: string;
}

export interface CollectionFilterMenuItem {
  checked?: boolean;
  closeMenuOnClick?: boolean;
  disabled?: boolean;
  key: string;
  label: string;
  leftSection?: ReactNode;
  onClick: () => void;
  rightSection?: ReactNode;
  submenu?: CollectionFilterMenuItem[];
}

export interface CollectionFilterMenuGroup {
  items: CollectionFilterMenuItem[];
  key: string;
  label?: string;
}

export interface CollectionFilterMenuConfig {
  groups: CollectionFilterMenuGroup[];
  triggerLabel: string;
}

export interface CollectionSelectionConfig<TItem, TId extends string> {
  enabled: boolean;
  initialSelectedIds?: TId[];
  isItemSelectable?: (item: TItem) => boolean;
  onChange?: (selectedIds: TId[], selectedItems: TItem[]) => void;
}

export interface CollectionRenderItemContext<TItem, TId extends string> {
  id: TId;
  index: number;
  item: TItem;
  selectable: boolean;
  selected: boolean;
  selectionEnabled: boolean;
  toggleSelection: () => void;
}

export interface CollectionFooterContext<TItem, TId extends string> {
  allVisibleSelected: boolean;
  clearSelection: () => void;
  items: TItem[];
  selectedCount: number;
  selectedIds: TId[];
  selectedItems: TItem[];
  selectionEnabled: boolean;
  someVisibleSelected: boolean;
  toggleAllVisible: () => void;
}

export interface CollectionSectionProps<TItem, TId extends string> {
  emptyState?: ReactNode;
  filterMenu?: CollectionFilterMenuConfig;
  footer?:
    | ReactNode
    | ((context: CollectionFooterContext<TItem, TId>) => ReactNode);
  getItemId: (item: TItem) => TId;
  items: TItem[];
  listLabel?: string;
  loading?: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string | null) => void;
  renderItem: (
    item: TItem,
    context: CollectionRenderItemContext<TItem, TId>
  ) => ReactNode;
  searchPlaceholder: string;
  searchValue: string;
  selection?: CollectionSelectionConfig<TItem, TId>;
  sortOptions: CollectionSortOption[];
  sortValue: string | null;
}
