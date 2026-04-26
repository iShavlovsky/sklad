import type { AppRouteTree } from './route-contracts';

type ExtractChildren<TNode> = TNode extends { children: infer TChildren }
  ? TChildren extends AppRouteTree
    ? TChildren
    : never
  : never;

export type RouteNodeById<
  TTree extends AppRouteTree,
  TRouteId extends string,
> = TRouteId extends `${infer Head}.${infer Tail}`
  ? Head extends keyof TTree & string
    ? RouteNodeById<ExtractChildren<TTree[Head]>, Tail>
    : never
  : TRouteId extends keyof TTree & string
    ? TTree[TRouteId]
    : never;
