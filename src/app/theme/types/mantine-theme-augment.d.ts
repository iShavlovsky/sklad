import type { AppThemeOther } from '@/app/theme/types/app-theme-other';

declare module '@mantine/core' {
  export interface MantineThemeOther extends AppThemeOther {}
}
