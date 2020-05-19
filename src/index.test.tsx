import { createRobustRouter, RobustRouter, RobustSwitch, useRobustParams } from "./index";
import React from "react";
import { createMemoryHistory } from "history";
import Enzyme, { render } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

const LandingPage = (props) => <div className="landing-page">Landing page - {props.children}</div>;
const Home = (props) => <div className="home">Home - {props.children}</div>;
const Books = (props) => <div className="books">Books - {props.children}</div>;
const MyBooks = (props) => <div className="my-books">My books - {props.children}</div>;
const BookPage = (props) => <div className="book-page">Book Page - {props.children}</div>;
const Chat = (props) => <div className="chat">Chat - {props.children}</div>;
const UserForumPost = (props) => <div className="user-forum-post">User forum - post - {props.children}</div>;

describe("robust-react-router works", () => {
  beforeAll(() => Enzyme.configure({ adapter: new Adapter() }));

  describe("createPath", () => {
    it("should createPath by key - no nesting", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [
          { path: "/", key: "LANDING_PAGE", exact: true, component: LandingPage },
          { path: "/home", key: "HOME", exact: true, component: Home },
          { path: "/books", key: "BOOKS", exact: true, component: Books },
        ] as const,
        { history },
      );
      expect(router.path("LANDING_PAGE")).toBe("/");
      expect(router.path("HOME")).toBe("/home");
      expect(router.path("BOOKS")).toBe("/books");
    });

    it("should createPath by key - with nesting", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [
          { path: "/", key: "LANDING_PAGE", exact: true, component: LandingPage },
          {
            path: "/books",
            key: "BOOKS",
            exact: true,
            component: Books,
            routes: [{ path: "/myBooks", key: "MY_BOOKS", exact: true, component: MyBooks }],
          },
        ] as const,
        { history },
      );
      expect(router.path("LANDING_PAGE")).toBe("/");
      expect(router.path("BOOKS")).toBe("/books");
      expect(router.path("MY_BOOKS")).toBe("/books/myBooks");
    });

    it("should createPath without params", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [{ path: "/books", key: "BOOKS", exact: true, component: LandingPage }] as const,
        {
          history,
        },
      );
      expect(router.path("BOOKS")).toBe("/books");
    });

    it("should createPath with param only", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [
          {
            path: "/books/:id",
            key: "BOOK_PAGE",
            exact: true,
            component: BookPage,
            options: ({ id }) => ({ id: parseInt(id) }),
          },
        ] as const,
        { history },
      );
      expect(router.path("BOOK_PAGE", { id: 12345 })).toBe("/books/12345");
    });

    it("should createPath with search only", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [
          {
            path: "/books",
            key: "BOOK_PAGE",
            exact: true,
            component: BookPage,
            options: ({ id }) => ({ id: parseInt(id) }),
          },
        ] as const,
        { history },
      );
      expect(router.path("BOOK_PAGE", { id: 12345 })).toBe("/books?id=12345");
    });

    it("should createPath with hash only", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [
          {
            path: "/books",
            key: "BOOK_PAGE",
            exact: true,
            component: BookPage,
            options: (_: { hash: string }) => _,
          },
        ] as const,
        { history },
      );
      expect(router.path("BOOK_PAGE", { hash: "12345" })).toBe("/books#12345");
    });

    it("should createPath with value, search and hash", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [
          {
            path: "/chat/:id",
            key: "CHAT",
            exact: true,
            component: Chat,
            options: ({ m, id, hash }) => ({ m, id: parseInt(id), hash }),
          },
        ] as const,
        { history },
      );
      expect(router.path("CHAT", { m: "some_message", id: 12345, hash: "basic" })).toBe(
        "/chat/12345?m=some_message#basic",
      );
    });

    it("should createPath with value, search and hash - with nasting", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [
          {
            path: "/user/:id",
            component: Chat,
            key: "USER_PROFILE",
            options: ({ id }) => ({ id: parseInt(id) }),
            routes: [
              {
                path: "/forum",
                component: UserForumPost,
                key: "USER_FORUM_POST",
                routes: [
                  {
                    path: "/detail",
                    component: Home,
                    key: "USER_FORUM_POST_DETAIL",
                    options: (_: { m: string; hash: string }) => _,
                  },
                ],
              },
            ],
          },
        ] as const,
        { history },
      );

      expect(router.path("USER_PROFILE", { id: 11 })).toBe("/user/11");
      expect(router.path("USER_FORUM_POST", { id: 11 })).toBe("/user/11/forum");
      expect(router.path("USER_FORUM_POST", { id: 11 })).toBe("/user/11/forum");
      expect(router.path("USER_FORUM_POST_DETAIL", { id: 11, m: "33", hash: "options" })).toBe(
        "/user/11/forum/detail?m=33#options",
      );
    });
  });

  it("should redirect()", () => {
    const history = createMemoryHistory();
    const router = createRobustRouter(
      [{ path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> }] as const,
      {
        history,
      },
    );
    const originalHistoryLength = history.length;
    router.redirect("HOME");
    expect(history.location.pathname).toBe("/home");
    expect(history.length).toBe(originalHistoryLength + 1);
  });

  it("should replace()", () => {
    const history = createMemoryHistory();
    const router = createRobustRouter(
      [{ path: "/home", key: "HOME", exact: true, component: () => <b>Home</b> }] as const,
      {
        history,
      },
    );
    const originalHistoryLength = history.length;
    router.replace("HOME");
    expect(history.location.pathname).toBe("/home");
    expect(history.length).toBe(originalHistoryLength);
  });

  describe("rendering and hooks", () => {
    it("should render path correctly - no nesting", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [
          { path: "/", key: "LANDING_PAGE", exact: true, component: LandingPage },
          { path: "/home", key: "HOME", exact: true, component: Home },
        ] as const,
        { history },
      );
      let wrapper = render(
        <RobustRouter router={router}>
          <div>
            <RobustSwitch router={router} />
          </div>
        </RobustRouter>,
      );

      expect(wrapper.find(".landing-page")).toHaveLength(1);
      expect(wrapper.find(".home")).toHaveLength(0);

      router.redirect("HOME");
      wrapper = render(
        <RobustRouter router={router}>
          <div>
            <RobustSwitch router={router} />
          </div>
        </RobustRouter>,
      );
      expect(wrapper.find(".landing-page")).toHaveLength(0);
      expect(wrapper.find(".home")).toHaveLength(1);

      router.redirect("LANDING_PAGE");
      wrapper = render(
        <RobustRouter router={router}>
          <div>
            <RobustSwitch router={router} />
          </div>
        </RobustRouter>,
      );
      expect(wrapper.find(".landing-page")).toHaveLength(1);
    });

    it("should render path correctly - with nesting", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [
          { path: "/", key: "LANDING_PAGE", exact: true, component: LandingPage },
          {
            path: "/books/:id",
            key: "BOOKS",
            component: Books,
            routes: [{ path: "/myBooks", key: "MY_BOOKS", component: MyBooks }],
          },
        ] as const,
        { history },
      );
      let wrapper = render(
        <RobustRouter router={router}>
          <div>
            <RobustSwitch router={router} />
          </div>
        </RobustRouter>,
      );
      expect(wrapper.find(".landing-page")).toHaveLength(1);

      router.redirect("BOOKS");
      wrapper = render(
        <RobustRouter router={router}>
          <div>
            <RobustSwitch router={router} />
          </div>
        </RobustRouter>,
      );
      expect(wrapper.find(".books")).toHaveLength(1);
      expect(wrapper.find(".my-books")).toHaveLength(0);

      router.redirect("MY_BOOKS");
      wrapper = render(
        <RobustRouter router={router}>
          <div>
            <RobustSwitch router={router} />
          </div>
        </RobustRouter>,
      );
      expect(wrapper.find(".my-books")).toHaveLength(1);
      expect(wrapper.find(".books")).toHaveLength(1);
    });

    it("should render with wrapper", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [
          {
            path: "/",
            key: "HOME",
            exact: true,
            component: Home,
            wrapper: (props) => <button className="wrapper-button">{props.children}</button>,
          },
        ] as const,
        { history },
      );
      const wrapper = render(
        <RobustRouter router={router}>
          <div>
            <RobustSwitch router={router} />
          </div>
        </RobustRouter>,
      );
      expect(wrapper.find(".wrapper-button")).toHaveLength(1);
    });

    it("should get params with number and optional using useRobustParams()", () => {
      const history = createMemoryHistory();
      const router = createRobustRouter(
        [
          {
            path: "/user/:id",
            component: Chat,
            key: "USER_PROFILE",
            options: ({ id }) => ({ id: parseInt(id) }),
            routes: [
              {
                path: "/forum",
                key: "USER_FORUM_POST",
                component: UserForumPost,
                routes: [
                  {
                    path: "/detail",
                    key: "USER_FORUM_POST_DETAIL",
                    component: () => {
                      // Type of params should be: {m: string, hash: string} & {id: number}
                      const params = useRobustParams(router, "USER_FORUM_POST_DETAIL");
                      if (typeof params.id !== "number") {
                        console.warn("id in params not a number!");
                        console.warn("params: ", params);
                        return <div>No no, not a number buddy</div>;
                      }
                      const divs: any = [];
                      for (const i in params) {
                        if (params.hasOwnProperty(i)) {
                          divs.push(
                            <div key={i} className={i}>
                              {params[i].toString()}
                            </div>,
                          );
                        }
                      }
                      return <div>{divs}</div>;
                    },
                    options: (_: { index?; m?: string; hash: string; num }) => ({
                      index: parseInt(_.index),
                      m: _.m,
                      hash: _.hash,
                      num: parseInt(_.num),
                    }),
                  },
                ],
              },
            ],
          },
        ] as const,
        { history },
      );

      router.redirect("USER_FORUM_POST_DETAIL", { id: 11, m: "33", hash: "options", num: 18 });

      let wrapper = render(
        <RobustRouter router={router}>
          <div>
            <RobustSwitch router={router} />
          </div>
        </RobustRouter>,
      );

      expect(wrapper.find(".id")).toHaveLength(1);
      expect(wrapper.find(".m")).toHaveLength(1);
      expect(wrapper.find(".hash")).toHaveLength(1);

      expect(wrapper.find(".dont-exist")).toHaveLength(0);
    });
  });
});
