import React from "react";
import { Route as ReactRoute, Switch } from "react-router-dom";

// Inspiration from:
// https://medium.com/better-programming/react-router-architecture-thats-simple-scalable-and-protected-da896827f946
//
// Tutorial describing all the typescript magic used.
// https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/

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

interface Route {
  path: string;
  key: string;
  exact?: boolean;
  component: React.FC;
  routes?: Route[];
}
type RouteArray = readonly Route[];

/**
 * Create router object.
 * @param routes
 * @param notFoundElement
 */
export const createRoute = <T extends RouteArray>(routes: T, notFoundElement?: React.FC) => {
  const SwitchComponent = () => (
    <Switch>
      {routes.map((route) => (
        <RouteWithSubRoutes route={route} />
      ))}
      <ReactRoute component={notFoundElement ? notFoundElement : () => <h1>Not Found!</h1>} />
    </Switch>
  );

  type Routes = typeof routes[number];
  type RoutesKeys = Routes["key"];

  type ExtractRoutesParameters<A, T> = A extends { key: T } ? A : never;
  type ExtractRouteOptions<A> = A extends { options: any } ? A["options"] : never;
  type ArgumentsType<T extends (...args: any[]) => any> = T extends (...args: infer A) => any ? A : never;

  const createPath = <T extends RoutesKeys>(
    route: T,
    options: Parameters<ExtractRouteOptions<ExtractRoutesParameters<Routes, T>>>[0],
  ) => {
    console.log("createPath, route: ", route);
  };

  return { SwitchComponent, createPath, pushPath: undefined, replacePath: undefined, routes };
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
