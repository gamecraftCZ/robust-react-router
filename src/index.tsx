import React from "react";
import { Route as ReactRoute, Switch } from "react-router-dom";
import { ExtractRouteOptions, ExtractRouteWithoutOptions, FlattenRoutes, Route } from "./typescriptMagic";
import { History } from "history";

// Inspiration from:
// https://medium.com/better-programming/react-router-architecture-thats-simple-scalable-and-protected-da896827f946
//
// Tutorials describing all the typescript magic used.
// https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
// https://medium.com/@flut1/deep-flatten-typescript-types-with-finite-recursion-cb79233d93ca

const RouteWrapperRenderer = ({ route, children }) => {
  return route.wrapper ? <route.wrapper>{children}</route.wrapper> : children;
};

/**
 * Render a route with potential sub routes
 * https://reacttraining.com/react-router/web/example/route-config
 */
const RouteWithSubRoutes = ({ route, notFoundElement }) => (
  <ReactRoute
    path={route.path}
    exact={route.exact}
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

/**
 * Create router object. Maximum routes recursion level is 10.
 * @param routes
 * @param options
 */
export const createRoute = <T extends readonly Route[]>(
  routes: T,
  options?: { notFoundElement?: React.FC; history: History<History.LocationState> },
) => {
  const routerOptions = options;

  const SwitchComponent = () => (
    <Switch>
      <RenderRoutes routes={routes} notFoundElement={options?.notFoundElement} />
    </Switch>
  );

  type Routes = FlattenRoutes<typeof routes>;
  type RoutesKeys = Routes["key"];

  function createPath(route: ExtractRouteWithoutOptions<Routes>["key"], props?: never): string;
  function createPath<Key extends RoutesKeys>(route: Key, props: ExtractRouteOptions<Routes, Key>): string;
  function createPath(route: any, props?: any): string {
    console.log("createPath, route: ", route);
    return "NOT implemented yet";
  }

  function pushPath(route: ExtractRouteWithoutOptions<Routes>["key"], props?: never);
  function pushPath<Key extends RoutesKeys>(route: Key, props: ExtractRouteOptions<Routes, Key>);
  function pushPath(route: any, props?: any) {
    if (routerOptions?.history) {
      routerOptions.history.push(createPath(route, props));
    } else {
      console.error("robust-react-router - Can't pushPath when no history defined in constructor!");
    }
  }

  function replacePath(route: ExtractRouteWithoutOptions<Routes>["key"], props?: never);
  function replacePath<Key extends RoutesKeys>(route: Key, props: ExtractRouteOptions<Routes, Key>);
  function replacePath(route: any, props?: any) {
    if (routerOptions?.history) {
      routerOptions.history.replace(createPath(route, props));
    } else {
      console.error("robust-react-router - Can't replacePath when no history defined in constructor!");
    }
  }

  return { SwitchComponent, createPath, pushPath, replacePath, routes };
};
