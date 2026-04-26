import { Fragment, type ReactElement, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AppOverlayHost } from '@/features/navigation/ui/app-overlay-host';
import { MobileShell } from '@/features/navigation/ui/mobile-shell';

import { RootRouteFallback } from './root-route-fallback';

export function RootLayout(): ReactElement {
  return (
    <Fragment>
      <MobileShell>
        <Suspense fallback={<RootRouteFallback />}>
          <Outlet />
        </Suspense>
      </MobileShell>
      <AppOverlayHost />
    </Fragment>
  );
}

export { RootRouteFallback } from './root-route-fallback';
