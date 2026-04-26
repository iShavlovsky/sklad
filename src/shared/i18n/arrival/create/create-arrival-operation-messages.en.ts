import type { CreateArrivalOperationMessageKey } from './create-arrival-operation-message-keys';

export const CREATE_ARRIVAL_OPERATION_MESSAGES_EN: Record<
  CreateArrivalOperationMessageKey,
  string
> = {
  supplier_resolve_failed_missing_id:
    'The selected supplier could not be found.',
  supplier_resolve_failed_creation_not_confirmed:
    'Confirm creating the new supplier.',
  product_resolve_failed_missing_id: 'The selected product could not be found.',
  product_resolve_failed_creation_not_confirmed:
    'Confirm creating the new product.',
  category_resolve_failed_missing_id:
    'The selected category could not be found.',
  category_resolve_failed_creation_not_confirmed:
    'Confirm creating the new category.',
  db_write_failed: 'Could not save the arrival.',
};
