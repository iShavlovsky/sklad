import type { ReactElement } from 'react';
import {
  Alert,
  Badge,
  Button,
  Group,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { IconLink } from '@tabler/icons-react';

import type { ArrivalDetails } from '@/domain/queries/arrival/arrival-details.query.ts';
import { FormSectionCard } from '@/shared/ui/form-shell';

interface DepartureEditorLinkSectionProps {
  arrivalOptions: Array<{ label: string; value: string }>;
  linkedArrival: ArrivalDetails | null | undefined;
  selectedArrivalId: string;
  onApplyLinkedArrival?: () => void;
  onClearLinkedArrival: () => void;
  onSearchChange?: (value: string) => void;
  onSelectedArrivalChange: (value: string) => void;
}

function renderArrivalSummary(
  details: ArrivalDetails
): Array<{ label: string; value: string | null }> {
  return [
    { label: 'Название', value: details.arrival.title },
    { label: 'Дата', value: details.arrival.occurredAt },
    { label: 'Поставщик', value: details.arrival.supplierName },
    { label: 'Товар', value: details.arrival.productName },
    { label: 'Категория', value: details.arrival.categoryName },
  ];
}

export function DepartureEditorLinkSection({
  arrivalOptions,
  linkedArrival,
  selectedArrivalId,
  onApplyLinkedArrival,
  onClearLinkedArrival,
  onSearchChange,
  onSelectedArrivalChange,
}: Readonly<DepartureEditorLinkSectionProps>): ReactElement {
  return (
    <FormSectionCard
      description="Связь с приходом остаётся опциональной и служит только источником контекста или быстрого prefill."
      title="Источник / связь"
    >
      <Stack gap="sm">
        <Select
          clearable
          data={arrivalOptions}
          data-testid="departure-linked-arrival-select"
          label="Связанный приход"
          nothingFoundMessage="Приходы не найдены"
          onSearchChange={onSearchChange}
          onChange={(value) => {
            onSelectedArrivalChange(value ?? '');
          }}
          placeholder="Найдите и выберите приход"
          searchable
          value={selectedArrivalId === '' ? null : selectedArrivalId}
        />

        {linkedArrival ? (
          <Alert
            color="teal"
            data-testid="departure-linked-arrival-preview"
            icon={<IconLink size={16} stroke={1.8} />}
            variant="light"
          >
            <Stack gap="xs">
              <Group gap="xs" wrap="wrap">
                <Badge color="teal" variant="light">
                  Связанный приход
                </Badge>
                <Badge color="gray" variant="light">
                  {linkedArrival.arrival.subjectKind}
                </Badge>
              </Group>
              {renderArrivalSummary(linkedArrival).map((item) =>
                item.value ? (
                  <Text key={item.label} size="sm">
                    <strong>{item.label}:</strong> {item.value}
                  </Text>
                ) : null
              )}
              <Group wrap="wrap">
                {onApplyLinkedArrival ? (
                  <Button
                    onClick={onApplyLinkedArrival}
                    size="xs"
                    type="button"
                    variant="default"
                  >
                    Подставить данные
                  </Button>
                ) : null}
                <Button
                  color="gray"
                  onClick={onClearLinkedArrival}
                  size="xs"
                  type="button"
                  variant="subtle"
                >
                  Очистить связь
                </Button>
              </Group>
            </Stack>
          </Alert>
        ) : null}
      </Stack>
    </FormSectionCard>
  );
}
