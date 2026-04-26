import { createHashRouter } from 'react-router-dom';

import { buildRouteObjects } from '@/shared/routing/lib/build-route-objects';

import { appRouteTree } from '../tree/app-route-tree';

export const appRouter = createHashRouter(buildRouteObjects(appRouteTree));
