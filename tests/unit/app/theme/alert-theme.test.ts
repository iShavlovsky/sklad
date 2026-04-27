import { describe, expect, it } from 'vitest';

import { alertTheme } from '../../../../src/app/theme/components/alert.theme.ts';

describe('alertTheme', () => {
  it('keeps alert icon in a fixed slot aligned with body content', () => {
    expect(alertTheme.styles?.wrapper).toMatchObject({
      alignItems: 'center',
    });
    expect(alertTheme.styles?.body).toMatchObject({
      gap: '0.125rem',
      minWidth: 0,
    });
    expect(alertTheme.styles?.icon).toMatchObject({
      display: 'grid',
      flex: '0 0 2rem',
      width: '2rem',
      height: '2rem',
      margin: 0,
      placeItems: 'center',
      justifyContent: 'center',
    });
  });
});
