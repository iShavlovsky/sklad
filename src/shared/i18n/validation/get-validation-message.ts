import type { ValidationMessageKey } from './validation-message-keys';
import { VALIDATION_MESSAGES_EN } from './validation-messages.en';
import { VALIDATION_MESSAGES_RU } from './validation-messages.ru';

export type ValidationLocale = 'ru' | 'en';

const catalogs = {
  ru: VALIDATION_MESSAGES_RU,
  en: VALIDATION_MESSAGES_EN,
} as const satisfies Record<
  ValidationLocale,
  Record<ValidationMessageKey, string>
>;

export function getValidationMessage(
  locale: ValidationLocale,
  key: ValidationMessageKey
): string {
  return catalogs[locale][key];
}
