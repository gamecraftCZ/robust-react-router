import { RobustRoute } from "./index";
import { useLocation, useParams } from "react-router-dom";
import { ExtractRouteOptions, FlattenRoutes } from "./typescriptMagic";
import { parse } from "query-string";
import React from "react";

export const useRobustParams = <
  R extends { _routes: readonly RobustRoute[] },
  K extends FlattenRoutes<R["_routes"]>["key"]
>(
  router: R,
  key: K,
): ExtractRouteOptions<FlattenRoutes<R["_routes"]>, K> => {
  const params = useParams();
  const location = useLocation();

  // Search
  let allParams = parse(location.search);

  // Hash
  if (location.hash) {
    allParams = { ...allParams, hash: location.hash.slice(1) };
  }

  // Route Params
  allParams = { ...allParams, ...params };

  // @ts-ignore
  return allParams;
};
