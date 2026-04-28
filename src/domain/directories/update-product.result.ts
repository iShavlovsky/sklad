import type { ProductRecord } from './product.record.ts';

export type UpdateProductResult =
  | {
      ok: true;
      record: ProductRecord;
    }
  | {
      ok: false;
      code:
        | 'VALIDATION_ERROR'
        | 'PRODUCT_NOT_FOUND'
        | 'DUPLICATE_PRODUCT_NAME'
        | 'DB_WRITE_FAILED';
    };
