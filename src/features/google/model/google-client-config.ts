declare global {
  interface Window {
    __SKLAD_GOOGLE_CLIENT_ID__?: string;
  }
}

export function resolveGoogleClientId(): string {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ??
    (typeof window !== 'undefined' ? window.__SKLAD_GOOGLE_CLIENT_ID__ : '') ??
    ''
  );
}
