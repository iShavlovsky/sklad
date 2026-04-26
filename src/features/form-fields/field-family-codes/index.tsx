import type { ReactElement } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Select,
  Stack,
  Tooltip,
} from '@mantine/core';

import { SerialTokensInput } from '@/shared/ui/serial-tokens-input';

import { FieldLabel } from '../field-info-trigger';
import { FieldInlineIcon } from '../field-visuals';

import {
  CODE_KIND_FIELD_METADATA,
  CODE_KIND_OPTIONS,
  CODES_FIELD_METADATA,
} from './field-family-codes.constants.ts';
import type {
  CodesFieldAction,
  CodesFieldFamilyProps,
} from './field-family-codes.types.ts';

export function CodesFieldFamily<TValues>({
  actions = [],
  codeKindPath,
  codeSummary,
  codesPath,
  form,
}: Readonly<CodesFieldFamilyProps<TValues>>): ReactElement {
  const values = form.getValues() as Record<string, string>;

  return (
    <Stack gap="sm">
      <Group justify="space-between" wrap="wrap">
        <Group gap="xs" wrap="wrap">
          <FieldLabel metadata={CODES_FIELD_METADATA} />
          {codeSummary ? (
            <Badge color="gray" variant="light">
              {codeSummary}
            </Badge>
          ) : null}
        </Group>
        {actions.length > 0 ? (
          <Group gap={6} wrap="nowrap">
            {actions.map((action) => (
              <CodeFieldActionButton action={action} key={action.label} />
            ))}
          </Group>
        ) : null}
      </Group>
      <Select
        data={CODE_KIND_OPTIONS}
        label={<FieldLabel metadata={CODE_KIND_FIELD_METADATA} />}
        leftSection={<FieldInlineIcon field="codes" />}
        onChange={(value) => {
          form.setFieldValue(codeKindPath, (value ?? 'custom') as never);
        }}
        value={values[codeKindPath] ?? 'custom'}
      />
      <SerialTokensInput
        onChange={(value) => {
          form.setFieldValue(codesPath, value as never);
        }}
        value={values[codesPath] ?? ''}
      />
    </Stack>
  );
}

function CodeFieldActionButton({
  action,
}: Readonly<{ action: CodesFieldAction }>): ReactElement {
  const Icon = action.icon;

  if (action.iconOnly) {
    return (
      <Tooltip label={action.label}>
        <ActionIcon
          aria-label={action.label}
          data-testid={action.testId}
          onClick={action.onClick}
          radius="md"
          size="xxs"
          type="button"
          variant="light"
        >
          {Icon ? <Icon size={14} stroke={1.8} /> : null}
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Button
      data-testid={action.testId}
      leftSection={Icon ? <Icon size={14} stroke={1.8} /> : undefined}
      onClick={action.onClick}
      size={action.compact ? 'xxs' : undefined}
      type="button"
      variant="default"
    >
      {action.label}
    </Button>
  );
}
