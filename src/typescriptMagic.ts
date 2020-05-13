import React from "react";

export interface Route {
  path: string;
  key: string;
  exact?: boolean;
  component: React.FC;
  routes?: readonly Route[];
  options?: Function;
}

export type ExtractRouteWithoutOptions<Route> = Route extends { options: any } ? never : Route;

// Extract route options function if key matches and options exists.
type ExtractRouteOptionsFunction<Routes, Key> = Routes extends { key: Key; options: any } ? Routes["options"] : never;
export type ExtractRouteOptions<Routes, Key> = Parameters<ExtractRouteOptionsFunction<Routes, Key>>[0];

// Flattening of Routes

export type FlattenRoutes<R> = R extends readonly any[] ? FlattenRoute<R[number]> : never;
type FlattenRoute<R> = R extends { routes: readonly any[] } ? R | FR1<R["routes"][number]> : R;
type FR1<R> = R extends { routes: readonly any[] } ? R | FR2<R["routes"][number]> : R;
type FR2<R> = R extends { routes: readonly any[] } ? R | FR3<R["routes"][number]> : R;
type FR3<R> = R extends { routes: readonly any[] } ? R | FR4<R["routes"][number]> : R;
type FR4<R> = R extends { routes: readonly any[] } ? R | FR5<R["routes"][number]> : R;
type FR5<R> = R extends { routes: readonly any[] } ? R | FR6<R["routes"][number]> : R;
type FR6<R> = R extends { routes: readonly any[] } ? R | FR7<R["routes"][number]> : R;
type FR7<R> = R extends { routes: readonly any[] } ? R | FR8<R["routes"][number]> : R;
type FR8<R> = R extends { routes: readonly any[] } ? R | FR9<R["routes"][number]> : R;
type FR9<R> = R extends { routes: readonly any[] } ? R | R["routes"][number] : R;