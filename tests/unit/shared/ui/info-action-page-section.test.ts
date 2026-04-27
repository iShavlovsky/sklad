/* eslint-disable react/no-unused-prop-types */
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MockComponentProps = {
  children?: ReactNode;
};

type MockActionIconProps = MockComponentProps & {
  'aria-expanded'?: boolean;
  'aria-label'?: string;
  className?: string;
  component?: string;
  onClick?: (event: {
    preventDefault: () => void;
    stopPropagation: () => void;
  }) => void;
  role?: string;
  size?: string;
  type?: string;
};

type MockPopoverProps = MockComponentProps & {
  opened?: boolean;
  position?: string;
  width?: string;
  withinPortal?: boolean;
  onChange?: (opened: boolean) => void;
};

type MockDropdownProps = MockComponentProps & {
  'data-testid'?: string;
  style?: Record<string, string>;
};

const captured = vi.hoisted(() => ({
  actionIcons: [] as MockActionIconProps[],
  dropdowns: [] as MockDropdownProps[],
  popovers: [] as MockPopoverProps[],
}));

function passthrough({ children }: MockComponentProps): ReactNode {
  return children ?? null;
}

vi.mock('@mantine/core', () => {
  const Popover = (props: MockPopoverProps): ReactNode => {
    captured.popovers.push(props);
    return props.children ?? null;
  };
  Popover.Target = passthrough;
  Popover.Dropdown = (props: MockDropdownProps): ReactNode => {
    captured.dropdowns.push(props);
    return props.children ?? null;
  };

  return {
    ActionIcon: (props: MockActionIconProps): ReactNode => {
      captured.actionIcons.push(props);
      return props.children ?? null;
    },
    Badge: passthrough,
    Box: passthrough,
    Card: passthrough,
    Group: passthrough,
    Popover,
    Stack: passthrough,
    Text: passthrough,
    Title: passthrough,
  };
});

vi.mock('@tabler/icons-react', () => ({
  IconInfoCircle: (): null => null,
}));

import { InfoAction } from '../../../../src/shared/ui/info-action/index.tsx';
import { PageSection } from '../../../../src/shared/ui/page-section/index.tsx';

describe('InfoAction and PageSection composition', () => {
  beforeEach(() => {
    captured.actionIcons.length = 0;
    captured.dropdowns.length = 0;
    captured.popovers.length = 0;
  });

  it('wires InfoAction as an accessible popover trigger with bounded content', () => {
    renderToStaticMarkup(
      createElement(InfoAction, {
        description: 'Contextual help',
        dropdownAttributes: {
          'data-testid': 'info-dropdown',
        },
        label: 'Open help',
        opened: true,
      })
    );

    expect(captured.actionIcons.at(-1)).toMatchObject({
      'aria-expanded': true,
      'aria-label': 'Open help',
      type: 'button',
    });
    expect(captured.popovers.at(-1)).toMatchObject({
      opened: true,
      position: 'bottom-end',
      width: 'min(18rem, calc(100vw - 2rem))',
      withinPortal: true,
    });
    expect(captured.dropdowns.at(-1)).toMatchObject({
      'data-testid': 'info-dropdown',
      style: expect.objectContaining({
        maxWidth: 'calc(100vw - 1rem)',
        overflowWrap: 'break-word',
      }),
    });
  });

  it('supports non-button triggers without losing click guards', () => {
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    renderToStaticMarkup(
      createElement(InfoAction, {
        description: 'Accordion-safe help',
        preventDefault: true,
        stopPropagation: true,
        triggerElement: 'span',
      })
    );

    const trigger = captured.actionIcons.at(-1);

    expect(trigger).toMatchObject({
      component: 'span',
      role: 'button',
    });

    trigger?.onClick?.({ preventDefault, stopPropagation });

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(stopPropagation).toHaveBeenCalledOnce();
  });

  it('renders PageSection help through the shared InfoAction contract', () => {
    renderToStaticMarkup(
      createElement(
        PageSection,
        {
          badge: 'Meta',
          description: 'Short context',
          help: 'Section help text',
          title: 'Section title',
          trailing: createElement('span', null, 'Trailing'),
        },
        'Body'
      )
    );

    expect(captured.actionIcons.at(-1)).toMatchObject({
      'aria-label': 'О разделе',
      className: 'page-section__help-trigger',
      size: '1.5rem',
    });
    expect(captured.popovers.at(-1)).toMatchObject({
      position: 'bottom-start',
      width: 'clamp(12rem, 50vw, 15rem)',
    });
  });
});
