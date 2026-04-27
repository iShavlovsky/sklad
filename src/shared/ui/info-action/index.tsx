import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  ActionIcon,
  type ActionIconProps,
  Popover,
  type PopoverProps,
  Text,
  type TextProps,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

type InfoActionProps = {
  description: ReactNode;
  actionProps?: Omit<ActionIconProps, 'children'>;
  contentSize?: TextProps['size'];
  dropdownAttributes?: Record<`data-${string}`, string | undefined>;
  dropdownStyle?: CSSProperties;
  iconLabel?: string;
  label?: string;
  opened?: boolean;
  position?: PopoverProps['position'];
  preventDefault?: boolean;
  size?: ActionIconProps['size'];
  stopPropagation?: boolean;
  triggerElement?: 'button' | 'span';
  width?: PopoverProps['width'];
  withinPortal?: boolean;
  onActionClick?: (
    event: MouseEvent<HTMLButtonElement | HTMLSpanElement>
  ) => void;
  onOpenedChange?: (opened: boolean) => void;
};

const DEFAULT_INFO_LABEL = 'О разделе';
const DEFAULT_INFO_WIDTH = 'min(18rem, calc(100vw - 2rem))';

export function InfoAction({
  description,
  actionProps,
  contentSize = 'sm',
  dropdownAttributes,
  dropdownStyle,
  iconLabel = DEFAULT_INFO_LABEL,
  label = iconLabel,
  opened,
  position = 'bottom-end',
  preventDefault = false,
  size = 'sm',
  stopPropagation = false,
  triggerElement = 'button',
  width = DEFAULT_INFO_WIDTH,
  withinPortal = true,
  onActionClick,
  onOpenedChange,
}: Readonly<InfoActionProps>): ReactElement {
  const iconSize = size === 'xs' ? 14 : 16;
  const triggerProps =
    triggerElement === 'span'
      ? ({
          component: 'span',
          role: 'button',
          tabIndex: 0,
        } as const)
      : ({ type: 'button' } as const);

  const handleClick = (
    event: MouseEvent<HTMLButtonElement | HTMLSpanElement>
  ): void => {
    if (preventDefault) {
      event.preventDefault();
    }

    if (stopPropagation) {
      event.stopPropagation();
    }

    onActionClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>): void => {
    if (triggerElement !== 'span') {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    if (preventDefault) {
      event.preventDefault();
    }

    if (stopPropagation) {
      event.stopPropagation();
    }

    onOpenedChange?.(!opened);
  };

  return (
    <Popover
      middlewares={{ flip: true, shift: { padding: 8 } }}
      offset={8}
      onChange={onOpenedChange}
      opened={opened}
      position={position}
      shadow="md"
      width={width}
      withArrow
      withinPortal={withinPortal}
      zIndex={400}
    >
      <Popover.Target>
        <ActionIcon
          aria-label={label}
          color="gray"
          radius="xl"
          size={size}
          variant="subtle"
          {...triggerProps}
          {...actionProps}
          aria-expanded={opened}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <IconInfoCircle size={iconSize} stroke={1.8} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown
        p="xs"
        style={{
          maxWidth: 'calc(100vw - 1rem)',
          overflowWrap: 'break-word',
          ...dropdownStyle,
        }}
        {...dropdownAttributes}
      >
        <Text size={contentSize}>{description}</Text>
      </Popover.Dropdown>
    </Popover>
  );
}
