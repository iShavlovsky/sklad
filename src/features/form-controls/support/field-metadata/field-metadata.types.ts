import type { FormInfoContentKey } from './field-info-content.ts';

export interface FieldMetadata {
  help?: string;
  helpKey?: FormInfoContentKey;
  label: string;
  placeholder?: string;
  required?: boolean;
  sectionHint?: string;
}
