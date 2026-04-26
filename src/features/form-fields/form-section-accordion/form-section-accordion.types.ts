import type { PropsWithChildren, ReactNode } from 'react';

import type { FormInfoContentKey } from '../field-metadata/field-info-content.ts';

export interface FormSectionAccordionProps extends PropsWithChildren {
  helpKey?: FormInfoContentKey;
  title: ReactNode;
  value: string;
}
