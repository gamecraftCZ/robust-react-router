import React from "react";
import { generatePath, Route as ReactRoute, Router, Switch } from "react-router-dom";
import { ExtractRouteOptions, ExtractRouteWithoutOptions, FlattenRoutes, RobustRoute } from "./typescriptMagic";
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
 * Bla, bla, bla.
 */
function RenderRoutes({ routes, notFoundElement }: { routes?: readonly RobustRoute[]; notFoundElement?: React.FC }) {
  if (!routes) return null;
  if (routes.length > 0) {
    const key = routes.map((route) => route.key).join("");
    return (
      <Switch key={key}>
        {routes.map((route) => (
          <ReactRoute
            key={route.key}
            path={route._fullPath}
            exact={route.exact}
            render={(props) => (
              <RouteWrapperRenderer route={route}>
                <route.component {...props}>
                  <RenderRoutes routes={route.routes} notFoundElement={notFoundElement} />
                </route.component>
              </RouteWrapperRenderer>
            )}
          />
        ))}
        <ReactRoute
          key={`not-found-${key}`}
          component={notFoundElement ? notFoundElement : () => <h2>Not Found!</h2>}
        />
      </Switch>
    );
  } else {
    return null;
  }
}

const flattenRoutes = (routes: readonly RobustRoute[], rootPath?: string): RobustRoute[] => {
  const flattened: RobustRoute[] = [];
  for (const route of routes) {
    route._fullPath = (rootPath || "") + route.path;
    flattened.push(route);
    if (route.routes) {
      const subroutes = flattenRoutes(route.routes, route._fullPath);
      subroutes.forEach((r) => (r._parent = route));
      flattened.push(...subroutes);
    }
  }
  return flattened;
};

export const RobustSwitch = ({ router }) => {
  return <RenderRoutes routes={router._routes} notFoundElement={router._notFoundComponent} />;
};
export const RobustRouter = ({ router, children }) => {
  return <Router history={router._history}>{children}</Router>;
};

/**
 * Create router object. Maximum routes recursion level is 10.
 * @param routes
 * @param options
 */
export const createRobustRouter = <T extends readonly RobustRoute[]>(
  routes: T,
  options: { notFoundComponent?: React.FC; history: History<History.LocationState> },
) => {
  const routerOptions = options;
  const flattenedRoutes = flattenRoutes(routes);

  type Routes = FlattenRoutes<typeof routes>;
  type RoutesKeys = Routes["key"];

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

    // path = region Parse path params and remove used ones from params
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

  return {
    path: createPath,
    redirect: pushPath,
    replace: replacePath,
    back: options.history.goBack,
    _routes: routes,
    _flattenedRoutes: flattenedRoutes,
    _history: options.history,
    _notFoundComponent: options.notFoundComponent,
  };
};

export { RobustRoute, RobustKeys } from "./typescriptMagic";
export { useRobustParams } from "./hooks";
