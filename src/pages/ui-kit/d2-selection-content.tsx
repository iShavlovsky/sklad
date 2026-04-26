import type { ReactElement } from 'react';
import { useState } from 'react';
import {
  Badge,
  Checkbox,
  Group,
  MultiSelect,
  NativeSelect,
  Pill,
  PillsInput,
  Radio,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  TagsInput,
  Text,
} from '@mantine/core';
import { DatePickerInput, DateTimePicker, TimeInput } from '@mantine/dates';
import { IconCalendar, IconClock, IconSearch } from '@tabler/icons-react';

import { PageSection } from '@/shared/ui/page-section';

const selectData = [
  { label: 'Приход', value: 'arrival' },
  { label: 'Расход', value: 'departure' },
  { label: 'Черновик', value: 'draft' },
] as const;

const segmentedData = [
  { label: 'День', value: 'day' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
];

const badgeExamples = [
  { children: 'Default', variant: 'light' as const },
  { children: 'Outline', variant: 'outline' as const },
  { children: 'Filled', variant: 'filled' as const },
  { children: 'Info', color: 'blue', variant: 'light' as const },
  { children: 'Success', color: 'green', variant: 'light' as const },
] as const;

function SelectsCard(): ReactElement {
  const [selectValue, setSelectValue] = useState<string | null>('arrival');
  const [multiValue, setMultiValue] = useState<string[]>(['serial', 'buffer']);
  const [tagsValue, setTagsValue] = useState<string[]>(['SKU-01', 'BOX-77']);

  return (
    <PageSection
      description="Select-like controls должны использовать один chrome contract для input, dropdown и option states."
      title="1. Select и picker inputs"
    >
      <Stack gap="md">
        <Select
          data={selectData}
          data-testid="d2-select"
          description="Filled input + combobox dropdown от theme.components."
          label="Select"
          onChange={setSelectValue}
          placeholder="Выберите тип"
          searchable
          value={selectValue}
        />
        <NativeSelect
          data={[
            { label: 'Склад 1', value: 'wh-1' },
            { label: 'Склад 2', value: 'wh-2' },
            { label: 'Склад 3', value: 'wh-3' },
          ]}
          data-testid="d2-native-select"
          description="NativeSelect сохраняет тот же input contract."
          label="NativeSelect"
        />
        <Select
          data={selectData}
          data-testid="d2-select-invalid"
          error="Проверьте выбранное значение"
          label="Select с ошибкой"
          placeholder="Выберите тип"
        />
        <Select
          data={selectData}
          data-testid="d2-select-search"
          label="Searchable select"
          leftSection={<IconSearch size={16} />}
          placeholder="Поиск по типу записи"
          searchable
        />
        <PillsInput
          data-testid="d2-pills-input"
          description="PillsInput остаётся agnostic base owner для token entry."
          label="PillsInput"
        >
          <Pill.Group>
            <Pill withRemoveButton>RFID</Pill>
            <Pill withRemoveButton>Serial</Pill>
            <PillsInput.Field placeholder="Добавить тег" />
          </Pill.Group>
        </PillsInput>
        <Select
          data={selectData}
          data-testid="d2-select-disabled"
          disabled
          label="Disabled select"
          value="arrival"
        />
        <MultiSelect
          data={[
            { label: 'Serial', value: 'serial' },
            { label: 'Buffer', value: 'buffer' },
            { label: 'Scanner', value: 'scanner' },
          ]}
          data-testid="d2-multiselect"
          description="MultiSelect использует тот же combobox dropdown contract."
          label="MultiSelect"
          onChange={setMultiValue}
          placeholder="Выберите каналы"
          value={multiValue}
        />
        <div data-testid="d2-tags-input-shell">
          <TagsInput
            data={['SKU-01', 'SKU-02', 'BOX-77', 'ZONE-A']}
            data-testid="d2-tags-input"
            description="TagsInput и pills поддерживаются в canonical D2 surface."
            label="TagsInput"
            onChange={setTagsValue}
            placeholder="Добавить тег"
            value={tagsValue}
          />
        </div>
      </Stack>
    </PageSection>
  );
}

function ChoiceControlsCard(): ReactElement {
  const [radioValue, setRadioValue] = useState('warehouse');
  const [switchValue, setSwitchValue] = useState(true);
  const [checkboxValue, setCheckboxValue] = useState(true);

  return (
    <PageSection
      description="Choice controls должны совпадать по label rhythm, border states и focus behavior."
      title="2. Choice controls"
    >
      <Stack gap="md">
        <Checkbox
          checked={checkboxValue}
          data-testid="d2-checkbox"
          description="Checkbox использует общий border/focus contract."
          label="Разрешить быстрый ввод"
          onChange={(event) => setCheckboxValue(event.currentTarget.checked)}
        />
        <Checkbox
          data-testid="d2-checkbox-error"
          error="Нужно подтвердить выбор"
          label="Checkbox с ошибкой"
        />
        <Radio.Group
          data-testid="d2-radio-group"
          label="Режим отбора"
          onChange={setRadioValue}
          value={radioValue}
        >
          <Stack gap="xs" mt="xs">
            <Radio label="Склад" value="warehouse" />
            <Radio label="Поставщик" value="supplier" />
            <Radio label="Категория" value="category" />
          </Stack>
        </Radio.Group>
        <Switch
          checked={switchValue}
          data-testid="d2-switch"
          description="Switch использует tokenized track/thumb styling."
          label="Автоматически открывать picker"
          onChange={(event) => setSwitchValue(event.currentTarget.checked)}
        />
      </Stack>
    </PageSection>
  );
}

function NavigationChoiceCard(): ReactElement {
  const [segmentValue, setSegmentValue] = useState('week');
  const [tabValue, setTabValue] = useState<string | null>('buffer');

  return (
    <PageSection
      description="SegmentedControl и Tabs должны вести себя как выбор режима, а не как случайно стилизованные кнопки."
      title="3. Segments и tabs"
    >
      <Stack gap="md">
        <SegmentedControl
          data={segmentedData}
          data-testid="d2-segmented"
          onChange={setSegmentValue}
          value={segmentValue}
        />
        <Tabs data-testid="d2-tabs" onChange={setTabValue} value={tabValue}>
          <Tabs.List>
            <Tabs.Tab data-testid="d2-tab-buffer" value="buffer">
              Буфер
            </Tabs.Tab>
            <Tabs.Tab data-testid="d2-tab-scanner" value="scanner">
              Сканер
            </Tabs.Tab>
            <Tabs.Tab data-testid="d2-tab-settings" value="settings">
              Настройки
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel pt="sm" value="buffer">
            <Text c="dimmed" size="sm">
              Таб-панель для компактного route-adjacent выбора.
            </Text>
          </Tabs.Panel>
          <Tabs.Panel pt="sm" value="scanner">
            <Text c="dimmed" size="sm">
              Состояние scanner proof surface.
            </Text>
          </Tabs.Panel>
          <Tabs.Panel pt="sm" value="settings">
            <Text c="dimmed" size="sm">
              Состояние settings proof surface.
            </Text>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </PageSection>
  );
}

function BadgesAndPillsCard(): ReactElement {
  return (
    <PageSection
      description="Badge и chip-like surfaces должны оставаться компактными, читаемыми и не конфликтовать с intent colors."
      title="4. Badges и pills"
    >
      <Stack gap="md">
        <Stack gap="xs">
          <Text fw={700} size="sm">
            Badge sizes
          </Text>
          <Group gap="sm" wrap="wrap">
            <Badge data-testid="d2-badge-size-xs" size="xs">
              XS
            </Badge>
            <Badge data-testid="d2-badge-default" size="sm">
              SM
            </Badge>
            <Badge data-testid="d2-badge-size-md" size="md">
              MD
            </Badge>
          </Group>
        </Stack>
        <Group gap="sm" wrap="wrap">
          {badgeExamples.map((item) => (
            <Badge {...item} key={`${item.children}-${item.variant}`}>
              {item.children}
            </Badge>
          ))}
        </Group>
        <Stack gap="xs">
          <Text fw={700} size="sm">
            Pill sizes
          </Text>
          <Group gap="sm" wrap="wrap">
            <Pill data-testid="d2-pill-size-xs" size="xs">
              XS
            </Pill>
            <Pill data-testid="d2-pill-default" size="sm">
              SM
            </Pill>
            <Pill data-testid="d2-pill-size-md" size="md">
              MD
            </Pill>
          </Group>
        </Stack>
        <Group gap="sm" wrap="wrap">
          <Pill withRemoveButton>RFID-442</Pill>
          <Pill withRemoveButton>Manual</Pill>
        </Group>
      </Stack>
    </PageSection>
  );
}

function DateTimeCard(): ReactElement {
  const [dateValue, setDateValue] = useState<string | null>('2026-04-23');
  const [dateTimeValue, setDateTimeValue] = useState<string | null>(
    '2026-04-23T12:30'
  );
  const [timeValue, setTimeValue] = useState('09:45');

  return (
    <PageSection
      description="Mantine dates в проекте уже используются, поэтому canonical examples фиксируем прямо на /ui-kit."
      title="5. Date и time pickers"
    >
      <Stack gap="md">
        <DatePickerInput
          data-testid="d2-date-picker"
          description="Date picker наследует общий input contract."
          label="DatePickerInput"
          leftSection={<IconCalendar size={16} />}
          onChange={setDateValue}
          placeholder="Выберите дату"
          value={dateValue}
          valueFormat="DD.MM.YYYY"
        />
        <DateTimePicker
          data-testid="d2-datetime-picker"
          description="DateTimePicker используется в продукте и должен оставаться в том же visual language."
          label="DateTimePicker"
          onChange={setDateTimeValue}
          placeholder="Выберите дату и время"
          timePickerProps={{ withDropdown: true }}
          value={dateTimeValue}
          valueFormat="DD.MM.YYYY HH:mm"
        />
        <TimeInput
          data-testid="d2-time-input"
          description="TimeInput использует ту же control surface."
          label="TimeInput"
          leftSection={<IconClock size={16} />}
          onChange={(event) => setTimeValue(event.currentTarget.value)}
          value={timeValue}
        />
      </Stack>
    </PageSection>
  );
}

export function UiKitD2SelectionContent(): ReactElement {
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <SelectsCard />
        <ChoiceControlsCard />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <NavigationChoiceCard />
        <BadgesAndPillsCard />
      </SimpleGrid>

      <DateTimeCard />
    </Stack>
  );
}
