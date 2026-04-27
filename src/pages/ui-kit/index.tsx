import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';
import {
  ActionIcon,
  Affix,
  Box,
  Button,
  Code,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconInfoCircle,
  IconMoonStars,
  IconSunHigh,
} from '@tabler/icons-react';

import {
  appBorderTokens,
  appRadiusScaleTokens,
  appRadiusTokens,
  appShadowScaleTokens,
  appSpacingScaleTokens,
  appSpacingTokens,
  appThemeDefaults,
  bodyStyleTokens,
  brandBluePalette,
  fontFamily,
  fontFamilyMonospace,
  fontSizes,
  fontWeights,
  fontWeightScale,
  headingStyleTokens,
  lineHeightGuidance,
  lineHeights,
  neutralSlatePalette,
} from '@/app/theme';
import { themeModeConfigs } from '@/app/theme/tokens';
import { useUiSettings } from '@/features/settings/model/use-ui-settings';
import { UiKitD1PrimitivesContent } from '@/pages/ui-kit/d1-primitives-content';
import { UiKitD2SelectionContent } from '@/pages/ui-kit/d2-selection-content';
import { UiKitD3FeedbackContent } from '@/pages/ui-kit/d3-feedback-content';
import { UiKitD4NavigationDisplayContent } from '@/pages/ui-kit/d4-navigation-display-content';
import { UiKitFStateMatrixContent } from '@/pages/ui-kit/f-state-matrix-content';
import { UiKitGIconographyContent } from '@/pages/ui-kit/g-iconography-content';
import classes from '@/pages/ui-kit/styles.module.css';
import { APP_ROUTES } from '@/shared/config/routes';
import {
  BottomSpacer,
  FullPageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';
import { PageSection } from '@/shared/ui/page-section';

type PaletteItem = {
  hex: string;
  label: string;
};

type TokenItem = {
  hex: string;
  label: string;
  token: string;
};

type SemanticColorItem = {
  color: string;
  description: string;
  label: string;
};

type AppTypographyToken = {
  fontFamily?: string;
  fontSize: string;
  fontVariantNumeric?: 'tabular-nums';
  fontWeight: string;
  letterSpacing?: string;
  lineHeight: string;
};

type HeadingKey = keyof typeof headingStyleTokens;
type BodyKey = keyof typeof bodyStyleTokens;

const shadeLabels = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
] as const;

const primaryPaletteItems: PaletteItem[] = brandBluePalette.map(
  (hex, index) => ({
    hex,
    label: shadeLabels[index],
  })
);

const neutralPaletteItems: PaletteItem[] = neutralSlatePalette.map(
  (hex, index) => ({
    hex,
    label: shadeLabels[index],
  })
);

const semanticColorItems: SemanticColorItem[] = [
  {
    color: themeModeConfigs.light.other.intent.success,
    description: 'Успешные действия и подтверждения.',
    label: 'Успех',
  },
  {
    color: themeModeConfigs.light.other.intent.warning,
    description: 'Предупреждения и важные уведомления.',
    label: 'Предупреждение',
  },
  {
    color: themeModeConfigs.light.other.intent.error,
    description: 'Ошибки и критические состояния.',
    label: 'Ошибка',
  },
  {
    color: themeModeConfigs.light.other.intent.info,
    description: 'Информационные сообщения и ссылки.',
    label: 'Информация',
  },
];

const semanticTokenItemsLight: TokenItem[] = [
  {
    hex: themeModeConfigs.light.other.surface.background,
    label: 'background',
    token: 'surface.background',
  },
  {
    hex: themeModeConfigs.light.other.surface.paper,
    label: 'paper',
    token: 'surface.paper',
  },
  {
    hex: themeModeConfigs.light.other.surface.subtleSurface,
    label: 'subtle-surface',
    token: 'surface.subtleSurface',
  },
  {
    hex: themeModeConfigs.light.other.border.default,
    label: 'border',
    token: 'border.default',
  },
  {
    hex: themeModeConfigs.light.other.text.primary,
    label: 'text-primary',
    token: 'text.primary',
  },
  {
    hex: themeModeConfigs.light.other.text.secondary,
    label: 'text-secondary',
    token: 'text.secondary',
  },
  {
    hex: themeModeConfigs.light.other.intent.primary,
    label: 'primary',
    token: 'intent.primary',
  },
  {
    hex: themeModeConfigs.light.other.focus.ring,
    label: 'focus-ring',
    token: 'focus.ring',
  },
];

const semanticTokenItemsDark: TokenItem[] = [
  {
    hex: themeModeConfigs.dark.other.surface.background,
    label: 'background',
    token: 'surface.background',
  },
  {
    hex: themeModeConfigs.dark.other.surface.paper,
    label: 'paper',
    token: 'surface.paper',
  },
  {
    hex: themeModeConfigs.dark.other.surface.subtleSurface,
    label: 'subtle-surface',
    token: 'surface.subtleSurface',
  },
  {
    hex: themeModeConfigs.dark.other.border.default,
    label: 'border',
    token: 'border.default',
  },
  {
    hex: themeModeConfigs.dark.other.text.primary,
    label: 'text-primary',
    token: 'text.primary',
  },
  {
    hex: themeModeConfigs.dark.other.text.secondary,
    label: 'text-secondary',
    token: 'text.secondary',
  },
  {
    hex: themeModeConfigs.dark.other.intent.primary,
    label: 'primary',
    token: 'intent.primary',
  },
  {
    hex: themeModeConfigs.dark.other.focus.ring,
    label: 'focus-ring',
    token: 'focus.ring',
  },
];

const roleMappingItems = [
  ['Background', semanticTokenItemsLight[0]],
  ['Paper', semanticTokenItemsLight[1]],
  ['Subtle Surface', semanticTokenItemsLight[2]],
  ['Border', semanticTokenItemsLight[3]],
  ['Text Primary', semanticTokenItemsLight[4]],
  ['Text Secondary', semanticTokenItemsLight[5]],
  ['Primary', semanticTokenItemsLight[6]],
  ['Focus Ring', semanticTokenItemsLight[7]],
] as const;

const mantineDefaultItems = [
  {
    description:
      'Канонический виртуальный цвет, который используют общие Mantine defaults.',
    label: 'primaryColor',
    value: appThemeDefaults.primaryColor,
  },
  {
    description: 'Целевой light shade для акцента и активных light-состояний.',
    label: 'primaryShade (light)',
    value: '500',
  },
  {
    description: 'Целевой dark shade для акцента и активных dark-состояний.',
    label: 'primaryShade (dark)',
    value: '400',
  },
  {
    description: 'Базовый радиус контролов и секций на уровне темы.',
    label: 'defaultRadius',
    value: 'md (0.5rem)',
  },
  {
    description: 'Текущее поведение focus ring для Mantine controls.',
    label: 'focusRing',
    value: appThemeDefaults.focusRing,
  },
] as const;

const headingExamples: Array<{
  description: string;
  key: HeadingKey;
  sample: string;
  title: string;
}> = [
  {
    description: 'Крупный заголовок страницы.',
    key: 'h1',
    sample: 'Заголовок H1',
    title: 'H1',
  },
  {
    description: 'Раздел или крупный блок.',
    key: 'h2',
    sample: 'Заголовок H2',
    title: 'H2',
  },
  {
    description: 'Подзаголовок секции.',
    key: 'h3',
    sample: 'Заголовок H3',
    title: 'H3',
  },
  {
    description: 'Вторичный заголовок блока.',
    key: 'h4',
    sample: 'Заголовок H4',
    title: 'H4',
  },
  {
    description: 'Компактный служебный заголовок.',
    key: 'h5',
    sample: 'Заголовок H5',
    title: 'H5',
  },
  {
    description: 'Самый плотный heading-уровень.',
    key: 'h6',
    sample: 'Заголовок H6',
    title: 'H6',
  },
];

const bodyExamples: Array<{
  description: string;
  key: BodyKey;
  sample: string;
  title: string;
}> = [
  {
    description: 'Основной текст, крупный.',
    key: 'bodyLarge',
    sample: 'Основной текст — крупный.',
    title: 'Body Large',
  },
  {
    description: 'Основной текст, стандартный.',
    key: 'bodyRegular',
    sample: 'Основной текст — стандартный.',
    title: 'Body Regular',
  },
  {
    description: 'Дополнительный текст, мелкий.',
    key: 'bodySmall',
    sample: 'Дополнительный текст — мелкий.',
    title: 'Body Small',
  },
  {
    description: 'Подпись / вспомогательный текст.',
    key: 'caption',
    sample: 'Подпись / вспомогательный текст.',
    title: 'Caption',
  },
  {
    description: 'Метка / подпись элемента.',
    key: 'label',
    sample: 'Метка / подпись элемента',
    title: 'Label',
  },
  {
    description: 'Вспомогательный текст / подсказка.',
    key: 'helper',
    sample: 'Вспомогательный текст / подсказка.',
    title: 'Helper',
  },
  {
    description: 'Числовой текст с tabular-nums.',
    key: 'numeric',
    sample: '12 540 ₽',
    title: 'Numeric',
  },
];

const spacingScaleItems = Object.entries(appSpacingScaleTokens).map(
  ([label, value]) => ({
    label,
    value,
  })
);

const radiusScaleItems = [
  {
    label: '1px',
    token: 'borderHairline',
    value: appRadiusScaleTokens.borderHairline,
  },
  {
    label: '2px',
    token: 'borderSoft',
    value: appRadiusScaleTokens.borderSoft,
  },
  {
    label: 'xs',
    token: 'xs',
    value: appRadiusScaleTokens.xs,
  },
  {
    label: 'sm',
    token: 'sm',
    value: appRadiusScaleTokens.sm,
  },
  {
    label: 'md',
    token: 'md',
    value: appRadiusScaleTokens.md,
  },
  {
    label: 'lg',
    token: 'lg',
    value: appRadiusScaleTokens.lg,
  },
  {
    label: 'xl',
    token: 'xl',
    value: appRadiusScaleTokens.xl,
  },
] as const;

const shadowScaleItems = [
  { label: 'xs', value: appShadowScaleTokens.xs },
  { label: 'sm', value: appShadowScaleTokens.sm },
  { label: 'md', value: appShadowScaleTokens.md },
  { label: 'lg', value: appShadowScaleTokens.lg },
] as const;

const layoutExampleGapItems = [
  { label: '8', value: appSpacingTokens.xs },
  { label: '12', value: appSpacingTokens.sm },
  { label: '16', value: appSpacingTokens.md },
  { label: '24', value: appSpacingTokens.xl },
] as const;

function toHexLabel(value: string): string {
  return value.toUpperCase();
}

function remToPxLabel(value: string): string {
  const numeric = Number.parseFloat(value);

  if (Number.isNaN(numeric)) {
    return value;
  }

  return `${Math.round(numeric * 16)} px`;
}

function toTextStyle(token: AppTypographyToken): CSSProperties {
  return {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    fontVariantNumeric: token.fontVariantNumeric,
    fontWeight: token.fontWeight,
    letterSpacing: token.letterSpacing,
    lineHeight: token.lineHeight,
  };
}

function getLetterSpacing(token: AppTypographyToken): string {
  return token.letterSpacing ?? '0em';
}

function SectionBand({
  children,
  description,
  testId,
  title,
}: Readonly<{
  children: ReactNode;
  description: string;
  testId?: string;
  title: string;
}>): ReactElement {
  return (
    <Box component="section" data-testid={testId}>
      <Stack gap="md">
        <Box>
          <Title order={2} size="h2">
            {title}
          </Title>
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        </Box>
        {children}
      </Stack>
    </Box>
  );
}

function Swatch({
  color,
}: Readonly<{
  color: string;
}>): ReactElement {
  return (
    <Box
      aria-hidden="true"
      style={{
        background: color,
        border: '1px solid var(--sl-shell-border)',
        borderRadius: '0.5rem',
        flex: '0 0 2.625rem',
        height: '2.625rem',
      }}
    />
  );
}

function PaletteScale({
  description,
  items,
  title,
}: Readonly<{
  description: string;
  items: PaletteItem[];
  title: string;
}>): ReactElement {
  return (
    <PageSection description={description} title={title}>
      <Stack gap="xs">
        {items.map((item) => (
          <Group key={item.label} justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Swatch color={item.hex} />
              <Text fw={600} size="sm">
                {item.label}
              </Text>
            </Group>
            <Text c="dimmed" ff="monospace" size="sm">
              {toHexLabel(item.hex)}
            </Text>
          </Group>
        ))}
      </Stack>
    </PageSection>
  );
}

function SemanticColorsCard(): ReactElement {
  return (
    <PageSection
      description="Светлая тема использует фиксированный semantic слой для статусов и сообщений."
      title="Семантические цвета (Светлая тема)"
    >
      <Stack gap="md">
        {semanticColorItems.map((item) => (
          <Group key={item.label} justify="space-between" wrap="nowrap">
            <Group align="flex-start" gap="sm" wrap="nowrap">
              <Swatch color={item.color} />
              <Stack gap={2}>
                <Text fw={600} size="sm">
                  {item.label}
                </Text>
                <Text c="dimmed" size="xs">
                  {item.description}
                </Text>
              </Stack>
            </Group>
            <Text c="dimmed" ff="monospace" size="sm">
              {toHexLabel(item.color)}
            </Text>
          </Group>
        ))}
      </Stack>
    </PageSection>
  );
}

function SemanticTokensCard({
  dark = false,
  items,
}: Readonly<{
  dark?: boolean;
  items: TokenItem[];
}>): ReactElement {
  const darkTheme = themeModeConfigs.dark.other;

  return (
    <PageSection
      description={
        dark
          ? 'Канонические semantic tokens для dark mode.'
          : 'Канонические semantic tokens для light mode.'
      }
      title={
        dark
          ? 'Семантические токены (Тёмная тема)'
          : 'Семантические токены (Светлая тема)'
      }
    >
      <Box
        style={{
          background: dark ? darkTheme.surface.background : 'transparent',
          border: dark ? `1px solid ${darkTheme.border.default}` : undefined,
          borderRadius: '0.5rem',
          color: dark ? darkTheme.text.primary : undefined,
          padding: dark ? '0.75rem' : 0,
        }}
      >
        <Stack gap="xs">
          {items.map((item) => (
            <Group key={item.token} justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <Swatch color={item.hex} />
                <Stack gap={2}>
                  <Text
                    c={dark ? darkTheme.text.primary : undefined}
                    fw={600}
                    size="sm"
                  >
                    {item.label}
                  </Text>
                  <Text
                    c={dark ? darkTheme.text.secondary : 'dimmed'}
                    ff="monospace"
                    size="xs"
                  >
                    {item.token}
                  </Text>
                </Stack>
              </Group>
              <Text
                c={dark ? darkTheme.text.secondary : 'dimmed'}
                ff="monospace"
                size="sm"
              >
                {toHexLabel(item.hex)}
              </Text>
            </Group>
          ))}
        </Stack>
      </Box>
    </PageSection>
  );
}

function RoleMappingCard(): ReactElement {
  return (
    <PageSection
      description="Светлая тема использует эти токены как базовое соответствие ролям интерфейса."
      title="Соответствие ролей цветам (Светлая тема)"
    >
      <Stack gap="xs">
        {roleMappingItems.map(([role, item]) => (
          <Group key={role} justify="space-between" wrap="nowrap">
            <Text fw={600} size="sm">
              {role}
            </Text>
            <Group gap="sm" wrap="nowrap">
              <Swatch color={item.hex} />
              <Stack gap={2}>
                <Text ff="monospace" size="xs">
                  {item.token}
                </Text>
                <Text c="dimmed" ff="monospace" size="xs">
                  {toHexLabel(item.hex)}
                </Text>
              </Stack>
            </Group>
          </Group>
        ))}
      </Stack>
    </PageSection>
  );
}

function MantineDefaultsCard(): ReactElement {
  return (
    <PageSection
      description="Текущие Mantine defaults для канонической цветовой системы в приложении."
      title="Настройки по умолчанию"
    >
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md">
        {mantineDefaultItems.map((item) => (
          <Box
            key={item.label}
            style={{
              borderLeft: '1px solid var(--sl-shell-border)',
              paddingInlineStart: '0.75rem',
            }}
          >
            <Stack gap={6}>
              <Text c="dimmed" size="xs">
                {item.label}
              </Text>
              <Title order={3} size="h5">
                {item.value}
              </Title>
              <Text c="dimmed" size="xs">
                {item.description}
              </Text>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>
    </PageSection>
  );
}

function TypographyScaleCard(): ReactElement {
  const rows = [
    ...headingExamples.map((item) => {
      const token = headingStyleTokens[item.key];

      return (
        <Table.Tr key={item.title}>
          <Table.Td>{item.title}</Table.Td>
          <Table.Td>{remToPxLabel(token.fontSize)}</Table.Td>
          <Table.Td>{token.fontWeight}</Table.Td>
          <Table.Td>{getLetterSpacing(token)}</Table.Td>
          <Table.Td>{token.lineHeight}</Table.Td>
          <Table.Td>
            <Text style={toTextStyle(token)}>{item.sample}</Text>
          </Table.Td>
        </Table.Tr>
      );
    }),
    ...bodyExamples.map((item) => {
      const token = bodyStyleTokens[item.key];

      return (
        <Table.Tr key={item.title}>
          <Table.Td>{item.title}</Table.Td>
          <Table.Td>{remToPxLabel(token.fontSize)}</Table.Td>
          <Table.Td>{token.fontWeight}</Table.Td>
          <Table.Td>{getLetterSpacing(token)}</Table.Td>
          <Table.Td>{token.lineHeight}</Table.Td>
          <Table.Td>
            <Text style={toTextStyle(token)}>{item.sample}</Text>
          </Table.Td>
        </Table.Tr>
      );
    }),
  ];

  return (
    <PageSection
      description="Каноническая шкала typography tokens для headings, body и служебных ролей."
      title="Типографическая шкала"
    >
      <Table
        horizontalSpacing="sm"
        striped
        verticalSpacing="sm"
        withColumnBorders={false}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Стиль</Table.Th>
            <Table.Th>Размер</Table.Th>
            <Table.Th>Вес</Table.Th>
            <Table.Th>Трекинг</Table.Th>
            <Table.Th>Line-height</Table.Th>
            <Table.Th>Пример</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      <Paper p="sm" radius="md">
        <Group align="flex-start" gap="sm" wrap="nowrap">
          <ThemeIcon color="brand" radius="xl" size="sm" variant="light">
            <IconInfoCircle size={12} />
          </ThemeIcon>
          <Text c="dimmed" size="xs">
            Размеры и line-height зафиксированы как app-level tokens в теме.
            `/ui-kit` только демонстрирует эти значения, а не задаёт их
            локально.
          </Text>
        </Group>
      </Paper>
    </PageSection>
  );
}

function FontWeightScaleCard(): ReactElement {
  return (
    <PageSection
      description="Каноническая шкала насыщенности для типографической системы."
      title="Шкала насыщенности (font-weight)"
    >
      <Stack gap="xs">
        {fontWeightScale.map((item) => (
          <Group key={item.key} justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Text fw={700} size="sm">
                {item.value}
              </Text>
              <Text size="sm">{item.label}</Text>
            </Group>
            <Text
              ff={fontFamily}
              size="sm"
              style={{ fontWeight: String(item.value) }}
            >
              Inter {item.value}
            </Text>
          </Group>
        ))}
      </Stack>
    </PageSection>
  );
}

function TypographyPreviewCard(): ReactElement {
  const lightTheme = themeModeConfigs.light.other;
  const darkTheme = themeModeConfigs.dark.other;

  return (
    <PageSection
      description="Сравнение ключевых текстовых ролей в светлой и тёмной теме."
      title="Примеры в светлой и тёмной теме"
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Paper
          p="lg"
          radius="lg"
          style={{
            background: lightTheme.surface.paper,
            border: `1px solid ${lightTheme.border.default}`,
          }}
        >
          <Stack gap="md">
            <Text c="dimmed" fw={600} size="xs">
              Светлая тема
            </Text>
            <Text style={toTextStyle(headingStyleTokens.h1)}>H1 Заголовок</Text>
            <Text style={toTextStyle(headingStyleTokens.h2)}>H2 Заголовок</Text>
            <Text style={toTextStyle(headingStyleTokens.h3)}>H3 Заголовок</Text>
            <Text style={toTextStyle(bodyStyleTokens.bodyRegular)}>
              Основной текст — стандартный. Он используется для описаний,
              инструкций и контента.
            </Text>
            <Text c="dimmed" style={toTextStyle(bodyStyleTokens.caption)}>
              Подпись / вспомогательный текст
            </Text>
            <Text c="brand" style={toTextStyle(bodyStyleTokens.label)}>
              Метка / подпись
            </Text>
            <Text style={toTextStyle(bodyStyleTokens.numeric)}>12 540 ₽</Text>
          </Stack>
        </Paper>

        <Paper
          p="lg"
          radius="lg"
          style={{
            background: darkTheme.surface.paper,
            border: `1px solid ${darkTheme.border.default}`,
            color: darkTheme.text.primary,
          }}
        >
          <Stack gap="md">
            <Text c={darkTheme.text.secondary} fw={600} size="xs">
              Тёмная тема
            </Text>
            <Text
              c={darkTheme.text.primary}
              style={toTextStyle(headingStyleTokens.h1)}
            >
              H1 Заголовок
            </Text>
            <Text
              c={darkTheme.text.primary}
              style={toTextStyle(headingStyleTokens.h2)}
            >
              H2 Заголовок
            </Text>
            <Text
              c={darkTheme.text.primary}
              style={toTextStyle(headingStyleTokens.h3)}
            >
              H3 Заголовок
            </Text>
            <Text
              c={darkTheme.text.primary}
              style={toTextStyle(bodyStyleTokens.bodyRegular)}
            >
              Основной текст — стандартный. Он используется для описаний,
              инструкций и контента.
            </Text>
            <Text
              c={darkTheme.text.secondary}
              style={toTextStyle(bodyStyleTokens.caption)}
            >
              Подпись / вспомогательный текст
            </Text>
            <Text
              c={darkTheme.intent.primary}
              style={toTextStyle(bodyStyleTokens.label)}
            >
              Метка / подпись
            </Text>
            <Text
              c={darkTheme.text.primary}
              style={toTextStyle(bodyStyleTokens.numeric)}
            >
              12 540 ₽
            </Text>
          </Stack>
        </Paper>
      </SimpleGrid>
    </PageSection>
  );
}

function LineHeightGuidanceCard(): ReactElement {
  return (
    <PageSection
      description="Рекомендации по line-height для канонических текстовых ролей."
      title="Рекомендации по высоте строки (line-height)"
    >
      <Stack gap="sm">
        {lineHeightGuidance.map((item) => (
          <Group key={item.label} justify="space-between" wrap="nowrap">
            <Stack gap={2}>
              <Text fw={600} size="sm">
                {item.label}
              </Text>
              <Text c="dimmed" size="xs">
                {item.description}
              </Text>
            </Stack>
            <Code>{item.value}</Code>
          </Group>
        ))}
      </Stack>
    </PageSection>
  );
}

function MonospaceCard(): ReactElement {
  return (
    <PageSection
      description="Моноширинный шрифт для кода, данных и технических значений."
      title="Моноширинный шрифт (код, данные)"
    >
      <Stack gap="md">
        <Text c="brand" fw={600} size="sm">
          {fontFamilyMonospace}
        </Text>
        <Paper
          p="md"
          radius="md"
          style={{
            background:
              'linear-gradient(180deg, var(--sl-surface-card), var(--sl-surface-subtle))',
          }}
        >
          <Stack gap="sm">
            <Code block ff="monospace">
              {`// Пример кода
const items = [
  { id: 1, name: "Товар A", qty: 3 },
  { id: 2, name: "Товар B", qty: 7 },
];

total: 12540.00`}
            </Code>
          </Stack>
        </Paper>
        <Group gap="lg" wrap="wrap">
          <Text c="dimmed" size="xs">
            Размер: 13 px
          </Text>
          <Text c="dimmed" size="xs">
            Вес: {fontWeights.regular}
          </Text>
          <Text c="dimmed" size="xs">
            Line-height: {lineHeights.md}
          </Text>
        </Group>
      </Stack>
    </PageSection>
  );
}

function TypographyNotesCard(): ReactElement {
  return (
    <PageSection
      description="Сводка app-level typography tokens, которые задаются через Mantine theme."
      title="Заметки о типографических токенах Mantine"
    >
      <Stack gap="sm">
        <Text size="sm">`fontFamily`: {fontFamily}</Text>
        <Text size="sm">
          `fontSizes`: xs {fontSizes.xs}, sm {fontSizes.sm}, md {fontSizes.md},
          lg {fontSizes.lg}, xl {fontSizes.xl}
        </Text>
        <Text size="sm">
          `lineHeights`: xs {lineHeights.xs}, sm {lineHeights.sm}, md{' '}
          {lineHeights.md}, lg {lineHeights.lg}, xl {lineHeights.xl}
        </Text>
        <Text size="sm">
          `weights`: regular {fontWeights.regular}, medium {fontWeights.medium},
          semibold {fontWeights.semibold}, bold {fontWeights.bold}
        </Text>
      </Stack>
    </PageSection>
  );
}

function SpacingScaleCard(): ReactElement {
  return (
    <PageSection
      description="Каноническая spacing scale для ритма, отступов и gap-значений."
      title="1. Отступы (spacing scale)"
    >
      <SimpleGrid cols={{ base: 3, sm: 5, lg: 9 }} spacing="md">
        {spacingScaleItems.map((item) => (
          <Stack align="center" gap="xs" key={item.label}>
            <Text fw={700} size="sm">
              {item.label}
            </Text>
            <Box
              data-spacing-value={item.value}
              style={{
                background: 'var(--sl-accent-soft)',
                borderRadius: appRadiusScaleTokens.sm,
                height: item.value,
                minHeight: item.value,
                width: item.value,
              }}
            />
            <Text c="dimmed" ff="monospace" size="xs">
              {item.value}
            </Text>
          </Stack>
        ))}
      </SimpleGrid>
    </PageSection>
  );
}

function RadiusScaleCard(): ReactElement {
  return (
    <PageSection
      description="Используйте scale-токены радиусов вместо произвольных значений."
      title="2. Радиусы (borders)"
    >
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 7 }} spacing="md">
        {radiusScaleItems.map((item) => (
          <Stack align="center" gap="xs" key={item.label}>
            <Text fw={700} size="sm">
              {item.label}
            </Text>
            <Box
              data-radius-value={item.value}
              style={{
                background: 'var(--sl-surface-card)',
                border: `1px solid var(--sl-accent)`,
                borderRadius: item.value,
                boxShadow: 'var(--sl-control-shadow)',
                height: '2.75rem',
                width: '4.5rem',
              }}
            />
            <Text c="dimmed" ff="monospace" size="xs">
              {item.value}
            </Text>
          </Stack>
        ))}
      </SimpleGrid>
    </PageSection>
  );
}

function ShadowScaleCard(): ReactElement {
  return (
    <PageSection
      description="Тени добавляют глубину слоям. Сильные декоративные тени здесь не нужны."
      title="3. Тени (shadows)"
    >
      <SimpleGrid cols={{ base: 2, lg: 4 }} spacing="md">
        {shadowScaleItems.map((item) => (
          <Stack align="center" gap="xs" key={item.label}>
            <Text fw={700} size="sm">
              {item.label}
            </Text>
            <Box
              data-shadow-value={item.label}
              style={{
                background: 'var(--sl-surface-card)',
                borderRadius: appRadiusScaleTokens.md,
                boxShadow: item.value,
                height: '4rem',
                width: '100%',
              }}
            />
            <Text c="dimmed" ff="monospace" size="xs">
              {item.value}
            </Text>
          </Stack>
        ))}
      </SimpleGrid>
    </PageSection>
  );
}

function FocusRingCard(): ReactElement {
  const { focus } = themeModeConfigs.light.other;

  return (
    <PageSection
      description="Кольцо фокуса должно быть читаемым и токенизированным."
      title="4. Кольцо фокуса (focus ring)"
    >
      <Stack align="center" gap="md">
        <Box
          data-focus-ring-sample="true"
          style={{
            alignItems: 'center',
            background: 'var(--sl-surface-card)',
            border: `1px solid var(--sl-shell-border)`,
            borderRadius: appRadiusScaleTokens.md,
            boxShadow: 'var(--sl-control-shadow)',
            color: 'var(--sl-accent)',
            display: 'inline-flex',
            fontWeight: 700,
            justifyContent: 'center',
            minHeight: '2.75rem',
            minWidth: '7.25rem',
            outline: `${focus.width} solid ${focus.ring}`,
            outlineOffset: focus.offset,
          }}
        >
          Фокус
        </Box>
        <Text c="dimmed" size="xs">
          {`${focus.width} outline, ${focus.ring}, offset ${focus.offset}`}
        </Text>
      </Stack>
    </PageSection>
  );
}

function SurfaceSamplesCard(): ReactElement {
  const lightSurface = themeModeConfigs.light.other.surface;

  const items = [
    { label: 'App bg', value: lightSurface.background },
    { label: 'Paper', value: lightSurface.paper },
    { label: 'Raised', value: lightSurface.raised },
    { label: 'Subtle', value: lightSurface.subtleSurface },
    { label: 'Frosted', value: lightSurface.glass },
  ] as const;

  return (
    <PageSection
      description="Поверхности используются для иерархии контента и контраста."
      title="5. Поверхности (surfaces)"
    >
      <SimpleGrid cols={{ base: 2, lg: 5 }} spacing="md">
        {items.map((item) => (
          <Stack align="center" gap="xs" key={item.label}>
            <Text fw={700} size="sm">
              {item.label}
            </Text>
            <Box
              data-surface-value={item.label}
              style={{
                background: item.value,
                backdropFilter:
                  item.label === 'Frosted' ? 'blur(1rem)' : undefined,
                border: `1px solid var(--sl-shell-border)`,
                borderRadius: appRadiusScaleTokens.md,
                boxShadow: 'var(--sl-panel-shadow)',
                height: '5.75rem',
                width: '100%',
              }}
            />
            <Text c="dimmed" ff="monospace" size="xs">
              {item.label === 'Frosted' ? 'blur(1rem)' : item.value}
            </Text>
          </Stack>
        ))}
      </SimpleGrid>
    </PageSection>
  );
}

function LayoutExamplesCard(): ReactElement {
  return (
    <PageSection
      description="Padding, gap и расстояния между карточками должны собираться из токенов."
      title="6. Примеры применения вёрстки"
    >
      <SimpleGrid cols={{ base: 1, xl: 3 }} spacing="md">
        <Stack gap="sm">
          <Text fw={700} size="sm">
            6.1 Внутренние отступы (padding)
          </Text>
          <Paper
            data-layout-sample="padding"
            p="md"
            radius="lg"
            shadow="md"
            withBorder
          >
            <Stack gap="sm">
              <Text fw={700} size="sm">
                Пример карточки
              </Text>
              <Text c="dimmed" size="sm">
                Внутренние отступы: {appSpacingTokens.md}
              </Text>
              <Paper p="sm" radius="md" withBorder>
                <Text size="sm">Поставщик</Text>
              </Paper>
              <Paper p="sm" radius="md" withBorder>
                <Text size="sm">Дата и время</Text>
              </Paper>
              <Paper p="sm" radius="md" withBorder>
                <Text size="sm">Сумма</Text>
              </Paper>
            </Stack>
          </Paper>
        </Stack>

        <Stack gap="sm">
          <Text fw={700} size="sm">
            6.2 Межэлементные отступы (gaps)
          </Text>
          <Stack data-layout-sample="gaps" gap="md">
            <Paper p="sm" radius="md" shadow="sm" withBorder>
              <Text size="sm">Вертикальный gap: {appSpacingTokens.md}</Text>
            </Paper>
            <Paper p="sm" radius="md" shadow="sm" withBorder>
              <Text size="sm">Горизонтальный gap scale</Text>
              <Group gap="xs" mt="sm" wrap="nowrap">
                {layoutExampleGapItems.map((item) => (
                  <Box
                    key={item.label}
                    style={{
                      alignItems: 'center',
                      background: 'var(--sl-surface-card)',
                      border: `1px solid var(--sl-shell-border)`,
                      borderRadius: appRadiusScaleTokens.sm,
                      display: 'flex',
                      height: '2.25rem',
                      justifyContent: 'center',
                      minWidth: '2.25rem',
                      paddingInline: item.value,
                    }}
                  >
                    <Text size="xs">{item.label}</Text>
                  </Box>
                ))}
              </Group>
            </Paper>
          </Stack>
        </Stack>

        <Stack gap="sm">
          <Text fw={700} size="sm">
            6.3 Отступы между карточками (card spacing)
          </Text>
          <SimpleGrid
            cols={2}
            data-layout-sample="card-spacing"
            spacing="md"
            verticalSpacing="md"
          >
            {['Новый приход', 'Новый расход', 'Буфер', 'Сканер'].map((item) => (
              <Paper key={item} p="md" radius="lg" shadow="sm" withBorder>
                <Stack gap="xs">
                  <Text fw={700} size="sm">
                    {item}
                  </Text>
                  <Text c="dimmed" size="xs">
                    Gap между карточками: {appSpacingTokens.md}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </SimpleGrid>
    </PageSection>
  );
}

function LayoutNotesCard(): ReactElement {
  const lightSurface = themeModeConfigs.light.other.surface;

  return (
    <PageSection
      description="Сводка layout-token source-of-truth для section C."
      title="Заметки о layout токенах Mantine"
    >
      <Stack gap="sm">
        <Text size="sm">
          `spacing`: xs {appSpacingTokens.xs}, sm {appSpacingTokens.sm}, md{' '}
          {appSpacingTokens.md}, lg {appSpacingTokens.lg}, xl{' '}
          {appSpacingTokens.xl}
        </Text>
        <Text size="sm">
          `radius`: control {`${appRadiusTokens.control}px`}, section{' '}
          {`${appRadiusTokens.section}px`}, shell {`${appRadiusTokens.shell}px`}
        </Text>
        <Text size="sm">
          `focus`: ring {themeModeConfigs.light.other.focus.ring}, width{' '}
          {appBorderTokens.focusWidth}, offset {appBorderTokens.focusOffset}
        </Text>
        <Text size="sm">
          `surfaces`: background {lightSurface.background}, paper{' '}
          {lightSurface.paper}, raised {lightSurface.raised}, subtle{' '}
          {lightSurface.subtleSurface}
        </Text>
      </Stack>
    </PageSection>
  );
}

export function UiKitPage(): ReactElement {
  const { settings, setThemePreference } = useUiSettings();
  const nextThemePreference =
    settings.themePreference === 'light' ? 'dark' : 'light';
  const themeToggleLabel = useMemo(
    () =>
      settings.themePreference === 'light'
        ? 'Переключить на темную тему'
        : 'Переключить на светлую тему',
    [settings.themePreference]
  );

  return (
    <div className={classes.liveDemoRoot} data-ui-kit-live-demo="true">
      <FullPageContainer>
        <Affix position={{ bottom: '1.25rem', right: '1.25rem' }} zIndex={200}>
          <Tooltip label={themeToggleLabel} withArrow>
            <ActionIcon
              aria-label={themeToggleLabel}
              color="brand"
              data-testid="ui-kit-theme-toggle"
              onClick={() => {
                void setThemePreference(nextThemePreference);
              }}
              radius="xl"
              size="xl"
              variant="filled"
            >
              {settings.themePreference === 'light' ? (
                <IconMoonStars />
              ) : (
                <IconSunHigh />
              )}
            </ActionIcon>
          </Tooltip>
        </Affix>
        <SectionStack>
          <SectionBand
            description="Палитра SKLAD построена на спокойном brand blue, neutral slate и одном semantic слое для light/dark."
            testId="ui-kit-section-a"
            title="A. Цветовая система"
          >
            <Group justify="flex-start">
              <Button
                component="a"
                href={`/#${APP_ROUTES.devicePreview}?target=${APP_ROUTES.uiKit}`}
                variant="default"
              >
                Device Preview
              </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
              <PaletteScale
                description="Каноническая brand palette для акцента, CTA и активных состояний."
                items={primaryPaletteItems}
                title="Primary / Blue"
              />
              <PaletteScale
                description="Каноническая neutral palette для текста, поверхностей и разделителей."
                items={neutralPaletteItems}
                title="Neutral / Slate"
              />
              <SemanticColorsCard />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
              <SemanticTokensCard items={semanticTokenItemsLight} />
              <SemanticTokensCard dark items={semanticTokenItemsDark} />
              <RoleMappingCard />
            </SimpleGrid>

            <MantineDefaultsCard />
          </SectionBand>

          <SectionBand
            description="Типографическая система SKLAD основана на Inter как app-level системном шрифте с компактной и читаемой иерархией."
            testId="ui-kit-section-b"
            title="B. Типографика"
          >
            <TypographyScaleCard />

            <SimpleGrid cols={{ base: 1, lg: 2, xl: 3 }} spacing="md">
              <PageSection
                description="Канонический app-level шрифт для интерфейса."
                title="Шрифт по умолчанию"
              >
                <Text fw={700} size="xl">
                  Inter (System)
                </Text>
                <Text c="dimmed" size="sm">
                  {fontFamily}
                </Text>
              </PageSection>
              <FontWeightScaleCard />
              <TypographyPreviewCard />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, lg: 2, xl: 3 }} spacing="md">
              <LineHeightGuidanceCard />
              <MonospaceCard />
              <TypographyNotesCard />
            </SimpleGrid>
          </SectionBand>

          <SectionBand
            description="Канонические layout-токены для spacing, radius, shadows, surfaces и focus ring."
            testId="ui-kit-section-c"
            title="C. Пространство, радиусы, тени"
          >
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
              <SpacingScaleCard />
              <RadiusScaleCard />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
              <ShadowScaleCard />
              <FocusRingCard />
              <SurfaceSamplesCard />
            </SimpleGrid>

            <LayoutExamplesCard />
            <LayoutNotesCard />
          </SectionBand>

          <SectionBand
            description="Канонические action primitives и text-entry primitives на базе Mantine theme.components."
            testId="ui-kit-section-d1"
            title="D1. Action и text-entry primitives"
          >
            <UiKitD1PrimitivesContent />
          </SectionBand>

          <SectionBand
            description="Канонические selection, choice и picker primitives на базе Mantine theme.components."
            testId="ui-kit-section-d2"
            title="D2. Selection и picker primitives"
          >
            <UiKitD2SelectionContent />
          </SectionBand>

          <SectionBand
            description="Canonical feedback and container primitives on top of Mantine theme.components."
            testId="ui-kit-section-d3"
            title="D3. Feedback and container primitives"
          >
            <UiKitD3FeedbackContent />
          </SectionBand>

          <SectionBand
            description="Canonical navigation, progress, and dense display primitives on top of Mantine theme.components."
            testId="ui-kit-section-d4"
            title="D4. Navigation, progress, and display primitives"
          >
            <UiKitD4NavigationDisplayContent />
          </SectionBand>

          <SectionBand
            description="Canonical state matrix for component states, semantic statuses, validation, loading, and dark/light parity."
            testId="ui-kit-section-f"
            title="F. State matrix and status language"
          >
            <UiKitFStateMatrixContent />
          </SectionBand>

          <SectionBand
            description="Canonical iconography contract for pack choice, sizing, action usage, and navigation/demo contexts."
            testId="ui-kit-section-g"
            title="G. Iconography"
          >
            <UiKitGIconographyContent />
          </SectionBand>

          <BottomSpacer />
        </SectionStack>
      </FullPageContainer>
    </div>
  );
}
