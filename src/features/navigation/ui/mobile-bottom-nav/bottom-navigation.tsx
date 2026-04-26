import type { ReactElement } from 'react';
import { Box, SegmentedControl } from '@mantine/core';

import type { BottomNavigationProps } from './bottom-navigation.types';
import { BottomNavigationItemContent } from './bottom-navigation-item';

import styles from './styles.module.css';

export function BottomNavigation({
  ariaLabel,
  focusVisibleId,
  items,
  onChange,
  pressedId,
  value,
}: Readonly<BottomNavigationProps>): ReactElement {
  return (
    <Box
      aria-label={ariaLabel}
      className={styles.nav}
      component="nav"
      role="navigation"
    >
      <SegmentedControl
        className={`${styles.dock} mobile-bottom-nav__dock`}
        classNames={{
          control: styles.control,
          indicator: `${styles.segmentedIndicator} mobile-bottom-nav__indicator`,
          innerLabel: styles.innerLabel,
          input: styles.input,
          label: styles.segmentedLabel,
          root: styles.segmentedRoot,
        }}
        data={items.map((item) => ({
          disabled: item.disabled,
          label: (
            <BottomNavigationItemContent
              active={value === item.id}
              ariaLabel={item.ariaLabel}
              focusVisible={focusVisibleId === item.id}
              icon={item.icon}
              id={item.id}
              indicator={item.indicator}
              label={item.label}
              pressed={pressedId === item.id}
              tone={item.tone}
            />
          ),
          value: item.id,
        }))}
        fullWidth
        onChange={onChange}
        transitionDuration={180}
        value={value}
      />
    </Box>
  );
}
