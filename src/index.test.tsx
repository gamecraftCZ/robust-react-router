import { createRoute } from "./index";
import React from "react";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import Enzyme, { render } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

const LandingPage = () => <div className="landing-page">Landing page</div>;
const Home = () => <div className="home">Home</div>;
const Books = (props) => <div className="books">Books - {props.children}</div>;
const MyBooks = () => <div className="my-books">My books</div>;
const BookPage = () => <div className="book-page">Book Page</div>;
const Chat = () => <div className="chat">Chat</div>;

describe("robust-react-router works", () => {
  beforeAll(() => Enzyme.configure({ adapter: new Adapter() }));

  it("should chose right path by key - no nesting", () => {
    const routes = createRoute([
      { path: "/", key: "LANDING_PAGE", exact: true, component: LandingPage },
      { path: "/home", key: "HOME", exact: true, component: Home },
      { path: "/books", key: "BOOKS", exact: true, component: Books },
    ] as const);
    expect(routes.createPath("LANDING_PAGE")).toBe("/");
    expect(routes.createPath("HOME")).toBe("/home");
    expect(routes.createPath("BOOKS")).toBe("/books");
  });

  it("should chose right path by key - with nesting", () => {
    const routes = createRoute([
      { path: "/", key: "LANDING_PAGE", exact: true, component: LandingPage },
      {
        path: "/books",
        key: "BOOKS",
        exact: true,
        component: Books,
        routes: [{ path: "/myBooks", key: "MY_BOOKS", exact: true, component: MyBooks }],
      },
    ] as const);
    expect(routes.createPath("LANDING_PAGE")).toBe("/");
    expect(routes.createPath("BOOKS")).toBe("/books");
    expect(routes.createPath("MY_BOOKS")).toBe("/books/myBooks");
  });

  it("should createPath without params", () => {
    const routes = createRoute([{ path: "/books", key: "BOOKS", exact: true, component: LandingPage }] as const);
    expect(routes.createPath("BOOKS")).toBe("/books");
  });

  it("should createPath with param only", () => {
    const routes = createRoute([
      {
        path: "/books/:id",
        key: "BOOK_PAGE",
        exact: true,
        component: BookPage,
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
        component: BookPage,
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
        component: BookPage,
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
        component: Chat,
        search: { m: "" as string },
        options: (_: { m: string; id: number; hash: string }) => null,
      },
    ] as const);
    expect(routes.createPath("CHAT", { m: "some_message", id: 12345, hash: "basic" })).toBe(
      "/chat/12345?m=some_message#basic",
    );
  });

  it("should pushPath", () => {
    const history = createMemoryHistory();
    const routes = createRoute([{ path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> }] as const, {
      history,
    });
    const originalHistoryLength = history.length;
    routes.pushPath("HOME");
    expect(history.location.pathname).toBe("/home");
    expect(history.length).toBe(originalHistoryLength + 1);
  });

  it("should replacePath", () => {
    const history = createMemoryHistory();
    const routes = createRoute([{ path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> }] as const, {
      history,
    });
    const originalHistoryLength = history.length;
    routes.replacePath("HOME");
    expect(history.location.pathname).toBe("/home");
    expect(history.length).toBe(originalHistoryLength);
  });

  it("should render path correctly - no nesting", () => {
    const history = createMemoryHistory();
    const routes = createRoute(
      [
        { path: "/", key: "LANDING_PAGE", exact: true, component: LandingPage },
        { path: "/home", key: "HOME", exact: true, component: Home },
      ] as const,
      { history },
    );
    const wrapper = render(
      <Router history={history}>
        <div>
          <routes.SwitchComponent />
        </div>
      </Router>,
    );

    expect(wrapper.find(".landing-page")).toHaveLength(1);
    expect(wrapper.find(".home")).toHaveLength(0);

    routes.pushPath("HOME");
    expect(wrapper.find(".landing-page")).toHaveLength(0);
    expect(wrapper.find(".home")).toHaveLength(1);

    routes.pushPath("LANDING_PAGE");
    expect(wrapper.find("landing-page")).toHaveLength(1);
  });

  it("should render path correctly - with nesting", () => {
    const history = createMemoryHistory();
    const routes = createRoute(
      [
        { path: "/", key: "LANDING_PAGE", exact: true, component: LandingPage },
        {
          path: "/books",
          key: "BOOKS",
          exact: true,
          component: () => <b>Books</b>,
          routes: [{ path: "/myBooks", key: "MY_BOOKS", exact: true, component: MyBooks }],
        },
      ] as const,
      { history },
    );
    const wrapper = render(
      <Router history={history}>
        <div>
          <routes.SwitchComponent />
        </div>
      </Router>,
    );
    expect(wrapper.find(".landing-page")).toHaveLength(1);

    routes.pushPath("BOOKS");
    expect(wrapper.find(".books")).toHaveLength(1);
    expect(wrapper.find(".my-books")).toHaveLength(0);

    routes.pushPath("MY_BOOKS");
    expect(wrapper.find(".my-books")).toHaveLength(1);
    expect(wrapper.find(".books")).toHaveLength(1);
  });

  it("should render with wrapper", () => {
    const history = createMemoryHistory();
    const routes = createRoute([
      {
        path: "/",
        key: "HOME",
        exact: true,
        component: Home,
        wrapper: (props) => <button className="wrapper-button">{props.children}</button>,
      },
    ] as const);
    const wrapper = render(
      <Router history={history}>
        <div>
          <routes.SwitchComponent />
        </div>
      </Router>,
    );
    expect(wrapper.find(".wrapper-button")).toHaveLength(1);
  });
});
