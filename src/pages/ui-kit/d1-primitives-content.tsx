import type { ReactElement } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconEye,
  IconFilter,
  IconLock,
  IconMinus,
  IconPlus,
  IconSearch,
  IconSettings,
  IconX,
} from '@tabler/icons-react';

import { PageSection } from '@/shared/ui/page-section';

const buttonVariants = [
  { label: 'Filled', variant: 'filled' as const },
  { label: 'Light', variant: 'light' as const },
  { label: 'Default', variant: 'default' as const },
  { label: 'Outline', variant: 'outline' as const },
  { label: 'Subtle', variant: 'subtle' as const },
] as const;

const buttonSizes = ['xxxs', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

const actionIconVariants = [
  { label: 'Light', variant: 'light' as const, icon: IconSearch },
  { label: 'Default', variant: 'default' as const, icon: IconFilter },
  { label: 'Filled', variant: 'filled' as const, icon: IconPlus },
  { label: 'Outline', variant: 'outline' as const, icon: IconSettings },
  { label: 'Subtle', variant: 'subtle' as const, icon: IconEye },
] as const;

const actionIconSizes = ['xxxs', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

const successInputStyles = {
  input: {
    backgroundColor:
      'color-mix(in srgb, var(--sl-surface-input) 90%, var(--sl-app-success))',
    borderColor: 'var(--sl-app-success)',
  },
  section: {
    color: 'var(--sl-app-success)',
  },
} as const;

const warningInputStyles = {
  input: {
    backgroundColor:
      'color-mix(in srgb, var(--sl-surface-input) 90%, var(--sl-app-warning))',
    borderColor: 'var(--sl-app-warning)',
  },
  section: {
    color: 'var(--sl-app-warning)',
  },
} as const;

function ButtonsCard(): ReactElement {
  return (
    <PageSection
      description="Варианты, размеры, цветовые состояния и transitions для Button должны приходить из theme.components."
      title="1. Button"
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Text fw={700} size="sm">
            1.1 Варианты
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing="sm">
            {buttonVariants.map((item) => (
              <Button
                data-d1-button-variant={item.variant}
                key={item.variant}
                leftSection={<IconPlus size={16} />}
                variant={item.variant}
              >
                {item.label}
              </Button>
            ))}
          </SimpleGrid>
        </Stack>

        <Stack gap="sm">
          <Text fw={700} size="sm">
            1.2 Размеры
          </Text>
          <Group gap="sm" wrap="wrap">
            {buttonSizes.map((size) => (
              <Button
                data-d1-button-size={size}
                key={size}
                size={size}
                variant="filled"
              >
                {size.toUpperCase()}
              </Button>
            ))}
          </Group>
          <Text c="dimmed" size="sm">
            Добавлены `xxxs` и `xxs` для очень плотных utility-контролов.
          </Text>
        </Stack>

        <Stack gap="sm">
          <Text fw={700} size="sm">
            1.3 Состояния
          </Text>
          <Group gap="sm" wrap="wrap">
            <Button data-d1-button-filled-md="true">Основное действие</Button>
            <Button disabled variant="default">
              Disabled
            </Button>
            <Button loading variant="light">
              Loading
            </Button>
          </Group>
        </Stack>

        <Stack gap="sm">
          <Text fw={700} size="sm">
            1.4 Semantic colors
          </Text>
          <Group gap="sm" wrap="wrap">
            <Button color="green" data-d1-button-color-green variant="filled">
              Успех
            </Button>
            <Button color="red" data-d1-button-color-red variant="outline">
              Ошибка
            </Button>
          </Group>
        </Stack>
      </Stack>
    </PageSection>
  );
}

function ActionIconsCard(): ReactElement {
  return (
    <PageSection
      description="ActionIcon должен сохранять размерный масштаб, цветовые состояния и hover/focus transitions по Mantine contract."
      title="2. ActionIcon"
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Text fw={700} size="sm">
            2.1 Варианты
          </Text>
          <Group gap="sm" wrap="wrap">
            {actionIconVariants.map((item) => {
              const Icon = item.icon;

              return (
                <Stack align="center" gap="xs" key={item.variant}>
                  <ActionIcon
                    aria-label={item.label}
                    data-d1-action-icon-variant={item.variant}
                    variant={item.variant}
                  >
                    <Icon size={18} />
                  </ActionIcon>
                  <Text c="dimmed" size="xs">
                    {item.label}
                  </Text>
                </Stack>
              );
            })}
          </Group>
        </Stack>

        <Stack gap="sm">
          <Text fw={700} size="sm">
            2.2 Размеры
          </Text>
          <Group gap="sm" wrap="wrap">
            {actionIconSizes.map((size) => (
              <Stack align="center" gap="xs" key={size}>
                <ActionIcon
                  aria-label={`Размер ${size}`}
                  data-d1-action-icon-size={size}
                  size={size}
                  variant="light"
                >
                  <IconPlus size={18} />
                </ActionIcon>
                <Text c="dimmed" size="xs">
                  {size.toUpperCase()}
                </Text>
              </Stack>
            ))}
            <Stack align="center" gap="xs">
              <ActionIcon aria-label="Disabled" disabled variant="default">
                <IconX size={18} />
              </ActionIcon>
              <Text c="dimmed" size="xs">
                Disabled
              </Text>
            </Stack>
          </Group>
          <Text c="dimmed" size="sm">
            Для иконочных действий size scale теперь начинается с `xxxs`.
          </Text>
        </Stack>

        <Stack gap="sm">
          <Text fw={700} size="sm">
            2.3 Semantic colors
          </Text>
          <Group gap="sm" wrap="wrap">
            <ActionIcon
              aria-label="Успех"
              color="green"
              data-d1-action-icon-color-green
              variant="filled"
            >
              <IconPlus size={18} />
            </ActionIcon>
            <ActionIcon
              aria-label="Ошибка"
              color="red"
              data-d1-action-icon-color-red
              variant="outline"
            >
              <IconMinus size={18} />
            </ActionIcon>
          </Group>
        </Stack>
      </Stack>
    </PageSection>
  );
}

function TextEntryCard(): ReactElement {
  return (
    <PageSection
      description="Text-entry primitives должны показывать размерный масштаб, helper/error states и корректные focus transitions."
      title="3. Text-entry primitives"
    >
      <Stack gap="md">
        <Group align="end" gap="sm" grow>
          <TextInput
            data-d1-input-size-xxxs
            label="XXXS"
            placeholder="xxxs"
            size="xxxs"
          />
          <TextInput
            data-d1-input-size-xxs
            label="XXS"
            placeholder="xxs"
            size="xxs"
          />
          <TextInput
            data-d1-input-size-xs
            label="XS"
            placeholder="xs"
            size="xs"
          />
          <TextInput
            data-d1-input-size-sm
            label="SM"
            placeholder="sm"
            size="sm"
          />
          <TextInput
            data-d1-input-size-md
            label="MD"
            placeholder="md"
            size="md"
          />
          <TextInput
            data-d1-input-size-lg
            label="LG"
            placeholder="lg"
            size="lg"
          />
          <TextInput
            data-d1-input-size-xl
            label="XL"
            placeholder="xl"
            size="xl"
          />
        </Group>

        <TextInput
          data-d1-text-input
          description="Подсказка в InputWrapper и filled surface из темы."
          label="Текстовое поле"
          leftSection={<IconSearch size={16} />}
          placeholder="Введите значение"
        />
        <TextInput
          data-d1-invalid-input
          error="Проверьте значение"
          label="Текстовое поле с ошибкой"
          placeholder="Некорректное значение"
        />
        <Group align="end" gap="sm" grow>
          <TextInput
            data-testid="d1-success-input"
            defaultValue="SKU-2026-0042"
            description="Success tone on the same input surface."
            label="Success"
            rightSection={<IconCheck />}
            styles={successInputStyles}
          />
          <TextInput
            data-testid="d1-warning-input"
            defaultValue="Code needs review"
            description="Warning tone without invalid or error semantics."
            label="Warning"
            rightSection={<IconAlertTriangle />}
            styles={warningInputStyles}
          />
        </Group>
        <NumberInput
          data-d1-number-input
          description="Шаг и контролы остаются mantine-native."
          label="Числовое поле"
          min={0}
          placeholder="0"
          step={1}
        />
        <PasswordInput
          data-d1-password-input
          label="Пароль"
          leftSection={<IconLock size={16} />}
          placeholder="Введите пароль"
        />
        <Textarea
          data-d1-textarea
          autosize
          label="Комментарий"
          minRows={3}
          placeholder="Добавьте примечание"
        />
        <TextInput
          data-d1-disabled-input
          disabled
          label="Disabled"
          placeholder="Недоступно"
          value="Недоступное состояние"
        />
      </Stack>
    </PageSection>
  );
}

function SearchPatternCard(): ReactElement {
  return (
    <PageSection
      description="В проекте уже есть search composition на базе TextInput + sections. Для D1 фиксируем именно pattern, а не новый shared wrapper."
      title="4. Search pattern"
    >
      <Stack gap="md">
        <TextInput
          data-d1-search-input
          leftSection={<IconSearch size={16} />}
          placeholder="Поиск по значению, поставщику или категории"
          rightSection={
            <ActionIcon aria-label="Очистить поиск" size="xxs" variant="subtle">
              <IconX size={16} />
            </ActionIcon>
          }
          rightSectionPointerEvents="all"
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Paper p="sm" radius="md" withBorder>
            <Stack gap="xs">
              <Text fw={700} size="sm">
                Текущий pattern
              </Text>
              <Text c="dimmed" size="sm">
                `TextInput` + `leftSection` icon + опциональный clear
                `ActionIcon`.
              </Text>
            </Stack>
          </Paper>
          <Paper p="sm" radius="md" withBorder>
            <Stack gap="xs">
              <Text fw={700} size="sm">
                Non-goal
              </Text>
              <Text c="dimmed" size="sm">
                Новый shared SearchInput wrapper в этом slice не нужен.
              </Text>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Stack>
    </PageSection>
  );
}

function InputStatesCard(): ReactElement {
  return (
    <PageSection
      description="Representative states для проверки transitions, semantic colors и текущего поведения border/focus."
      title="5. Representative states"
    >
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Paper p="md" radius="lg" shadow="sm" withBorder>
          <Stack gap="sm">
            <Text fw={700} size="sm">
              Buttons and icons
            </Text>
            <Group gap="sm" wrap="wrap">
              <Button
                color="green"
                data-d1-button-transition
                leftSection={<IconPlus size={16} />}
                variant="outline"
              >
                Secondary
              </Button>
              <ActionIcon
                aria-label="Decrease"
                data-d1-action-icon-lg
                size="lg"
                variant="filled"
              >
                <IconMinus size={18} />
              </ActionIcon>
            </Group>
          </Stack>
        </Paper>
        <Paper p="md" radius="lg" shadow="sm" withBorder>
          <Stack gap="sm">
            <Text fw={700} size="sm">
              Entry controls
            </Text>
            <TextInput
              data-d1-input-transition
              defaultValue="Склад 01"
              description="Filled input с helper text."
              label="Код склада"
            />
            <NumberInput defaultValue={12} label="Количество" min={0} />
          </Stack>
        </Paper>
      </SimpleGrid>
    </PageSection>
  );
}

export function UiKitD1PrimitivesContent(): ReactElement {
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <ButtonsCard />
        <ActionIconsCard />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <TextEntryCard />
        <SearchPatternCard />
      </SimpleGrid>

      <InputStatesCard />
    </Stack>
  );
}
