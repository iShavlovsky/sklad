import type { ReactElement } from 'react';
import { Accordion, Group, Text } from '@mantine/core';

import { getAccordionSizeStyle } from '@/app/theme/components/accordion.theme';

import { FieldInfoTrigger } from '@/features/form-controls/support/field-info-trigger';

import { FORM_SECTION_ACCORDION_TRANSITION_MS } from './form-section-accordion.constants.ts';
import type { FormSectionAccordionProps } from './form-section-accordion.types.ts';

export function FormSectionAccordion({
  children,
  helpKey,
  title,
  value,
}: Readonly<FormSectionAccordionProps>): ReactElement {
  return (
    <Accordion.Item data-overlay-boundary value={value}>
      <Accordion.Control>
        <Group gap={6} justify="space-between" wrap="nowrap">
          <Text fw={700} size="xs">
            {title}
          </Text>
          {helpKey ? (
            <FieldInfoTrigger
              contentKey={helpKey}
              size="xs"
              triggerElement="span"
            />
          ) : null}
        </Group>
      </Accordion.Control>
      <Accordion.Panel>{children}</Accordion.Panel>
    </Accordion.Item>
  );
}

export const formSectionAccordionProps = {
  style: getAccordionSizeStyle('xxs'),
  transitionDuration: FORM_SECTION_ACCORDION_TRANSITION_MS,
} as const;
