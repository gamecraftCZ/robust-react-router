import { RobustRoute } from "./index";
import { useLocation, useParams } from "react-router-dom";
import { ExtractRouteOptions, FlattenRoutes } from "./typescriptMagic";
import { parse } from "query-string";
import React from "react";

const parseParams = (params: string[], route: RobustRoute) => {
  const parsedParams = {};

  if (route._parent) {
    const subrouteParams = parseParams(params, route._parent);
    for (const parsedName in subrouteParams) {
      parsedParams[parsedName] = subrouteParams[parsedName];
      delete params[parsedName];
    }
  }

  const parsedByFunction = route.options?.(params);
  if (parsedByFunction) {
    for (const parsedName in parsedByFunction) {
      if (parsedByFunction.hasOwnProperty(parsedName)) {
        parsedParams[parsedName] = parsedByFunction[parsedName];
      }
    }
  }

  return parsedParams;
};

export const useRobustParams = <
  R extends { _routes: readonly RobustRoute[]; _flattenedRoutes: readonly RobustRoute[] },
  K extends FlattenRoutes<R["_routes"]>["key"]
>(
  router: R,
  key: K,
): ExtractRouteOptions<FlattenRoutes<R["_routes"]>, K> => {
  const params = useParams();
  const location = useLocation();
  const currentRoute = router._flattenedRoutes.find((r) => r.key === key);

  // Search
  let allParams = parse(location.search);

  // Hash
  if (location.hash) {
    allParams = { ...allParams, hash: location.hash.slice(1) };
  }

  // Route Params
  allParams = { ...allParams, ...params };

  // @ts-ignore
  return parseParams(allParams, currentRoute);
};
