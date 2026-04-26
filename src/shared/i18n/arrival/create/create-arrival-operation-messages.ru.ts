import type { CreateArrivalOperationMessageKey } from './create-arrival-operation-message-keys';

export const CREATE_ARRIVAL_OPERATION_MESSAGES_RU: Record<
  CreateArrivalOperationMessageKey,
  string
> = {
  supplier_resolve_failed_missing_id: 'Не удалось найти выбранного поставщика.',
  supplier_resolve_failed_creation_not_confirmed:
    'Подтвердите создание нового поставщика.',
  product_resolve_failed_missing_id: 'Не удалось найти выбранный товар.',
  product_resolve_failed_creation_not_confirmed:
    'Подтвердите создание нового товара.',
  category_resolve_failed_missing_id: 'Не удалось найти выбранную категорию.',
  category_resolve_failed_creation_not_confirmed:
    'Подтвердите создание новой категории.',
  db_write_failed: 'Не удалось сохранить приход.',
};
