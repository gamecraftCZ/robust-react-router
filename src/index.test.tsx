import { createRoute } from "./index";
import React from "react";

describe("It works!", () => {
  let routes: any;

  beforeAll(() => {
    routes = createRoute([
      { path: "/", key: "LANDING_PAGE", exact: true, component: () => <b>Landing page</b> },
      { path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> },
      { path: "/books", key: "BOOKS", exact: true, component: () => <b>Books</b> },
    ]);
  });

  it("should create route ", () => {
    expect(true).toBeTruthy();
  });
});
