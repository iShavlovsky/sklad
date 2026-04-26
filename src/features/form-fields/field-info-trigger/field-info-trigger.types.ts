import type { ReactNode } from 'react';

import type { FormInfoContentKey } from '../field-metadata/field-info-content.ts';
import type { FieldMetadata } from '../field-metadata/field-metadata.types.ts';

export interface FieldInfoTriggerProps {
  content?: ReactNode;
  contentKey?: FormInfoContentKey;
  size?: 'xs' | 'sm';
  surface?: 'popover' | 'tooltip';
  triggerElement?: 'button' | 'span';
}

export interface FieldLabelProps {
  metadata: FieldMetadata;
}
