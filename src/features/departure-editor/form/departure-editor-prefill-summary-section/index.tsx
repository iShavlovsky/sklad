import type { ReactElement } from 'react';
import { Badge, Group, Stack, Text } from '@mantine/core';

import type { StockDeparturePrefill } from '@/features/stock-departure-prefill/stock-departure-prefill.ts';
import { FormSectionCard } from '@/shared/ui/form-shell';

interface DepartureEditorPrefillSummarySectionProps {
  prefill: StockDeparturePrefill;
}

export function DepartureEditorPrefillSummarySection({
  prefill,
}: Readonly<DepartureEditorPrefillSummarySectionProps>): ReactElement {
  return (
    <FormSectionCard title="Источник prefill">
      <Stack gap="sm">
        <Text c="dimmed" size="sm">
          Этот расход открыт из остатков. Начальные значения можно
          отредактировать перед созданием.
        </Text>
        <Group gap="xs" wrap="wrap">
          <Badge color="blue" variant="light">
            {prefill.title}
          </Badge>
          {prefill.supplierName ? (
            <Badge color="grape" variant="light">
              {prefill.supplierName}
            </Badge>
          ) : null}
          {prefill.productName ? (
            <Badge color="indigo" variant="light">
              {prefill.productName}
            </Badge>
          ) : null}
          {prefill.categoryName ? (
            <Badge color="gray" variant="light">
              {prefill.categoryName}
            </Badge>
          ) : null}
        </Group>
        <Group gap="xl" wrap="wrap">
          <Text size="sm">Начальное количество: {prefill.amount || '—'}</Text>
          <Text size="sm">
            Предзаполненных кодов:{' '}
            {prefill.codes === ''
              ? 0
              : prefill.codes.split(/[\n,;]/).filter(Boolean).length}
          </Text>
        </Group>
      </Stack>
    </FormSectionCard>
  );
}
