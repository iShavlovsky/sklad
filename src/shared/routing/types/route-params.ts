import type { AppRouteNode, AppRouteTree } from './route-contracts';
import type { RouteIdOf } from './route-ids';

type ExtractChildren<TNode> = TNode extends { children: infer TChildren }
  ? TChildren extends AppRouteTree
    ? TChildren
    : never
  : never;

type MergePaths<P extends string, C extends string> = P extends ''
  ? C extends ''
    ? '/'
    : C extends '/'
      ? '/'
      : `/${C}`
  : P extends '/'
    ? C extends ''
      ? '/'
      : C extends '/'
        ? '/'
        : `/${C}`
    : C extends ''
      ? P
      : `${P}/${C}`;

type NormalizePath<P extends string> = P extends `${infer A}//${infer B}`
  ? NormalizePath<`${A}/${B}`>
  : P;

type ResolveFullPathById<
  TTree extends AppRouteTree,
  TRouteId extends string,
  TAcc extends string = '',
> = TRouteId extends `${infer Head}.${infer Tail}`
  ? Head extends keyof TTree & string
    ? TTree[Head] extends AppRouteNode
      ? ResolveFullPathById<
          ExtractChildren<TTree[Head]>,
          Tail,
          NormalizePath<MergePaths<TAcc, TTree[Head]['path']>>
        >
      : never
    : never
  : TRouteId extends keyof TTree & string
    ? TTree[TRouteId] extends AppRouteNode
      ? NormalizePath<MergePaths<TAcc, TTree[TRouteId]['path']>>
      : never
    : never;

type ExtractParamNames<TPath extends string> =
  TPath extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParamNames<`/${Rest}`>
    : TPath extends `${string}:${infer Param}`
      ? Param
      : never;

export type FullPathOf<
  TTree extends AppRouteTree,
  TRouteId extends RouteIdOf<TTree>,
> = ResolveFullPathById<TTree, TRouteId>;

export type ParamsOfPath<TPath extends string> = [
  ExtractParamNames<TPath>,
] extends [never]
  ? undefined
  : Record<ExtractParamNames<TPath>, string | number>;

export type RouteParamsOf<
  TTree extends AppRouteTree,
  TRouteId extends RouteIdOf<TTree>,
> = ParamsOfPath<FullPathOf<TTree, TRouteId>>;
