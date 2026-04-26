import { useRouteMeta } from '@/shared/routing/hooks/use-route-meta';

export function RouteHead() {
  const meta = useRouteMeta();

  const title = meta?.head?.title ?? meta?.page?.title;
  const description = meta?.head?.description ?? meta?.page?.description;
  const robots = meta?.head?.robots;

  return (
    <>
      {title && <title>{title}</title>}
      {description && <meta content={description} name="description" />}
      {robots && <meta content={robots} name="robots" />}
    </>
  );
}
