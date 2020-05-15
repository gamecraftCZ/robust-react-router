import React from "react";

export interface Route {
  path: string;
  key: string;
  component: React.FC;
  exact?: boolean;
  routes?: readonly Route[];
  options?: Function;
  wrapper?: React.FC;
  _fullPath?: string;
}

///////////////////////////////////
// Exclude from U those types that are assignable to T
type Exclude<U, T> = U extends T ? never : U;

// Extract from U those types that are assignable to T
type Extract<U, T> = U extends T ? U : never;
//////////////////////////////////

export type ExtractRouteWithoutOptions<Route> = Route extends { options: any } ? never : Route;

// Extract route options function if key matches and options exists.
type ExtractRouteOptionsFunction<Routes, Key> = Routes extends { key: Key; options: any } ? Routes["options"] : never;
type ExtractRouteOptionsWithoutNesting<O> = O extends (...args: any) => any ? Parameters<O>[0] : never;
type And<T, K> = [T] extends [never] ? K : [K] extends [never] ? T : T & K; // VALID

type ExtractOptions<R> = R extends { options: any } ? ExtractRouteOptionsWithoutNesting<R["options"]> : never;

export type ExtractRouteOptions<Routes, K> = Routes extends { key: K } ? ExtractRouteOptionsWithParents<Routes> : never;

type ExtractRouteOptionsWithParents<R> = R extends { parent: any }
  ? And<ExtractOptions<R>, EWP2<R["parent"]>>
  : ExtractOptions<R>;
type EWP2<R> = R extends { parent: any } ? And<ExtractOptions<R>, EWP3<R["parent"]>> : ExtractOptions<R>;
type EWP3<R> = R extends { parent: any } ? And<ExtractOptions<R>, EWP4<R["parent"]>> : ExtractOptions<R>;
type EWP4<R> = R extends { parent: any } ? And<ExtractOptions<R>, EWP5<R["parent"]>> : ExtractOptions<R>;
type EWP5<R> = R extends { parent: any } ? And<ExtractOptions<R>, EWP6<R["parent"]>> : ExtractOptions<R>;
type EWP6<R> = R extends { parent: any } ? And<ExtractOptions<R>, EWP7<R["parent"]>> : ExtractOptions<R>;
type EWP7<R> = R extends { parent: any } ? And<ExtractOptions<R>, EWP8<R["parent"]>> : ExtractOptions<R>;
type EWP8<R> = R extends { parent: any } ? And<ExtractOptions<R>, EWP9<R["parent"]>> : ExtractOptions<R>;
type EWP9<R> = R extends { parent: any } ? And<ExtractOptions<R>, ExtractOptions<R["parent"]>> : ExtractOptions<R>;

// Flattening of Routes
// Typescript does not support recursive types as we need yet. This is just a workaround
export type FlattenRoutes<R> = R extends readonly any[] ? FlattenRoute<R[number]> : never;
type FlattenRoute<R> = R extends { routes: readonly any[] } ? R | FR1<R["routes"][number], R> : R;
type FR1<R, P> = R extends { routes: readonly any[] }
  ? (R & { readonly parent: P }) | FR2<R["routes"][number], R & { readonly parent: P }>
  : R & { readonly parent: P };
type FR2<R, P> = R extends { routes: readonly any[] }
  ? (R & { readonly parent: P }) | FR3<R["routes"][number], R & { readonly parent: P }>
  : R & { readonly parent: P };
type FR3<R, P> = R extends { routes: readonly any[] }
  ? (R & { readonly parent: P }) | FR4<R["routes"][number], R & { readonly parent: P }>
  : R & { readonly parent: P };
type FR4<R, P> = R extends { routes: readonly any[] }
  ? (R & { readonly parent: P }) | FR5<R["routes"][number], R & { readonly parent: P }>
  : R & { readonly parent: P };
type FR5<R, P> = R extends { routes: readonly any[] }
  ? (R & { readonly parent: P }) | FR6<R["routes"][number], R & { readonly parent: P }>
  : R & { readonly parent: P };
type FR6<R, P> = R extends { routes: readonly any[] }
  ? (R & { readonly parent: P }) | FR7<R["routes"][number], R & { readonly parent: P }>
  : R & { readonly parent: P };
type FR7<R, P> = R extends { routes: readonly any[] }
  ? (R & { readonly parent: P }) | FR8<R["routes"][number], R & { readonly parent: P }>
  : R & { readonly parent: P };
type FR8<R, P> = R extends { routes: readonly any[] }
  ? (R & { readonly parent: P }) | FR9<R["routes"][number], R & { readonly parent: P }>
  : R & { readonly parent: P };
type FR9<R, P> = R extends { routes: readonly any[] } ? (R & { readonly parent: P }) | R["routes"][number] : R;
