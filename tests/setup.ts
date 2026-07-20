import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import React, { useEffect } from "react";
import { afterEach, vi } from "vitest";

type RouteParams = Record<string, string>;
type RouterLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to?: string;
};

const routeState = vi.hoisted(() => ({
  params: {} as RouteParams,
}));

const motionPropsToDrop = new Set([
  "animate",
  "drag",
  "dragConstraints",
  "dragControls",
  "dragElastic",
  "dragListener",
  "dragMomentum",
  "exit",
  "initial",
  "layoutId",
  "transition",
  "variants",
  "whileHover",
  "whileTap",
]);

type MotionMockProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  onAnimationComplete?: () => void;
};

type MockRouteConfig = Record<string, unknown> & {
  _addFileChildren?: (children: unknown) => MockRouteConfig;
  _addFileTypes?: <_Types>() => MockRouteConfig;
  addChildren?: (children: unknown) => MockRouteConfig;
  update?: (nextConfig: Record<string, unknown>) => MockRouteConfig;
  useParams?: () => RouteParams;
};

/** Builds a chainable route object for generated TanStack route-tree imports. */
function createMockRoute(config: Record<string, unknown>): MockRouteConfig {
  const route: MockRouteConfig = {
    ...config,
    _addFileChildren: () => route,
    _addFileTypes: () => route,
    addChildren: () => route,
    update: (nextConfig: Record<string, unknown>) => {
      Object.assign(route, nextConfig);
      return route;
    },
    useParams: () => routeState.params,
  };
  return route;
}

/** Strips animation-only props before they hit jsdom nodes. */
function stripMotionProps(
  props: MotionMockProps,
): React.HTMLAttributes<HTMLElement> {
  const cleanProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (motionPropsToDrop.has(key)) continue;
    cleanProps[key] = value;
  }
  return cleanProps as React.HTMLAttributes<HTMLElement>;
}

/** Builds a plain React replacement for a motion intrinsic element. */
function createMotionElement(tagName: keyof HTMLElementTagNameMap) {
  return React.forwardRef<HTMLElement, MotionMockProps>((props, ref) => {
    const { onAnimationComplete, ...restProps } = props;

    useEffect(() => {
      onAnimationComplete?.();
    }, [onAnimationComplete]);

    return React.createElement(tagName, {
      ...stripMotionProps(restProps),
      ref,
    });
  });
}

/** Creates a simple mutable motion value for animation-dependent components. */
function createMotionValue(initialValue: number) {
  let currentValue = initialValue;
  return {
    get: () => currentValue,
    set: (nextValue: number) => {
      currentValue = nextValue;
    },
  };
}

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    button: createMotionElement("button"),
    div: createMotionElement("div"),
  },
  useDragControls: () => ({
    start: vi.fn(),
  }),
  useMotionValue: createMotionValue,
}));

vi.mock("motion/react", () => ({
  motion: {
    create: (Component: React.ElementType) =>
      React.forwardRef<HTMLElement, MotionMockProps>((props, ref) =>
        React.createElement(Component, { ...stripMotionProps(props), ref }),
      ),
    button: createMotionElement("button"),
    div: createMotionElement("div"),
    span: createMotionElement("span"),
  },
  motionValue: createMotionValue,
  useInView: () => true,
  useSpring: (value: ReturnType<typeof createMotionValue>) => value,
  useTransform: (
    value: ReturnType<typeof createMotionValue>,
    transform: (latest: number) => number,
  ) => createMotionValue(transform(value.get())),
}));

vi.mock("react-use-measure", () => ({
  default: () => [vi.fn(), { height: 20 }],
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute:
    (routePath: string) =>
    <RouteConfig extends Record<string, unknown>>(config: RouteConfig) =>
      createMockRoute({
        ...config,
        routePath,
      }),
  createRootRoute: <RouteConfig extends Record<string, unknown>>(
    config: RouteConfig,
  ) => createMockRoute(config),
  createRouter: <RouterConfig extends Record<string, unknown>>(
    config: RouterConfig,
  ) => config,
  HeadContent: () => React.createElement("meta", { "data-testid": "head" }),
  Link: ({ to = "#", children, ...props }: RouterLinkProps) =>
    React.createElement("a", { href: to, ...props }, children),
  Navigate: ({ params, to }: { params?: RouteParams; to: string }) =>
    React.createElement("div", {
      "data-params": JSON.stringify(params ?? {}),
      "data-testid": "navigate",
      "data-to": to,
    }),
  Outlet: () => React.createElement("main", { "data-testid": "outlet" }),
  Scripts: () => React.createElement("script", { "data-testid": "scripts" }),
}));

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: vi.fn((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  })),
});

Object.defineProperty(document, "startViewTransition", {
  configurable: true,
  value: (callback: () => void) => {
    callback();
    return { ready: Promise.resolve() };
  },
});

Object.defineProperty(HTMLElement.prototype, "animate", {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

const storage = new Map<string, string>();
const testStorage: Storage = {
  get length() {
    return storage.size;
  },
  clear: () => storage.clear(),
  getItem: (key: string) => storage.get(key) ?? null,
  key: (index: number) => Array.from(storage.keys())[index] ?? null,
  removeItem: (key: string) => storage.delete(key),
  setItem: (key: string, value: string) => storage.set(key, value),
};

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: testStorage,
});

Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: testStorage,
});

Object.defineProperty(window, "open", {
  configurable: true,
  value: vi.fn(),
});

class TestIntersectionObserver {
  readonly callback: IntersectionObserverCallback;
  readonly root = null;
  readonly rootMargin = "";
  readonly scrollMargin = "";
  readonly thresholds: number[] = [];

  /** Stores the observer callback so tests can run in-view code immediately. */
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  /** Disconnects the no-op test observer. */
  disconnect() {}

  /** Emits an intersecting entry for observed elements. */
  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this,
    );
  }

  /** Leaves the no-op test observer unchanged. */
  takeRecords() {
    return [];
  }

  /** Leaves the no-op test observer unchanged. */
  unobserve() {}
}

class TestMutationObserver {
  readonly callback: MutationCallback;

  /** Stores the mutation callback for API compatibility. */
  constructor(callback: MutationCallback) {
    this.callback = callback;
  }

  /** Disconnects the no-op test observer. */
  disconnect() {}

  /** Starts the no-op test observer. */
  observe() {}

  /** Leaves the no-op test observer unchanged. */
  takeRecords() {
    return [];
  }
}

globalThis.IntersectionObserver = TestIntersectionObserver;
globalThis.MutationObserver = TestMutationObserver;

/** Creates the minimal canvas context shape needed by jsdom component tests. */
function createTestCanvasContext(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    createImageData: (width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
    }),
    createPattern: vi.fn(() => "pattern"),
    fillRect: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    putImageData: vi.fn(),
    scale: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId !== "2d") return null;
  return createTestCanvasContext();
}) as typeof HTMLCanvasElement.prototype.getContext;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
  routeState.params = {};
  document.documentElement.className = "";
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  window.history.replaceState({}, "", "/");
  globalThis.localStorage?.clear();
});

export const testRouterState = routeState;
