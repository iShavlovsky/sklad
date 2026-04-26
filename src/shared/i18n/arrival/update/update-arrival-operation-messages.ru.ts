import type { UpdateArrivalOperationMessageKey } from './update-arrival-operation-message-keys';

export const UPDATE_ARRIVAL_OPERATION_MESSAGES_RU: Record<
  UpdateArrivalOperationMessageKey,
  string
> = {
  arrival_not_found: 'Не удалось найти приход.',
  db_write_failed: 'Не удалось обновить приход.',
};
