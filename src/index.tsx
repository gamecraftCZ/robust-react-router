import React from "react";
import { BrowserRouter, Route as ReactRoute, Switch } from "react-router-dom";
import { ExtractRouteOptions, ExtractRouteWithoutOptions, FlattenRoutes, Route } from "./typescriptMagic";

// Inspiration from:
// https://medium.com/better-programming/react-router-architecture-thats-simple-scalable-and-protected-da896827f946
//
// Tutorials describing all the typescript magic used.
// https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
// https://medium.com/@flut1/deep-flatten-typescript-types-with-finite-recursion-cb79233d93ca

/**
 * Render a route with potential sub routes
 * https://reacttraining.com/react-router/web/example/route-config
 */
const RouteWithSubRoutes = (route) => (
  <ReactRoute
    path={route.path}
    exact={route.exact}
    render={(props) => <route.component {...props} routes={route.routes} />}
  />
);

/**
 * Create router object. Maximum routes recursion level is 10.
 * @param routes
 * @param notFoundElement
 */
export const createRoute = <T extends readonly Route[]>(routes: T, notFoundElement?: React.FC) => {
  const SwitchComponent = () => (
    <Switch>
      {routes.map((route) => (
        <RouteWithSubRoutes route={route} />
      ))}
      <ReactRoute component={notFoundElement ? notFoundElement : () => <h1>Not Found!</h1>} />
    </Switch>
  );
  const BrowserRouterComponent = () => (
    <BrowserRouter>
      <SwitchComponent />
    </BrowserRouter>
  );

  type Routes = FlattenRoutes<typeof routes>;
  // type Routes = typeof routes[number];
  type RoutesKeys = Routes["key"];

  function createPath(route: ExtractRouteWithoutOptions<Routes>["key"], options?: never): string;
  function createPath<Key extends RoutesKeys>(route: Key, options: ExtractRouteOptions<Routes, Key>): string;
  function createPath(route: any, options?: any): string {
    console.log("createPath, route: ", route);
    return "NOT implemented yet";
  }



  return { BrowserRouterComponent, SwitchComponent, createPath, pushPath: undefined, replacePath: undefined, routes };
};

const r = createRoute([
  {
    key: "RAMBO",
    path: "/rambo",
    component: () => <b>Rambo</b>,
    options: (_: { id: number; opened?: boolean }) => null,
  },
  { key: "RAMBOS", path: "/rambos", component: () => <b>Rambos</b> },
] as const);

r.createPath("RAMBO", { id: 18 });
r.createPath("RAMBOS");
