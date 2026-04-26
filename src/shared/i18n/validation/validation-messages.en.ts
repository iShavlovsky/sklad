import type { ValidationMessageKey } from './validation-message-keys';

export const VALIDATION_MESSAGES_EN: Record<ValidationMessageKey, string> = {
  required: 'This field is required.',
  invalid_type: 'Invalid value type.',
  invalid_string: 'Invalid string value.',
  invalid_url: 'Invalid URL.',
  invalid_format: 'Invalid format.',
  too_small: 'Value is too small.',
  too_big: 'Value is too large.',
  custom: 'Invalid value.',
  invalid_value: 'Invalid value.',
  unknown: 'Invalid data.',
};
