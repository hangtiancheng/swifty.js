import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUrlState } from "../src/url-state";
import { Router } from "../src/router";
import type { ViewInterface, FrameworkConfig } from "../src/types";

function createMockView(): ViewInterface {
  return {
    id: "test-view",
    owner: 0,
    updater: {
      get: vi.fn(),
      set: vi.fn().mockReturnThis(),
      digest: vi.fn(),
      snapshot: vi.fn().mockReturnThis(),
      altered: vi.fn(),
      refData: {},
      translate: vi.fn(),
      parse: vi.fn(),
    },
    signature: 1,
    locationObserved: { flag: 0, keys: [], observePath: false },
    resources: {},
    eventSelectorMap: {},
    eventObjectMap: {},
    globalEventList: [],
    render: vi.fn(),
    init: vi.fn(),
    beginUpdate: vi.fn(),
    endUpdate: vi.fn(),
    wrapAsync: vi.fn((fn) => fn),
    observeLocation: vi.fn((params) => {
      const view = createMockView();
      view.locationObserved.flag = 1;
      if (typeof params === "string") {
        view.locationObserved.keys = params.split(",");
      } else if (Array.isArray(params)) {
        view.locationObserved.keys = params;
      }
    }),
    observeState: vi.fn(),
    capture: vi.fn(),
    release: vi.fn(),
    leaveTip: vi.fn(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    fire: vi.fn().mockReturnThis(),
  } as unknown as ViewInterface;
}

describe("useUrlState", () => {
  beforeEach(() => {
    Router._setConfig({
      rootId: "app",
      routeMode: "history",
    } as FrameworkConfig);
  });

  it("returns initial state when URL has no params", () => {
    const view = createMockView();
    const [state] = useUrlState(view, { page: "1", size: "20" });

    expect(state.page).toBe("1");
    expect(state.size).toBe("20");
  });

  it("reads state from URL params, overriding defaults", () => {
    const view = createMockView();
    vi.spyOn(Router, "parse").mockReturnValue({
      href: "https://example.com/?page=3&size=50",
      srcQuery: "/?page=3&size=50",
      srcHash: "",
      query: { path: "/", params: { page: "3", size: "50" } },
      hash: { path: "", params: {} },
      params: { page: "3", size: "50" },
      get(key: string, defaultValue?: string) {
        const p: Record<string, string> = { page: "3", size: "50" };
        return p[key] || defaultValue || "";
      },
    });

    const [state] = useUrlState(view, { page: "1", size: "20" });
    expect(state.page).toBe("3");
    expect(state.size).toBe("50");

    vi.restoreAllMocks();
  });

  it("auto-observes location keys on the view", () => {
    const view = createMockView();
    useUrlState(view, { page: "1", size: "20" });

    expect(view.observeLocation).toHaveBeenCalledWith(["page", "size"]);
  });

  it("setState calls Router.to with the patch", () => {
    const view = createMockView();
    const toSpy = vi.spyOn(Router, "to").mockImplementation(() => {});

    const [, setState] = useUrlState(view, { page: "1", size: "20" });
    setState({ page: "2" });

    expect(toSpy).toHaveBeenCalledWith({ page: "2" });

    vi.restoreAllMocks();
  });

  it("setState supports updater function", () => {
    const view = createMockView();
    const toSpy = vi.spyOn(Router, "to").mockImplementation(() => {});

    const [, setState] = useUrlState(view, { page: "1", size: "20" });
    setState((prev) => ({ page: String(Number(prev.page) + 1) }));

    expect(toSpy).toHaveBeenCalledWith({ page: "2" });

    vi.restoreAllMocks();
  });

  it("works without initial state", () => {
    const view = createMockView();
    const [state] = useUrlState(view);

    expect(state).toEqual({});
    expect(view.observeLocation).not.toHaveBeenCalled();
  });
});
