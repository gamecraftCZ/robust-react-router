import React from "react";

export const createRoute = (config): { RouteComponent: React.FC; createPath; pushPath; replacePath } => {
  return { RouteComponent: () => <></>, createPath: undefined, pushPath: undefined, replacePath: undefined };
};
