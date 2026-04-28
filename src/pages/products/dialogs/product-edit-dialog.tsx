import { type ReactElement, useEffect } from 'react';
import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';

import { useUpdateProduct } from '@/features/directories/hooks/use-update-product.ts';
import { useActionFeedback } from '@/shared/ui/action-feedback';

import type { ProductsPageState } from '../lib/use-products-page-state.ts';

interface ProductEditFormValues {
  categoryId: string;
  isArchived: boolean;
  name: string;
  note: string;
  supplierId: string;
}

export function ProductEditDialog({
  state,
}: Readonly<{ state: ProductsPageState }>): ReactElement {
  const updateProduct = useUpdateProduct();
  const actionFeedback = useActionFeedback();
  const product = state.editingProduct;
  const form = useForm<ProductEditFormValues>({
    initialValues: {
      categoryId: '',
      isArchived: false,
      name: '',
      note: '',
      supplierId: '',
    },
    mode: 'uncontrolled',
    validate: {
      name: (value) =>
        value.trim() === '' ? 'Укажите название товара.' : null,
    },
  });

  useEffect(() => {
    if (!product) {
      return;
    }

    form.setValues({
      categoryId: product.categoryId ?? '',
      isArchived: product.isArchived,
      name: product.name,
      note: product.note ?? '',
      supplierId: product.supplierId ?? '',
    });
    // Mantine form object changes across renders; reset values only when a new product is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  async function handleSubmit(values: ProductEditFormValues): Promise<void> {
    if (!product) {
      return;
    }

    const result = await updateProduct.execute({
      categoryId: values.categoryId.trim() || null,
      id: product.id,
      isArchived: values.isArchived,
      name: values.name,
      note: values.note.trim() || null,
      supplierId: values.supplierId.trim() || null,
    });

    if (!result.ok) {
      const message =
        result.code === 'DUPLICATE_PRODUCT_NAME'
          ? 'Товар с таким названием уже есть.'
          : 'Не удалось сохранить товар. Попробуйте ещё раз.';
      actionFeedback.notify({ kind: 'error', message, title: 'Товар' });
      return;
    }

    actionFeedback.notify({
      kind: 'success',
      message: 'Товар сохранён.',
      title: 'Товар',
    });
    state.closeEdit();
  }

  return (
    <Modal
      centered
      onClose={state.closeEdit}
      opened={product !== null}
      title="Редактирование товара"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            key={form.key('name')}
            label="Название"
            placeholder="Название товара"
            {...form.getInputProps('name')}
          />
          <Select
            clearable
            data={state.suppliers.map((supplier) => ({
              label: supplier.name,
              value: supplier.id,
            }))}
            key={form.key('supplierId')}
            label="Поставщик"
            placeholder="Без поставщика"
            searchable
            {...form.getInputProps('supplierId')}
          />
          <Select
            clearable
            data={state.categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            key={form.key('categoryId')}
            label="Категория"
            placeholder="Без категории"
            searchable
            {...form.getInputProps('categoryId')}
          />
          <Textarea
            autosize
            key={form.key('note')}
            label="Заметка"
            minRows={2}
            placeholder="Дополнительная информация"
            {...form.getInputProps('note')}
          />
          <Switch
            key={form.key('isArchived')}
            label="Архивный товар"
            {...form.getInputProps('isArchived', { type: 'checkbox' })}
          />
          <Group justify="flex-end">
            <Button onClick={state.closeEdit} variant="subtle">
              Отмена
            </Button>
            <Button loading={updateProduct.isPending} type="submit">
              Сохранить
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
