import type { AppRouteTree } from './route-contracts';

type ExtractChildren<TNode> = TNode extends { children: infer TChildren }
  ? TChildren extends AppRouteTree
    ? TChildren
    : never
  : never;

type Join<L extends string, R extends string> = `${L}.${R}`;

export type RouteIdOf<TTree extends AppRouteTree> = {
  [K in keyof TTree & string]: ExtractChildren<TTree[K]> extends never
    ? K
    : K | Join<K, RouteIdOf<ExtractChildren<TTree[K]>>>;
}[keyof TTree & string];
