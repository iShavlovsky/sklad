import { getFormInfoContent } from './field-info-content.ts';
import type { FieldMetadata } from './field-metadata.types.ts';

export function hasFieldHelp(metadata: FieldMetadata): boolean {
  if (typeof metadata.helpKey === 'string') {
    return true;
  }

  return typeof metadata.help === 'string' && metadata.help.trim() !== '';
}

export function getFieldPlaceholder(
  metadata: FieldMetadata
): string | undefined {
  return metadata.placeholder;
}

export function getFieldHelpContent(
  metadata: FieldMetadata
): string | undefined {
  if (typeof metadata.helpKey === 'string') {
    return getFormInfoContent(metadata.helpKey);
  }

  return metadata.help;
}
