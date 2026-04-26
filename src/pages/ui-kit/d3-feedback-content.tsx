import type { ReactElement } from 'react';
import { useState } from 'react';
import {
  Accordion,
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Drawer,
  Fieldset,
  Group,
  Loader,
  LoadingOverlay,
  Menu,
  Modal,
  Notification,
  Paper,
  Popover,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconArrowRight,
  IconBell,
  IconBox,
  IconCheck,
  IconDots,
  IconEdit,
  IconEye,
  IconInfoCircle,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';

import { PageSection } from '@/shared/ui/page-section';

function ContainersCard(): ReactElement {
  return (
    <PageSection
      description="Paper and Card should share one container language with different content density."
      title="1. Paper and Card"
    >
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper data-testid="d3-paper-sample" p="lg">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={700}>Paper surface</Text>
              <Badge size="xs">Surface</Badge>
            </Group>
            <Text c="dimmed" size="sm">
              Base surface for section previews, statuses, and neutral content
              blocks.
            </Text>
          </Stack>
        </Paper>

        <Card data-testid="d3-card-sample" p="lg">
          <Card.Section inheritPadding py="sm" withBorder>
            <Group justify="space-between">
              <Text fw={700}>Card item</Text>
              <ActionIcon
                aria-label="Open card action"
                size="sm"
                variant="light"
              >
                <IconArrowRight />
              </ActionIcon>
            </Group>
          </Card.Section>
          <Text c="dimmed" mt="md" size="sm">
            Repeated item surface with section dividers and local actions.
          </Text>
        </Card>
      </SimpleGrid>
    </PageSection>
  );
}

function FieldsetCard(): ReactElement {
  return (
    <PageSection
      description="Fieldset groups related controls without a product-specific wrapper."
      title="2. Fieldset"
    >
      <Stack gap="md">
        <Fieldset data-testid="d3-fieldset" legend="Validation bundle">
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Group settings or steps with one shared legend, border, and inner
              spacing rhythm.
            </Text>
            <Text c="dimmed" size="sm">
              D3 keeps this pattern agnostic and theme-driven.
            </Text>
            <Group gap="sm">
              <Badge>Draft</Badge>
              <Badge color="green">Ready</Badge>
            </Group>
          </Stack>
        </Fieldset>

        <Accordion
          chevronPosition="right"
          data-testid="d3-accordion"
          variant="filled"
        >
          <Accordion.Item value="status">
            <Accordion.Control>Inline status details</Accordion.Control>
            <Accordion.Panel>
              <Text c="dimmed" size="sm">
                Accordion stays an inline expansion primitive and reuses the
                same container language.
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="notes">
            <Accordion.Control>Secondary notes</Accordion.Control>
            <Accordion.Panel>
              <Text c="dimmed" size="sm">
                It is valid for local expandable content, not as the default
                app-wide help pattern.
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </PageSection>
  );
}

function OverlayPreviewCard(): ReactElement {
  const [menuOpened, menuHandlers] = useDisclosure(false);
  const [compactPopoverOpened, compactPopoverHandlers] = useDisclosure(false);
  const [widePopoverOpened, widePopoverHandlers] = useDisclosure(false);
  const [modalSmOpened, modalSmHandlers] = useDisclosure(false);
  const [modalXlOpened, modalXlHandlers] = useDisclosure(false);
  const [drawerXsOpened, drawerXsHandlers] = useDisclosure(false);
  const [drawerMdOpened, drawerMdHandlers] = useDisclosure(false);
  const [menuAction, setMenuAction] = useState('View');

  return (
    <PageSection
      description="Menu, Tooltip, Popover, Modal, and Drawer should reuse one overlay language and expose clear size steps."
      title="3. Overlay previews"
    >
      <Stack gap="md">
        <Group gap="sm" wrap="wrap">
          <Tooltip label="Short helper for dense actions">
            <ActionIcon
              aria-label="Tooltip compact preview"
              data-testid="d3-tooltip-target-sm"
              size="sm"
              variant="light"
            >
              <IconInfoCircle />
            </ActionIcon>
          </Tooltip>

          <Tooltip
            label="Expanded helper text for wider contextual hints in dense operator flows."
            multiline
            position="top"
            w="clamp(12rem, 45vw, 13.75rem)"
          >
            <ActionIcon
              aria-label="Tooltip expanded preview"
              data-testid="d3-tooltip-target-lg"
              size="lg"
              variant="default"
            >
              <IconInfoCircle />
            </ActionIcon>
          </Tooltip>

          <Popover
            opened={compactPopoverOpened}
            onChange={compactPopoverHandlers.set}
            position="bottom-start"
            width="clamp(12rem, 45vw, 13.75rem)"
            withinPortal={false}
          >
            <Popover.Target>
              <Button
                data-testid="d3-popover-target"
                onClick={compactPopoverHandlers.toggle}
                variant="default"
              >
                Popover sm
              </Button>
            </Popover.Target>
            <Popover.Dropdown data-testid="d3-popover-dropdown">
              <Stack gap="xs">
                <Text fw={700} size="sm">
                  Compact help
                </Text>
                <Text c="dimmed" size="sm">
                  Short contextual hint.
                </Text>
              </Stack>
            </Popover.Dropdown>
          </Popover>

          <Popover
            opened={widePopoverOpened}
            onChange={widePopoverHandlers.set}
            position="bottom-start"
            width="clamp(14rem, 62vw, 20rem)"
            withinPortal={false}
          >
            <Popover.Target>
              <Button
                data-testid="d3-popover-target-wide"
                onClick={widePopoverHandlers.toggle}
                variant="default"
              >
                Popover lg
              </Button>
            </Popover.Target>
            <Popover.Dropdown data-testid="d3-popover-dropdown-wide">
              <Stack gap="xs">
                <Text fw={700} size="sm">
                  Extended help
                </Text>
                <Text c="dimmed" size="sm">
                  Medium-size helper without leaving the current surface and
                  with enough width for two-line supporting text.
                </Text>
              </Stack>
            </Popover.Dropdown>
          </Popover>

          <Menu
            opened={menuOpened}
            onChange={menuHandlers.set}
            position="bottom-end"
            transitionProps={{
              duration: 160,
              timingFunction: 'var(--ease-standard)',
              transition: 'rotate-right',
            }}
            withinPortal={false}
          >
            <Menu.Target>
              <ActionIcon
                aria-label="Menu preview"
                data-testid="d3-menu-target"
                size="lg"
                variant="default"
              >
                <IconDots />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown data-testid="d3-menu-dropdown">
              <Menu.Label>Actions</Menu.Label>
              <Menu.Item
                leftSection={<IconEye />}
                onClick={() => setMenuAction('View')}
              >
                View
              </Menu.Item>
              <Menu.Item
                leftSection={<IconEdit />}
                onClick={() => setMenuAction('Edit')}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash />}
                onClick={() => setMenuAction('Delete')}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Button data-testid="d3-modal-target" onClick={modalSmHandlers.open}>
            Modal sm
          </Button>

          <Button
            data-testid="d3-modal-target-xl"
            onClick={modalXlHandlers.open}
            variant="default"
          >
            Modal xl
          </Button>

          <Button
            data-testid="d3-drawer-target-xs"
            onClick={drawerXsHandlers.open}
            variant="default"
          >
            Drawer xs
          </Button>

          <Button
            data-testid="d3-drawer-target-md"
            onClick={drawerMdHandlers.open}
            variant="default"
          >
            Drawer md
          </Button>
        </Group>

        <Modal
          onClose={modalSmHandlers.close}
          opened={modalSmOpened}
          size="sm"
          title="Preview modal"
          withinPortal={false}
        >
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Compact modal preview
            </Text>
            <Text c="dimmed" size="sm">
              Small decision or acknowledgement flow.
            </Text>
            <Group justify="flex-end">
              <Button onClick={modalSmHandlers.close} variant="default">
                Close
              </Button>
              <Button leftSection={<IconCheck />}>Confirm</Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          onClose={modalXlHandlers.close}
          opened={modalXlOpened}
          size="xl"
          title="Large preview modal"
          withinPortal={false}
        >
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Large modal preview
            </Text>
            <Text c="dimmed" size="sm">
              Wider supporting context for flow help, comparison, or denser form
              review before commit.
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <Paper p="sm" withBorder>
                <Text size="sm">Summary block</Text>
              </Paper>
              <Paper p="sm" withBorder>
                <Text size="sm">Secondary details</Text>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Modal>

        <Drawer
          onClose={drawerXsHandlers.close}
          opened={drawerXsOpened}
          position="right"
          size="xs"
          title="Compact drawer"
          withinPortal={false}
        >
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Narrow utility drawer
            </Text>
            <Text c="dimmed" size="sm">
              Useful for short contextual tools or status sidecars.
            </Text>
          </Stack>
        </Drawer>

        <Drawer
          onClose={drawerMdHandlers.close}
          opened={drawerMdOpened}
          position="right"
          size="md"
          title="Standard drawer"
          withinPortal={false}
        >
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Standard drawer preview
            </Text>
            <Text c="dimmed" size="sm">
              Wider side panel for editing or denser contextual operations
              without leaving the page.
            </Text>
          </Stack>
        </Drawer>

        <Paper data-testid="d3-overlay-state" p="sm" withBorder>
          <Text c="dimmed" size="sm">
            Last overlay action:{' '}
            <Text component="span" fw={700} inherit>
              {menuAction}
            </Text>
          </Text>
        </Paper>
      </Stack>
    </PageSection>
  );
}

function FeedbackCard(): ReactElement {
  const [alertVisible, alertHandlers] = useDisclosure(true);
  const [notificationKind, setNotificationKind] = useState<
    'success' | 'loading'
  >('success');

  return (
    <PageSection
      description="Alert and Notification cover static and transient feedback patterns."
      title="4. Alerts and notifications"
    >
      <Stack gap="md">
        <Group gap="sm">
          <Button
            data-testid="d3-toggle-alert"
            onClick={alertHandlers.toggle}
            size="xs"
            variant="default"
          >
            Toggle alert
          </Button>
          <Button
            data-testid="d3-feedback-success"
            onClick={() => setNotificationKind('success')}
            size="xs"
            variant={notificationKind === 'success' ? 'filled' : 'default'}
          >
            Success
          </Button>
          <Button
            data-testid="d3-feedback-loading"
            onClick={() => setNotificationKind('loading')}
            size="xs"
            variant={notificationKind === 'loading' ? 'filled' : 'default'}
          >
            Loading
          </Button>
        </Group>

        {alertVisible && (
          <Alert
            color="blue"
            data-testid="d3-alert-info"
            icon={<IconInfoCircle />}
            title="Information"
            variant="light"
          >
            Static system message for a section or page.
          </Alert>
        )}
        <Alert
          color="red"
          data-testid="d3-alert-error"
          icon={<IconAlertCircle />}
          title="Sync issue"
          variant="light"
        >
          Error feedback stays visible but uses the same container language.
        </Alert>
        {notificationKind === 'success' ? (
          <Notification
            color="green"
            data-testid="d3-notification-success"
            icon={<IconCheck />}
            title="Saved"
          >
            Changes are available locally and offline.
          </Notification>
        ) : (
          <Notification
            color="blue"
            data-testid="d3-notification-loading"
            loaderProps={{ type: 'dots' }}
            loading
            title="Refreshing data"
          >
            Please wait while the local snapshot is updated.
          </Notification>
        )}
      </Stack>
    </PageSection>
  );
}

function LoadingStatesCard(): ReactElement {
  const [overlayVisible, overlayHandlers] = useDisclosure(true);
  const [showSkeleton, skeletonHandlers] = useDisclosure(true);

  return (
    <PageSection
      description="Loader, Skeleton, and LoadingOverlay cover distinct pending roles."
      title="5. Loading states"
    >
      <Stack gap="md">
        <Group gap="sm">
          <Button
            data-testid="d3-toggle-overlay"
            onClick={overlayHandlers.toggle}
            size="xs"
            variant="default"
          >
            Toggle overlay
          </Button>
          <Button
            data-testid="d3-toggle-skeleton"
            onClick={skeletonHandlers.toggle}
            size="xs"
            variant="default"
          >
            Toggle skeleton
          </Button>
        </Group>

        <Group gap="lg" wrap="wrap">
          <Stack align="center" gap="xs">
            <Loader data-testid="d3-loader-sm" size="sm" type="dots" />
            <Text c="dimmed" size="xs">
              Dots
            </Text>
          </Stack>
          <Stack align="center" gap="xs">
            <Loader
              color="info"
              data-testid="d3-loader-lg"
              size="lg"
              type="bars"
            />
            <Text c="dimmed" size="xs">
              Bars
            </Text>
          </Stack>
          <Stack align="center" gap="xs">
            <Loader
              color="success"
              data-testid="d3-loader-xl"
              size="xl"
              type="oval"
            />
            <Text c="dimmed" size="xs">
              Oval
            </Text>
          </Stack>
        </Group>

        {showSkeleton ? (
          <Stack data-testid="d3-skeleton-block" gap="xs">
            <Skeleton animate height="1rem" radius="xl" />
            <Skeleton animate height="1rem" radius="xl" width="82%" />
            <Skeleton animate height="5.5rem" radius="md" />
          </Stack>
        ) : (
          <Paper data-testid="d3-skeleton-content" p="md" withBorder>
            <Text size="sm">Loaded content preview</Text>
          </Paper>
        )}

        <Box pos="relative">
          <Paper data-testid="d3-loading-overlay-host" p="lg">
            <Stack gap="xs">
              <Text fw={700} size="sm">
                Blocking state preview
              </Text>
              <Text c="dimmed" size="sm">
                Overlay blocks only the local section or form while work is
                pending.
              </Text>
              <Text c="dimmed" data-testid="d3-loading-overlay-state" size="sm">
                Overlay state: {overlayVisible ? 'visible' : 'hidden'}
              </Text>
            </Stack>
          </Paper>
          <LoadingOverlay
            data-testid="d3-loading-overlay"
            loaderProps={{ type: 'dots' }}
            visible={overlayVisible}
            zIndex={5}
          />
        </Box>
      </Stack>
    </PageSection>
  );
}

function EmptyStateCard(): ReactElement {
  return (
    <PageSection
      description="Empty state stays compact: one signal, one short message, one main action."
      title="6. Empty state"
    >
      <Paper data-testid="d3-empty-state" p="xl">
        <Stack align="center" gap="sm">
          <ThemeIcon color="brand" radius="xl" size="3.5rem" variant="light">
            <IconPackage size={28} />
          </ThemeIcon>
          <Text fw={700}>No items yet</Text>
          <Text c="dimmed" size="sm" ta="center">
            Create the first record or import data to populate this area.
          </Text>
          <Group gap="sm">
            <Button leftSection={<IconPlus />}>Create</Button>
            <Button leftSection={<IconRefresh />} variant="default">
              Refresh
            </Button>
          </Group>
        </Stack>
      </Paper>
    </PageSection>
  );
}

function SurfaceNotesCard(): ReactElement {
  return (
    <PageSection
      description="D3 fixes feedback and container language, not page-specific business UI."
      title="7. Notes"
    >
      <Stack gap="xs">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon color="blue" radius="xl" size="sm" variant="light">
            <IconBell size={14} />
          </ThemeIcon>
          <Text size="sm">
            `Notification` and `Alert` stay as agnostic patterns over Mantine
            primitives.
          </Text>
        </Group>
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon color="green" radius="xl" size="sm" variant="light">
            <IconBox size={14} />
          </ThemeIcon>
          <Text size="sm">
            `Paper` and `Card` define section and repeated-item container
            language.
          </Text>
        </Group>
      </Stack>
    </PageSection>
  );
}

export function UiKitD3FeedbackContent(): ReactElement {
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <ContainersCard />
        <FieldsetCard />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <OverlayPreviewCard />
        <FeedbackCard />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
        <LoadingStatesCard />
        <EmptyStateCard />
      </SimpleGrid>

      <SurfaceNotesCard />
    </Stack>
  );
}
