import type { ReactElement } from 'react';
import { Box, Text } from '@mantine/core';

import { getEntityIconToneStyle } from '@/shared/ui/entity-icon-tones';

import type { BottomNavigationItemConfig } from './bottom-navigation.types';

import styles from './styles.module.css';

type BottomNavigationItemContentProps = Pick<
  BottomNavigationItemConfig,
  'ariaLabel' | 'icon' | 'id' | 'indicator' | 'label' | 'tone'
> & {
  active?: boolean;
  focusVisible?: boolean;
  pressed?: boolean;
};

export function BottomNavigationItemContent({
  active = false,
  ariaLabel,
  focusVisible = false,
  icon: Icon,
  id,
  indicator = false,
  label,
  pressed = false,
  tone,
}: Readonly<BottomNavigationItemContentProps>): ReactElement {
  return (
    <Box
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={styles.item}
      data-active={active || undefined}
      data-focus-visible={focusVisible || undefined}
      data-indicator={indicator || undefined}
      data-item-id={id}
      data-pressed={pressed || undefined}
    >
      {indicator && <Box aria-hidden="true" className={styles.indicator} />}
      <Box className={styles.itemInner}>
        {Icon && (
          <Box
            aria-hidden="true"
            className={styles.icon}
            style={tone ? getEntityIconToneStyle(tone) : undefined}
          >
            <Icon size={20} stroke={1.75} />
          </Box>
        )}
        <Text className={styles.label} component="span" size="xs">
          {label}
        </Text>
      </Box>
    </Box>
  );
}
