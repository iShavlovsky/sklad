import type { ValidationMessageKey } from './validation-message-keys';

export const VALIDATION_MESSAGES_RU: Record<ValidationMessageKey, string> = {
  required: 'Поле обязательно.',
  invalid_type: 'Некорректный тип значения.',
  invalid_string: 'Некорректная строка.',
  invalid_url: 'Некорректный URL.',
  invalid_format: 'Некорректный формат.',
  too_small: 'Значение слишком маленькое.',
  too_big: 'Значение слишком большое.',
  custom: 'Некорректное значение.',
  invalid_value: 'Недопустимое значение.',
  unknown: 'Неизвестная ошибка.',
};
