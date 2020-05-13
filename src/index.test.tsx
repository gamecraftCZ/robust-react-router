import { createRoute } from "./index";
import React from "react";
import { cleanup, render } from "@testing-library/react";

describe("robust-react-router works", () => {
  afterEach(cleanup);

  it("should chose right path by key - no nesting", () => {
    const routes = createRoute([
      { path: "/", key: "LANDING_PAGE", exact: true, component: () => <b>Landing page</b> },
      { path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> },
      { path: "/books", key: "BOOKS", exact: true, component: () => <b>Books</b> },
    ] as const);
    expect(routes.createPath("LANDING_PAGE")).toBe("/");
    expect(routes.createPath("HOME")).toBe("/home");
    expect(routes.createPath("BOOKS")).toBe("/books");
  });

  it("should chose right path by key - with nesting", () => {
    const routes = createRoute([
      { path: "/", key: "LANDING_PAGE", exact: true, component: () => <b>Landing page</b> },
      {
        path: "/books",
        key: "BOOKS",
        exact: true,
        component: () => <b>Books</b>,
        routes: [{ path: "/myBooks", key: "MY_BOOKS", exact: true, component: () => <b>My books</b> }],
      },
    ] as const);
    expect(routes.createPath("LANDING_PAGE")).toBe("/");
    expect(routes.createPath("BOOKS")).toBe("/books");
    expect(routes.createPath("MY_BOOKS")).toBe("/myBooks");
  });

  it("should createPath without params", () => {
    const routes = createRoute([
      { path: "/books", key: "BOOKS", exact: true, component: () => <b>Landing page</b> },
    ] as const);
    expect(routes.createPath("BOOKS")).toBe("/books");
  });

  it("should createPath with param only", () => {
    const routes = createRoute([
      {
        path: "/books/:id",
        key: "BOOK_PAGE",
        exact: true,
        component: () => <b>Book page</b>,
        options: (_: { id: string }) => null,
      },
    ] as const);
    expect(routes.createPath("BOOK_PAGE", { id: "12345" })).toBe("/books/12345");
  });

  it("should createPath with search only", () => {
    const routes = createRoute([
      {
        path: "/books",
        key: "BOOK_PAGE",
        exact: true,
        component: () => <b>Book page</b>,
        search: { id: "" as string },
        options: (_: { id: number }) => null,
      },
    ] as const);
    expect(routes.createPath("BOOK_PAGE", { id: 12345 })).toBe("/books?id=12345");
  });

  it("should createPath with hash only", () => {
    const routes = createRoute([
      {
        path: "/books",
        key: "BOOK_PAGE",
        exact: true,
        component: () => <b>Book page</b>,
        options: (_: { hash: string }) => null,
      },
    ] as const);
    expect(routes.createPath("BOOK_PAGE", { hash: "12345" })).toBe("/books#12345");
  });

  it("should createPath with value, search and hash", () => {
    const routes = createRoute([
      {
        path: "/chat/:id",
        key: "CHAT",
        exact: true,
        component: () => <b>Chat</b>,
        search: { m: "" as string },
        options: (_: { m: string; id: number; hash: string }) => null,
      },
    ] as const);
    expect(routes.createPath("CHAT", { m: "some_message", id: 12345, hash: "basic" })).toBe(
      "/chat/12345?m=some_message#basic",
    );
  });

  it("should pushPath", () => {
    const routes = createRoute([{ path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> }] as const);
    const originalHistoryLength = history.length;
    routes.pushPath("HOME");
    expect(history.length).toBe(originalHistoryLength + 1);
  });

  it("should replacePath", () => {
    const routes = createRoute([{ path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> }] as const);
    const originalHistoryLength = history.length;
    routes.replacePath("HOME");
    expect(history.length).toBe(originalHistoryLength);
  });

  it("should render path correctly - no nesting", () => {
    const routes = createRoute([
      { path: "/", key: "LANDING_PAGE", exact: true, component: () => <b>Landing page</b> },
      { path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> },
    ] as const);
    const { queryByText } = render(<routes.BrowserRouterComponent />);
    expect(queryByText("Landing page")).toBeTruthy();

    routes.pushPath("HOME");
    expect(queryByText("Home")).toBeTruthy();

    routes.pushPath("LANDING_PAGE");
    expect(queryByText("Landing page")).toBeTruthy();
  });

  it("should render path correctly - with mesting", () => {
    const routes = createRoute([
      { path: "/", key: "LANDING_PAGE", exact: true, component: () => <b>Landing page</b> },
      {
        path: "/books",
        key: "BOOKS",
        exact: true,
        component: () => <b>Books</b>,
        routes: [{ path: "/myBooks", key: "MY_BOOKS", exact: true, component: () => <b>My books</b> }],
      },
    ] as const);
    const { queryByText } = render(<routes.BrowserRouterComponent />);
    expect(queryByText("Landing page")).toBeTruthy();

    routes.pushPath("BOOKS");
    expect(queryByText("Books")).toBeTruthy();

    routes.pushPath("MY_BOOKS");
    expect(queryByText("My books")).toBeTruthy();
  });

  it("should render with wrapper", () => {
    const routes = createRoute([
      { path: "/", key: "LANDING_PAGE", exact: true, component: () => <b>Landing page</b> },
      {
        path: "/home",
        key: "HOME",
        exact: true,
        component: () => <b>Home</b>,
        wrapper: ({ child }) => <button data-testid="wrapper-button">{child}</button>,
      },
    ] as const);
    const { getByTestId } = render(<routes.BrowserRouterComponent />);
    expect(getByTestId("wrapper-button")).toBeTruthy();
  });
});
