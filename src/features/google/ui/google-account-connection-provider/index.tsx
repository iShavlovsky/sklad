import type { ReactElement, ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { GoogleAccountConnectionContext } from '../../hooks/use-google-account-connection';
import {
  useConfiguredGoogleAccountConnectionValue,
  useUnconfiguredGoogleAccountConnectionValue,
} from '../../hooks/use-google-account-connection-value';
import { resolveGoogleClientId } from '../../model/google-client-config';

function ConfiguredGoogleAccountConnectionProvider({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  const value = useConfiguredGoogleAccountConnectionValue();

  return (
    <GoogleAccountConnectionContext.Provider value={value}>
      {children}
    </GoogleAccountConnectionContext.Provider>
  );
}

function UnconfiguredGoogleAccountConnectionProvider({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  const value = useUnconfiguredGoogleAccountConnectionValue();

  return (
    <GoogleAccountConnectionContext.Provider value={value}>
      {children}
    </GoogleAccountConnectionContext.Provider>
  );
}

export function GoogleAccountConnectionProvider({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  const clientId = resolveGoogleClientId().trim();

  if (!clientId) {
    return (
      <UnconfiguredGoogleAccountConnectionProvider>
        {children}
      </UnconfiguredGoogleAccountConnectionProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ConfiguredGoogleAccountConnectionProvider>
        {children}
      </ConfiguredGoogleAccountConnectionProvider>
    </GoogleOAuthProvider>
  );
}
