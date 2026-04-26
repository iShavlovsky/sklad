import type { PropsWithChildren, ReactElement } from 'react';
import { Box, Group, Stack } from '@mantine/core';

import styles from './styles.module.css';

type BasePrimitiveProps = PropsWithChildren;
type PageContainerProps = BasePrimitiveProps & {
  scrollable?: boolean;
};

export function PageContainer({
  children,
  scrollable = true,
}: Readonly<PageContainerProps>): ReactElement {
  return (
    <Box
      className={`${styles.container} ${scrollable ? styles.scrollable : styles.locked} mobile-page-container`}
      component="div"
    >
      {children}
    </Box>
  );
}

export function FullPageContainer({
  children,
}: Readonly<BasePrimitiveProps>): ReactElement {
  return (
    <Box
      className={`${styles.fullContainer} full-page-container`}
      component="div"
    >
      {children}
    </Box>
  );
}

export function ShellInner({
  children,
}: Readonly<BasePrimitiveProps>): ReactElement {
  return (
    <Box
      className={`${styles.shellRail} mobile-shell__rail mobile-shell-inner`}
      component="div"
    >
      {children}
    </Box>
  );
}

export function PrimaryActionRow({
  children,
}: Readonly<Omit<BasePrimitiveProps, 'className'>>): ReactElement {
  return (
    <Group
      align="center"
      aria-label="Primary actions"
      className="mobile-page-primary-actions"
      component="section"
      gap="sm"
      mb="var(--sl-page-section-gap)"
      wrap="wrap"
    >
      {children}
    </Group>
  );
}

type SectionStackProps = BasePrimitiveProps & {
  fillHeight?: boolean;
};

export function SectionStack({
  children,
  fillHeight = false,
}: Readonly<SectionStackProps>): ReactElement {
  return (
    <Stack
      className="mobile-page-sections"
      gap="var(--sl-page-section-gap)"
      style={
        fillHeight
          ? { flex: '1 1 auto', minHeight: 0 }
          : { flex: '0 0 auto', minHeight: 'max-content' }
      }
    >
      {children}
    </Stack>
  );
}

type BottomSpacerProps = {
  compact?: boolean;
};

export function BottomSpacer({
  compact = false,
}: Readonly<BottomSpacerProps>): ReactElement {
  return (
    <Box
      aria-hidden="true"
      className={`${styles.bottomSpacer} ${compact ? styles.bottomSpacerCompact : ''} mobile-page-bottom-spacer`}
      component="div"
    />
  );
}
