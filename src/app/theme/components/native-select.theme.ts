import type { MantineThemeComponents } from '@mantine/core';

import {
  controlDescriptionStyles,
  controlErrorStyles,
  controlLabelStyles,
  filledInputStyles,
  inputSectionStyles,
} from '@/app/theme/components/shared';
import classes from '@/app/theme/components/shared-input.theme.module.css';

export const nativeSelectTheme: MantineThemeComponents['NativeSelect'] = {
  defaultProps: {
    radius: 'md',
    size: 'md',
    variant: 'filled',
  },
  classNames: {
    input: `${classes.input} ${classes.nativeSelectInput}`,
    section: classes.inputSection,
  },
  styles: {
    input: filledInputStyles,
    label: controlLabelStyles,
    description: controlDescriptionStyles,
    error: controlErrorStyles,
    section: inputSectionStyles,
  },
};
