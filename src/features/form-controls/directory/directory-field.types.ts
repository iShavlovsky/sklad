export type DirectoryFieldKind = 'supplier' | 'product' | 'category';

export interface DirectoryFieldOption {
  label: string;
  value: string;
}

export interface DirectoryFieldControlProps {
  createIfMissing: boolean;
  kind: DirectoryFieldKind;
  manualInputKey: string;
  onCreateIfMissingChange: (checked: boolean) => void;
  onManualNameChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSelectChange: (value: string | null) => void;
  manualNameValue: string;
  options: DirectoryFieldOption[];
  searchValue: string;
  selectedId: string;
  supportsCreateIfMissing: boolean;
}
