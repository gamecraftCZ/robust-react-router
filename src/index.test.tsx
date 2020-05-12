import { createRoute } from "./index";
import React from "react";
import { render, cleanup } from "@testing-library/react";

describe("robust-react-router works", () => {
  afterEach(cleanup);

  it("should chose right path by key - no nesting", () => {
    const routes = createRoute([
      { path: "/", key: "LANDING_PAGE", exact: true, component: () => <b>Landing page</b> },
      { path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> },
      { path: "/books", key: "BOOKS", exact: true, component: () => <b>Books</b> },
    ]);
    expect(routes.createPath("DOES_NOT_EXIST")).toBeUndefined();
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
    ]);
    expect(routes.createPath("DOES_NOT_EXIST")).toBeUndefined();
    expect(routes.createPath("LANDING_PAGE")).toBe("/");
    expect(routes.createPath("BOOKS")).toBe("/books");
    expect(routes.createPath("MY_BOOKS")).toBe("/myBooks");
  });

  it("should createPath without params", () => {
    const routes = createRoute([{ path: "/books", key: "BOOKS", exact: true, component: () => <b>Landing page</b> }]);
    expect(routes.createPath("BOOKS")).toBe("/books");
  });

  it("should createPath with param only", () => {
    const routes = createRoute([
      { path: "/books/:id", key: "BOOK_PAGE", exact: true, component: () => <b>Book page</b> },
    ]);
    expect(routes.createPath("BOOKS", { id: "12345" })).toBe("/books/12345");
  });

  it("should createPath with search only", () => {
    const routes = createRoute([
      {
        path: "/books",
        key: "BOOK_PAGE",
        exact: true,
        component: () => <b>Book page</b>,
        search: { id: "" as string },
      },
    ]);
    expect(routes.createPath("BOOKS", { id: "12345" })).toBe("/books?id=12345");
  });

  it("should createPath with hash only", () => {
    const routes = createRoute([{ path: "/books", key: "BOOK_PAGE", exact: true, component: () => <b>Book page</b> }]);
    expect(routes.createPath("BOOKS", { hash: "12345" })).toBe("/books#12345");
  });

  it("should createPath with value, search and hash", () => {
    const routes = createRoute([
      {
        path: "/chat/:id",
        key: "CHAT",
        exact: true,
        component: () => <b>Chat</b>,
        search: { m: "" as string },
      },
    ]);
    expect(routes.createPath("CHAT", { m: "some_message", id: "12345", hash: "basic" })).toBe(
      "/chat/12345?m=some_message#basic",
    );
  });

  it("should pushPath", () => {
    const routes = createRoute([{ path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> }]);
    const originalHistoryLength = history.length;
    routes.pushPath("HOME");
    expect(history.length).toBe(originalHistoryLength + 1);
  });

  it("should replacePath", () => {
    const routes = createRoute([{ path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> }]);
    const originalHistoryLength = history.length;
    routes.pushPath("HOME");
    expect(history.length).toBe(originalHistoryLength);
  });

  it("should render path correctly - no nesting", () => {
    const routes = createRoute([
      { path: "/", key: "LANDING_PAGE", exact: true, component: () => <b>Landing page</b> },
      { path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> },
    ]);
    const { queryByText } = render(<routes.RouteComponent />);
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
    ]);
    const { queryByText } = render(<routes.RouteComponent />);
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
    ]);
    const { getByTestId } = render(<routes.RouteComponent />);
    expect(getByTestId("wrapper-button")).toBeTruthy();
  });
});
