import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActionIcon, Box, Popover, Text, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

import { getFormInfoContent } from '../field-metadata/field-info-content.ts';
import {
  getFieldHelpContent,
  hasFieldHelp,
} from '../field-metadata/field-metadata.helpers.ts';

import { FIELD_INFO_TRIGGER_ICON_LABEL } from './field-info-trigger.constants.ts';
import type {
  FieldInfoTriggerProps,
  FieldLabelProps,
} from './field-info-trigger.types.ts';

const VIEWPORT_GUTTER_PX = 16;
const DROPDOWN_INSET_PX = 12;

function getBoundaryElement(node: HTMLElement | null): HTMLElement | null {
  if (!node) {
    return null;
  }

  return (
    node.closest<HTMLElement>('[data-overlay-boundary]') ??
    node.closest<HTMLElement>('form') ??
    node.parentElement
  );
}

function getDropdownWidth(boundaryElement: HTMLElement | null): number {
  if (typeof window === 'undefined') {
    return 280;
  }

  const viewportWidth = Math.max(0, window.innerWidth - VIEWPORT_GUTTER_PX);
  const boundaryWidth =
    boundaryElement?.getBoundingClientRect().width ?? viewportWidth;

  return Math.max(
    0,
    Math.min(boundaryWidth, viewportWidth) - DROPDOWN_INSET_PX
  );
}

export function FieldInfoTrigger({
  content,
  contentKey,
  size = 'sm',
  surface = 'popover',
  triggerElement = 'button',
}: Readonly<FieldInfoTriggerProps>): ReactElement {
  const [opened, setOpened] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState(280);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const iconSize = size === 'xs' ? 14 : 16;
  const popoverTextSize = size === 'xs' ? 'xs' : 'sm';
  const resolvedContent =
    typeof contentKey === 'string' ? getFormInfoContent(contentKey) : content;

  useEffect(() => {
    const boundaryElement = getBoundaryElement(wrapperRef.current);

    const updateWidth = (): void => {
      setDropdownWidth(getDropdownWidth(boundaryElement));
    };

    updateWidth();

    if (!boundaryElement || typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(boundaryElement);
    window.addEventListener('resize', updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const helpKeyAttributes = useMemo(
    () =>
      typeof contentKey === 'string'
        ? {
            'data-help-key': contentKey,
            'data-help-trigger-key': contentKey,
          }
        : {},
    [contentKey]
  );
  const toggleOpened = (): void => {
    setOpened((currentValue) => !currentValue);
  };
  const handleTriggerClick = (
    event: MouseEvent<HTMLButtonElement | HTMLSpanElement>
  ): void => {
    event.preventDefault();
    event.stopPropagation();
    toggleOpened();
  };
  const handleSpanTriggerKeyDown = (
    event: KeyboardEvent<HTMLSpanElement>
  ): void => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    toggleOpened();
  };
  const trigger = (
    <Box component="span">
      {triggerElement === 'span' ? (
        <ActionIcon
          aria-expanded={opened}
          aria-label={FIELD_INFO_TRIGGER_ICON_LABEL}
          c="dimmed"
          component="span"
          onClick={handleTriggerClick}
          onKeyDown={handleSpanTriggerKeyDown}
          radius="xl"
          role="button"
          size={size}
          tabIndex={0}
          variant="subtle"
        >
          <IconInfoCircle size={iconSize} stroke={1.8} />
        </ActionIcon>
      ) : (
        <ActionIcon
          aria-expanded={opened}
          aria-label={FIELD_INFO_TRIGGER_ICON_LABEL}
          c="dimmed"
          onClick={handleTriggerClick}
          radius="xl"
          size={size}
          type="button"
          variant="subtle"
        >
          <IconInfoCircle size={iconSize} stroke={1.8} />
        </ActionIcon>
      )}
    </Box>
  );

  if (surface === 'tooltip') {
    return (
      <Box component="span" ref={wrapperRef} {...helpKeyAttributes}>
        <Tooltip
          events={{ focus: false, hover: false, touch: false }}
          label={<Text size="xs">{resolvedContent}</Text>}
          middlewares={{ flip: true, shift: { padding: 8 } }}
          multiline
          offset={8}
          opened={opened}
          position="top"
          w={dropdownWidth}
          withinPortal
          zIndex={400}
        >
          {trigger}
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box component="span" ref={wrapperRef} {...helpKeyAttributes}>
      <Popover
        middlewares={{ flip: true, shift: { padding: 8 } }}
        offset={8}
        onChange={setOpened}
        opened={opened}
        position="bottom"
        shadow="md"
        withinPortal
        zIndex={400}
      >
        <Popover.Target>
          <Tooltip label={FIELD_INFO_TRIGGER_ICON_LABEL}>{trigger}</Tooltip>
        </Popover.Target>
        <Popover.Dropdown
          data-help-dropdown-key={contentKey}
          data-testid={
            typeof contentKey === 'string'
              ? `field-info-dropdown-${contentKey}`
              : undefined
          }
          p="xs"
          style={{
            maxWidth: `calc(100vw - ${VIEWPORT_GUTTER_PX}px)`,
            overflowWrap: 'break-word',
            width: `${dropdownWidth}px`,
          }}
        >
          <Text size={popoverTextSize}>{resolvedContent}</Text>
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
}

export function FieldLabel({
  metadata,
}: Readonly<FieldLabelProps>): ReactElement {
  return (
    <Box
      component="span"
      style={{
        alignItems: 'center',
        display: 'inline-flex',
        flexWrap: 'nowrap',
        gap: '0.25rem',
        maxWidth: '100%',
        verticalAlign: 'middle',
      }}
    >
      <Box component="span" style={{ minWidth: 0 }}>
        {metadata.label}
      </Box>
      {metadata.required ? (
        <Text c="var(--sl-app-danger)" component="span" fw={700} inherit span>
          *
        </Text>
      ) : null}
      {hasFieldHelp(metadata) ? (
        <FieldInfoTrigger
          content={getFieldHelpContent(metadata)}
          contentKey={metadata.helpKey}
          size="xs"
          surface={
            metadata.helpKey === 'field.codes.list' ? 'tooltip' : 'popover'
          }
        />
      ) : null}
    </Box>
  );
}
