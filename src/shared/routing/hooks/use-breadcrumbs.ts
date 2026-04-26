import { useMatches } from 'react-router-dom';

import { asRouteHandle } from '@/shared/routing/lib/as-route-handle';

export type BreadcrumbItem = {
  pathname: string;
  label: string;
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const matches = useMatches();

  return matches.flatMap((match) => {
    const handle = asRouteHandle(match.handle);
    const { page, breadcrumbs } = handle ?? {};

    if (!page?.title) return [];

    const breadcrumbLabel = breadcrumbs?.label;
    const label =
      typeof breadcrumbLabel === 'function'
        ? breadcrumbLabel(match.params)
        : (breadcrumbLabel ?? page.title);

    return [{ pathname: match.pathname, label }];
  });
}
