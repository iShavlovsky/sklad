import type { CreateArrivalDirectoryResolveFailure } from '@/domain/entries/arrival/create/create-arrival.result.ts';
import type { UpdateArrivalNotFoundFailure } from '@/domain/entries/arrival/update/update-arrival.result.ts';

import { getCreateArrivalOperationMessage } from '../create/get-create-arrival-operation-message';

import type { UpdateArrivalOperationMessageKey } from './update-arrival-operation-message-keys';
import { UPDATE_ARRIVAL_OPERATION_MESSAGES_EN } from './update-arrival-operation-messages.en';
import { UPDATE_ARRIVAL_OPERATION_MESSAGES_RU } from './update-arrival-operation-messages.ru';

export type UpdateArrivalOperationLocale = 'ru' | 'en';

export type UpdateArrivalOperationFailure =
  | CreateArrivalDirectoryResolveFailure
  | UpdateArrivalNotFoundFailure
  | { ok: false; code: 'DB_WRITE_FAILED' };

const catalogs = {
  ru: UPDATE_ARRIVAL_OPERATION_MESSAGES_RU,
  en: UPDATE_ARRIVAL_OPERATION_MESSAGES_EN,
} as const satisfies Record<
  UpdateArrivalOperationLocale,
  Record<UpdateArrivalOperationMessageKey, string>
>;

export function getUpdateArrivalOperationMessageKey(
  failure: UpdateArrivalOperationFailure
): UpdateArrivalOperationMessageKey {
  if (failure.code === 'ARRIVAL_NOT_FOUND') return 'arrival_not_found';
  if (failure.code === 'DB_WRITE_FAILED') return 'db_write_failed';

  return 'db_write_failed';
}

export function getUpdateArrivalOperationMessage(
  locale: UpdateArrivalOperationLocale,
  failure: UpdateArrivalOperationFailure
): string {
  if (
    failure.code === 'SUPPLIER_RESOLVE_FAILED' ||
    failure.code === 'PRODUCT_RESOLVE_FAILED' ||
    failure.code === 'CATEGORY_RESOLVE_FAILED'
  ) {
    return getCreateArrivalOperationMessage(locale, failure);
  }

  return catalogs[locale][getUpdateArrivalOperationMessageKey(failure)];
}
