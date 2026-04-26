import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  type CardProps,
  Group,
  Popover,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

interface PageSectionProps extends PropsWithChildren {
  badge?: string;
  description?: string;
  fillHeight?: boolean;
  help?: string;
  padding?: CardProps['padding'];
  title?: string;
  trailing?: ReactNode;
  unstyled?: boolean;
}

export function PageSection({
  badge,
  children,
  description,
  fillHeight = false,
  help,
  padding = 'sm',
  title,
  trailing,
  unstyled = false,
}: Readonly<PageSectionProps>): ReactElement {
  const hasHeaderContent = Boolean(badge || title || help || trailing);
  const headerControlSize = '1.5rem';
  const content = (
    <Stack
      gap="sm"
      style={
        fillHeight
          ? {
              flex: '1 1 auto',
              minHeight: 0,
            }
          : undefined
      }
    >
      {hasHeaderContent && (
        <Group align="center" justify="space-between" wrap="nowrap">
          <Stack flex={1} gap="0.25rem" miw={0}>
            {(badge || help || title) && (
              <Group align="center" gap="0.375rem" wrap="nowrap">
                {badge && (
                  <Badge
                    color="teal"
                    h={headerControlSize}
                    px="0.5rem"
                    radius="sm"
                    styles={{
                      label: {
                        fontSize: '0.625rem',
                      },
                      root: {
                        minHeight: headerControlSize,
                      },
                    }}
                    variant="light"
                  >
                    {badge}
                  </Badge>
                )}
                {title && (
                  <Title order={2} size="h4">
                    {title}
                  </Title>
                )}
                {help && (
                  <Popover
                    position="bottom-start"
                    shadow="md"
                    width="clamp(12rem, 50vw, 15rem)"
                    withArrow
                    withinPortal
                  >
                    <Popover.Target>
                      <Tooltip label="О разделе">
                        <ActionIcon
                          aria-label="О разделе"
                          className="page-section__help-trigger"
                          color="gray"
                          radius="xl"
                          size={headerControlSize}
                          variant="subtle"
                        >
                          <IconInfoCircle size={14} stroke={1.8} />
                        </ActionIcon>
                      </Tooltip>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text size="sm">{help}</Text>
                    </Popover.Dropdown>
                  </Popover>
                )}
              </Group>
            )}
            {description && (
              <Text c="dimmed" size="xs">
                {description}
              </Text>
            )}
          </Stack>
          {trailing && <Box flex="0 0 auto">{trailing}</Box>}
        </Group>
      )}
      {children}
    </Stack>
  );

  if (unstyled) {
    return (
      <Box
        className="page-section"
        style={
          fillHeight
            ? {
                display: 'flex',
                flex: '1 1 auto',
                flexDirection: 'column',
                minHeight: 0,
              }
            : undefined
        }
      >
        {content}
      </Box>
    );
  }

  return (
    <Card
      className="page-section"
      padding={padding}
      style={
        fillHeight
          ? {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
              minHeight: 0,
            }
          : undefined
      }
    >
      {content}
    </Card>
  );
}
