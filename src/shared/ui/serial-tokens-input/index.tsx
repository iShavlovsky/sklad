import {
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from 'react';
import {
  ActionIcon,
  CopyButton,
  Group,
  Pill,
  PillsInput,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconCheck, IconCopy, IconInfoCircle } from '@tabler/icons-react';

interface SerialTokensInputProps {
  disabled?: boolean;
  error?: ReactNode;
  onChange: (value: string) => void;
  value: string;
}

function splitSerials(raw: string): string[] {
  return raw
    .split(/[\n,;]/)
    .map((serial) => serial.trim())
    .filter(Boolean);
}

export function SerialTokensInput({
  disabled,
  error,
  onChange,
  value,
}: Readonly<SerialTokensInputProps>): ReactElement {
  const [inputValue, setInputValue] = useState('');

  const tokens = useMemo(() => splitSerials(value), [value]);

  const commit = (raw: string): void => {
    const trimmed = raw.trim();
    setInputValue('');

    if (!trimmed || tokens.includes(trimmed)) {
      return;
    }

    onChange([...tokens, trimmed].join('\n'));
  };

  const commitMany = (raws: string[]): void => {
    const next = [...tokens];

    for (const raw of raws) {
      const trimmed = raw.trim();
      if (trimmed && !next.includes(trimmed)) {
        next.push(trimmed);
      }
    }

    onChange(next.join('\n'));
    setInputValue('');
  };

  const remove = (index: number): void => {
    onChange(tokens.filter((_, tokenIndex) => tokenIndex !== index).join('\n'));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' || event.key === ',' || event.key === ';') {
      event.preventDefault();
      commit(inputValue);
      return;
    }

    if (event.key === 'Backspace' && inputValue === '' && tokens.length > 0) {
      remove(tokens.length - 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>): void => {
    const pasted = event.clipboardData.getData('text');
    const parts = pasted.split(/[\n,;]/);

    if (parts.length > 1) {
      event.preventDefault();
      commitMany([inputValue + parts[0], ...parts.slice(1)]);
    }
  };

  const handleBlur = (): void => {
    if (inputValue.trim()) {
      commit(inputValue);
    }
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between" wrap="nowrap">
        <Text fw={600} size="sm">
          Серийные коды
        </Text>
        <Group gap={4} wrap="nowrap">
          <Tooltip
            events={{ focus: true, hover: true, touch: true }}
            label="Добавляйте коды через Enter или разделители. Коды копируются в форму и не удаляются из буфера."
          >
            <ActionIcon
              aria-label="Подсказка по серийным кодам"
              size="sm"
              variant="subtle"
            >
              <IconInfoCircle size={14} />
            </ActionIcon>
          </Tooltip>
          <CopyButton timeout={1200} value={tokens.join('\n')}>
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? 'Скопировано' : 'Скопировать серийные коды'}
              >
                <ActionIcon
                  aria-label="Скопировать серийные коды"
                  color={copied ? 'teal' : 'gray'}
                  disabled={tokens.length === 0}
                  onClick={copy}
                  size="sm"
                  variant="subtle"
                >
                  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Group>

      <PillsInput error={error}>
        <Pill.Group>
          {tokens.map((token, index) => (
            <Pill
              key={token}
              onRemove={
                disabled
                  ? undefined
                  : () => {
                      remove(index);
                    }
              }
              withRemoveButton={!disabled}
            >
              {token}
            </Pill>
          ))}
          <PillsInput.Field
            disabled={disabled}
            onBlur={handleBlur}
            onChange={(event) => setInputValue(event.currentTarget.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              tokens.length === 0 ? 'Введите серийный код' : undefined
            }
            value={inputValue}
          />
        </Pill.Group>
      </PillsInput>
    </Stack>
  );
}
