import type {
  CreateArrivalDirectoryResolveFailure,
  CreateArrivalDirectoryResolveFailureField,
  CreateArrivalDirectoryResolveFailureReason,
} from '@/domain/entries/arrival/create/create-arrival.result.ts';

import type { CreateArrivalOperationMessageKey } from './create-arrival-operation-message-keys';
import { CREATE_ARRIVAL_OPERATION_MESSAGES_EN } from './create-arrival-operation-messages.en';
import { CREATE_ARRIVAL_OPERATION_MESSAGES_RU } from './create-arrival-operation-messages.ru';

export type ArrivalOperationLocale = 'ru' | 'en';

export type CreateArrivalOperationFailure =
  | CreateArrivalDirectoryResolveFailure
  | { ok: false; code: 'DB_WRITE_FAILED' };

const catalogs = {
  ru: CREATE_ARRIVAL_OPERATION_MESSAGES_RU,
  en: CREATE_ARRIVAL_OPERATION_MESSAGES_EN,
} as const satisfies Record<
  ArrivalOperationLocale,
  Record<CreateArrivalOperationMessageKey, string>
>;

const directoryMessageKeys: Record<
  CreateArrivalDirectoryResolveFailureField,
  Record<
    CreateArrivalDirectoryResolveFailureReason,
    CreateArrivalOperationMessageKey
  >
> = {
  supplier: {
    'missing-id': 'supplier_resolve_failed_missing_id',
    'creation-not-confirmed': 'supplier_resolve_failed_creation_not_confirmed',
  },
  product: {
    'missing-id': 'product_resolve_failed_missing_id',
    'creation-not-confirmed': 'product_resolve_failed_creation_not_confirmed',
  },
  category: {
    'missing-id': 'category_resolve_failed_missing_id',
    'creation-not-confirmed': 'category_resolve_failed_creation_not_confirmed',
  },
};

export function getCreateArrivalOperationMessageKey(
  failure: CreateArrivalOperationFailure
): CreateArrivalOperationMessageKey {
  if (failure.code === 'DB_WRITE_FAILED') {
    return 'db_write_failed';
  }

  return directoryMessageKeys[failure.field][failure.reason];
}

export function getCreateArrivalOperationMessage(
  locale: ArrivalOperationLocale,
  failure: CreateArrivalOperationFailure
): string {
  return catalogs[locale][getCreateArrivalOperationMessageKey(failure)];
}
