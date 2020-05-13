import React from "react";
import { generatePath, Route as ReactRoute, Switch } from "react-router-dom";
import { ExtractRouteOptions, ExtractRouteWithoutOptions, FlattenRoutes, Route } from "./typescriptMagic";
import { History } from "history";
import * as pathToRegexp from "path-to-regexp";
import { stringify } from "query-string";

// Inspiration from:
// https://medium.com/better-programming/react-router-architecture-thats-simple-scalable-and-protected-da896827f946
//
// Tutorials describing all the typescript magic used.
// https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
// https://medium.com/@flut1/deep-flatten-typescript-types-with-finite-recursion-cb79233d93ca

const RouteWrapperRenderer = ({ route, children }) =>
  route.wrapper ? <route.wrapper>{children}</route.wrapper> : children;

/**
 * Render a route with potential sub routes
 * https://reacttraining.com/react-router/web/example/route-config
 */
const RouteWithSubRoutes = ({ route, notFoundElement }) => (
  <ReactRoute
    path={route.path}
    exact={route.exact ?? true}
    render={(props) => (
      <RouteWrapperRenderer route={route}>
        <route.component {...props}>
          <RenderRoutes routes={route.routes} notFoundElement={notFoundElement} />
        </route.component>
      </RouteWrapperRenderer>
    )}
  />
);

/**
 * Use this component for any new section of routes (any config object that has a "routes" property
 */
export function RenderRoutes({ routes, notFoundElement }) {
  if (routes.length > 0) {
    const key = routes.map((route) => route.key).join("");
    return (
      <Switch key={key}>
        {routes.map((route) => (
          <RouteWithSubRoutes key={route.key} route={route} notFoundElement={notFoundElement} />
        ))}
        <ReactRoute
          key={`not-found-${key}`}
          component={notFoundElement ? notFoundElement : () => <h1>Not Found!</h1>}
        />
      </Switch>
    );
  } else {
    return null;
  }
}

const flattenRoutes = (routes: readonly Route[], rootPath?: string): Route[] => {
  const flattened: Route[] = [];
  for (const route of routes) {
    route._fullPath = (rootPath || "") + route.path;
    flattened.push(route);
    if (route.routes) {
      flattened.push(...flattenRoutes(route.routes, route._fullPath));
    }
  }
  return flattened;
};

/**
 * Create router object. Maximum routes recursion level is 10.
 * @param routes
 * @param options
 */
export const createRoute = <T extends readonly Route[]>(
  routes: T,
  options: { notFoundElement?: React.FC; history: History<History.LocationState> },
) => {
  const routerOptions = options;
  const flattenedRoutes = flattenRoutes(routes);

  const SwitchComponent = () => (
    <Switch>
      <RenderRoutes routes={routes} notFoundElement={options?.notFoundElement} />
    </Switch>
  );

  type Routes = FlattenRoutes<typeof routes>;
  type RoutesKeys = Routes["key"];

  function flattened(f: Routes): void {}

  function createPath(route: ExtractRouteWithoutOptions<Routes>["key"], params?: never): string;
  function createPath<Key extends RoutesKeys>(route: Key, params: ExtractRouteOptions<Routes, Key>): string;
  function createPath<Key extends RoutesKeys>(route: Key, params?: any): string {
    const routeObject = flattenedRoutes.find((r) => r.key == route);
    if (!routeObject) return "ROUTER-ERROR"; // Thanks to TypeScript, it should never get there.
    if (!routeObject._fullPath) {
      console.error("robust-react-router - Changing _fullPath is prohibited! It is used for internal purposes.");
      return "ROUTER-ERROR";
    }
    if (!params) return routeObject._fullPath;

    // region Parse path params and remove used ones from params
    const pathTokens = pathToRegexp
      .parse(routeObject._fullPath)
      .map((token) => (typeof token === "object" ? token.name : null))
      .filter(Boolean);

    const path = generatePath(routeObject._fullPath, params);

    for (const token of pathTokens) {
      if (!token) continue;
      delete params[token];
    }
    // endregion

    const hash = params?.hash;
    delete params.hash;

    const search = stringify(params);

    return options.history.createHref({ pathname: path, search, hash: hash });
  }

  function pushPath(route: ExtractRouteWithoutOptions<Routes>["key"], params?: never);
  function pushPath<Key extends RoutesKeys>(route: Key, params: ExtractRouteOptions<Routes, Key>);
  function pushPath(route: any, params?: any) {
    routerOptions.history.push(createPath(route, params));
  }

  function replacePath(route: ExtractRouteWithoutOptions<Routes>["key"], params?: never);
  function replacePath<Key extends RoutesKeys>(route: Key, params: ExtractRouteOptions<Routes, Key>);
  function replacePath(route: any, params?: any) {
    routerOptions.history.replace(createPath(route, params));
  }

  return { SwitchComponent, createPath, pushPath, replacePath, routes, flattened };
};
