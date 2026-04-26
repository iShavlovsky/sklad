import type { ReactNode } from 'react';
import type { UseFormReturnType } from '@mantine/form';
import type { TablerIcon } from '@tabler/icons-react';

export interface CodesFieldAction {
  compact?: boolean;
  icon?: TablerIcon;
  iconOnly?: boolean;
  label: string;
  onClick: () => void;
  testId?: string;
}

export interface CodesFieldFamilyProps<TValues> {
  actions?: CodesFieldAction[];
  codeKindPath: string;
  codeSummary?: ReactNode;
  codesPath: string;
  form: UseFormReturnType<TValues>;
}
