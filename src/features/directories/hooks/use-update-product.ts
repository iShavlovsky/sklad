import { useState } from 'react';

import type {
  UpdateProductInput,
  UpdateProductResult,
} from '@/domain/directories';
import { updateProductService } from '@/infrastructure/services';

export function useUpdateProduct() {
  const [isPending, setIsPending] = useState(false);

  async function execute(
    input: UpdateProductInput
  ): Promise<UpdateProductResult> {
    setIsPending(true);
    try {
      return await updateProductService.execute(input);
    } finally {
      setIsPending(false);
    }
  }

  return { execute, isPending };
}
