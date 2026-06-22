import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppWindow } from "@/components/os/AppWindow";
import BlogApp from "@/components/os/apps/BlogApp";
import BrowserApp from "@/components/os/apps/BrowserApp";
import CalculatorApp from "@/components/os/apps/CalculatorApp";
import { FilesApp } from "@/components/os/apps/FilesApp";
import ImageViewerApp from "@/components/os/apps/ImageViewerApp";
import NotesApp from "@/components/os/apps/NotesApp";
import SnakeApp from "@/components/os/apps/SnakeApp";
import TextReaderApp from "@/components/os/apps/TextReaderApp";
import { Desktop } from "@/components/os/Desktop";
import StatusBar, { navigateHome } from "@/components/os/StatusBar";
import { BLOG_POSTS } from "@/lib/blog";
import {
  DESKTOP_README_CONTENT,
  DESKTOP_README_FILE_NAME,
} from "@/lib/desktop-shortcuts";
import { HomeScreen } from "@/src/features/home/HomeScreen";

const FIRST_BLOG_POST = BLOG_POSTS[0];
if (!FIRST_BLOG_POST) {
  throw new Error("Expected at least one blog post fixture.");
}

/** Browser UUID return shape used by crypto.randomUUID. */
type BrowserUuid = ReturnType<Crypto["randomUUID"]>;

/** Stable UUID used by notes tests when mocking browser crypto. */
const TEST_NOTE_ID: BrowserUuid = "00000000-0000-4000-8000-000000000000";

/** Stable UUID used for generated note content blocks. */
const TEST_NOTE_BLOCK_ID: BrowserUuid = "00000000-0000-4000-8000-000000000001";

/** Creates deterministic browser UUIDs without repeating React keys. */
function createTestUuidGenerator() {
  const ids = [TEST_NOTE_ID, TEST_NOTE_BLOCK_ID];
  let nextIndex = 0;

  return vi.fn<() => BrowserUuid>(() => {
    const id = ids[nextIndex % ids.length];
    if (!id) {
      throw new Error("Expected at least one test UUID.");
    }
    nextIndex += 1;
    return id;
  });
}

const blockNoteState = vi.hoisted(() => ({
  document: [
    {
      content: "Typed note",
      id: "typed-note",
      type: "paragraph",
    },
  ],
  replaceBlocks: vi.fn(),
}));

vi.mock("@blocknote/react", () => ({
  useCreateBlockNote: () => ({
    document: blockNoteState.document,
    replaceBlocks: blockNoteState.replaceBlocks,
  }),
}));

vi.mock("@blocknote/shadcn", () => ({
  BlockNoteView: ({
    onChange,
    theme,
  }: {
    onChange: () => void;
    theme: "light" | "dark";
  }) => (
    <button data-theme={theme} onClick={onChange} type="button">
      BlockNote editor
    </button>
  ),
}));

/** Clicks a calculator key by its visible label. */
async function clickCalcKey(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
) {
  await user.click(screen.getByRole("button", { name: label }));
}

/** Returns the calculator display node that currently shows a value. */
function getCalculatorDisplay(value: string) {
  return screen.getByText(value, {
    selector: ".tabular-nums",
  });
}

/** Mocks matchMedia for a single render pass. */
function setMobileViewport(matches: boolean) {
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

describe("small app surfaces", () => {
  it("renders text and image reader apps", () => {
    render(
      <>
        <TextReaderApp content="Hello file" fileName="hello.txt" />
        <ImageViewerApp fileName="icon.png" src="/icon.png" />
      </>,
    );

    expect(screen.getByText("hello.txt")).toBeVisible();
    expect(screen.getByText("Hello file")).toBeVisible();
    expect(screen.getByRole("img", { name: "icon.png" })).toHaveAttribute(
      "src",
      "/icon.png",
    );
  });

  it("performs calculator operations and utilities", async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    await clickCalcKey(user, "1");
    await clickCalcKey(user, "+");
    await clickCalcKey(user, "2");
    await clickCalcKey(user, "=");
    expect(getCalculatorDisplay("3")).toBeVisible();

    await clickCalcKey(user, "AC");
    await clickCalcKey(user, "9");
    await clickCalcKey(user, "÷");
    await clickCalcKey(user, "0");
    await clickCalcKey(user, "=");
    expect(getCalculatorDisplay("Error")).toBeVisible();

    await clickCalcKey(user, "AC");
    await clickCalcKey(user, "5");
    await clickCalcKey(user, "±");
    expect(getCalculatorDisplay("-5")).toBeVisible();
    await clickCalcKey(user, "±");
    await clickCalcKey(user, "DEL");
    expect(getCalculatorDisplay("0")).toBeVisible();
    await clickCalcKey(user, ".");
    await clickCalcKey(user, ".");
    expect(getCalculatorDisplay("0.")).toBeVisible();

    await clickCalcKey(user, "AC");
    await clickCalcKey(user, "2");
    await clickCalcKey(user, "+");
    await clickCalcKey(user, "3");
    await clickCalcKey(user, "×");
    await clickCalcKey(user, "4");
    await clickCalcKey(user, "=");
    expect(getCalculatorDisplay("20")).toBeVisible();
  });
});

describe("Browser app", () => {
  it("normalizes URLs, validates input, tracks history, reloads, and opens externally", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<BrowserApp initialUrl="example.com/path" />);

    expect(
      screen.getByTitle("Browser preview for https://example.com/path"),
    ).toBeVisible();

    await user.clear(screen.getByLabelText("URL"));
    await user.keyboard("notaurl");
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(
      screen.getByTitle("Browser preview for https://notaurl/"),
    ).toBeVisible();

    await user.clear(screen.getByLabelText("URL"));
    await user.keyboard("mailto:test@example.com");
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(screen.getByText("Enter a valid http(s) URL.")).toBeVisible();

    await user.clear(screen.getByLabelText("URL"));
    await user.keyboard("https://robin.build/blog");
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(
      screen.getByTitle("Browser preview for https://robin.build/blog"),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(
      screen.getByTitle("Browser preview for https://notaurl/"),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Forward" }));
    expect(
      screen.getByTitle("Browser preview for https://robin.build/blog"),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Reload" }));
    await user.click(screen.getByRole("button", { name: "Open in new tab" }));
    expect(window.open).toHaveBeenCalledWith(
      "https://robin.build/blog",
      "_blank",
      "noopener,noreferrer",
    );

    rerender(<BrowserApp initialUrl="https://liquidium.fi" />);
    expect(
      screen.getByTitle("Browser preview for https://liquidium.fi/"),
    ).toBeVisible();
  });
});

describe("Blog app", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the selected post, syncs history, and copies links", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    render(<BlogApp initialSlug="not-a-post" />);

    expect(
      screen.getByRole("heading", { name: FIRST_BLOG_POST.title }),
    ).toBeVisible();
    expect(window.location.pathname).toBe(`/blog/${FIRST_BLOG_POST.slug}`);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: "Copied link" })).toBeVisible();
    expect(writeText).toHaveBeenCalledWith(
      `http://localhost:3000/blog/${FIRST_BLOG_POST.slug}`,
    );

    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(screen.getByRole("button", { name: "Copy link" })).toBeVisible();
  });

  it("falls back to execCommand when clipboard writes fail", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(
      new Error("no clipboard"),
    );
    document.execCommand = vi.fn();

    render(<BlogApp initialSlug={FIRST_BLOG_POST.slug} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
      await Promise.resolve();
    });

    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });
});

describe("Files and notes apps", () => {
  it("opens files, folders, images, links, and apps through callbacks", async () => {
    const user = userEvent.setup();
    const onOpenText = vi.fn();
    const onOpenImage = vi.fn();
    const onOpenLink = vi.fn();
    const onOpenApp = vi.fn();

    render(
      <FilesApp
        onOpenApp={onOpenApp}
        onOpenImage={onOpenImage}
        onOpenLink={onOpenLink}
        onOpenText={onOpenText}
      />,
    );

    await user.click(screen.getByRole("button", { name: /README\.md/ }));
    expect(onOpenText).toHaveBeenCalledWith({
      content: DESKTOP_README_CONTENT,
      fileName: DESKTOP_README_FILE_NAME,
    });

    await user.click(screen.getByText("Applications"));
    await user.click(screen.getByRole("button", { name: /Calculator/ }));
    expect(onOpenApp).toHaveBeenCalledWith({ appId: "calculator" });

    await user.click(screen.getByText("Images"));
    await user.click(screen.getByRole("button", { name: /icon\.png/ }));
    expect(onOpenImage).toHaveBeenCalledWith({
      fileName: "icon.png",
      src: "/icon.png",
    });

    await user.click(screen.getByText("Desktop"));
    await user.click(screen.getByRole("button", { name: /RunesSwap/ }));
    expect(onOpenLink).toHaveBeenCalledWith({ href: "https://runesswap.app" });
  });

  it("uses window.open for links when no link callback is provided", async () => {
    const user = userEvent.setup();
    render(<FilesApp />);

    await user.click(screen.getByRole("button", { name: /RunesSwap/ }));
    expect(window.open).toHaveBeenCalledWith(
      "https://runesswap.app",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("creates, selects, updates, deletes, and persists notes", async () => {
    const user = userEvent.setup();
    crypto.randomUUID = createTestUuidGenerator();

    render(<NotesApp />);

    await user.click(screen.getByRole("button", { name: "BlockNote editor" }));
    expect(await screen.findByText("Typed note")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "New" }));
    expect(screen.getAllByText("paragraph").length).toBeGreaterThan(0);
    expect(localStorage.getItem("notesApp.bn.notes")).toContain(TEST_NOTE_ID);

    const deleteButton = screen
      .getAllByRole("button")
      .find((button) => button.querySelector("svg"));
    expect(deleteButton).toBeDefined();
    if (!deleteButton) {
      throw new Error("Expected a note delete button.");
    }
    await user.click(deleteButton);
    expect(screen.queryByText("Typed note")).not.toBeInTheDocument();
    expect(localStorage.getItem("notesApp.bn.notes")).toBe("[]");
  });
});

describe("AppWindow and status bar", () => {
  it("handles controls and desktop resizing", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onMinimize = vi.fn();
    const { container } = render(
      <AppWindow
        title="Test Window"
        onClose={onClose}
        onMinimize={onMinimize}
        initialWidth={500}
        initialHeight={400}
        minWidth={300}
        minHeight={300}
      >
        Window body
      </AppWindow>,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.click(screen.getByRole("button", { name: "Minimize" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onMinimize).toHaveBeenCalledTimes(1);

    const resizeHandle = container.querySelector(".cursor-nwse-resize");
    expect(resizeHandle).toBeInstanceOf(HTMLElement);
    if (!(resizeHandle instanceof HTMLElement)) {
      throw new Error("Expected a resize handle.");
    }
    fireEvent.pointerDown(resizeHandle, { clientX: 500, clientY: 400 });
    fireEvent.pointerMove(window, { clientX: 560, clientY: 460 });
    fireEvent.pointerUp(window);

    await user.click(screen.getByRole("button", { name: "Toggle maximize" }));
    expect(screen.getByRole("dialog", { name: "Test Window" })).toHaveClass(
      "w-screen",
    );
  });

  it("uses mobile window sizing when matchMedia matches", () => {
    setMobileViewport(true);

    render(<AppWindow title="Mobile Window">Mobile body</AppWindow>);

    expect(screen.getByRole("dialog", { name: "Mobile Window" })).toHaveStyle({
      top: "48px",
    });
    expect(
      document.querySelector(".cursor-nwse-resize"),
    ).not.toBeInTheDocument();
  });

  it("opens and closes status bar calendar and clock popovers", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-22T13:14:15"));
    render(<StatusBar />);

    fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    fireEvent.keyDown(screen.getByRole("button", { name: "Close calendar" }), {
      key: "Escape",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open clock" }));
    expect(screen.getByText(/Monday, June 22, 2026/)).toBeVisible();
    fireEvent.keyDown(screen.getByRole("button", { name: "Close clock" }), {
      key: "Enter",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("toggles fullscreen and handles home navigation", () => {
    const requestFullscreen = vi.fn();
    const exitFullscreen = vi.fn();
    Object.defineProperty(document.documentElement, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: exitFullscreen,
    });

    render(<StatusBar />);

    fireEvent.click(screen.getByRole("button", { name: "Enter fullscreen" }));
    expect(requestFullscreen).toHaveBeenCalled();
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      value: document.documentElement,
    });
    fireEvent(document, new Event("fullscreenchange"));
    fireEvent.click(screen.getByRole("button", { name: "Exit fullscreen" }));
    expect(exitFullscreen).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Go to home" })).toBeVisible();

    const assign = vi.fn();
    navigateHome({ assign, href: "" });
    expect(assign).toHaveBeenCalledWith("/");

    const blockedAssign = vi.fn(() => {
      throw new Error("navigation blocked");
    });
    const fallbackTarget = { assign: blockedAssign, href: "" };
    navigateHome(fallbackTarget);
    expect(fallbackTarget.href).toBe("/");
  });
});

describe("Desktop and Snake app", () => {
  it("launches HomeScreen through skip and continue flows", async () => {
    vi.useFakeTimers();
    const { unmount } = render(<HomeScreen />);

    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole("button", { name: "Skip to blog" }));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();

    render(<HomeScreen />);
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue Continue" }));
    expect(screen.getByText("starting robin.build...")).toBeVisible();
    vi.useRealTimers();
  });

  it("opens desktop windows from shortcuts and dock controls", async () => {
    const user = userEvent.setup();
    render(<Desktop name="Robin" />);

    expect(screen.getAllByText("Files")[0]).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Open desktop README" }),
    );
    expect(
      await screen.findByRole("dialog", { name: DESKTOP_README_FILE_NAME }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Open Calculator" }));
    expect(
      await screen.findByRole("dialog", { name: "Calculator" }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Open Browser" }));
    expect(
      await screen.findByRole("dialog", { name: "Browser" }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Open Files" }));
    expect(await screen.findByRole("dialog", { name: "Files" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Open Notes" }));
    expect(await screen.findByRole("dialog", { name: "Notes" })).toBeVisible();

    const openBlogButton = screen.getAllByRole("button", {
      name: "Open Blog",
    })[0];
    expect(openBlogButton).toBeDefined();
    if (!openBlogButton) {
      throw new Error("Expected an Open Blog desktop shortcut.");
    }
    await user.click(openBlogButton);
    expect(await screen.findByRole("dialog", { name: "Blog" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Open RunesSwap" }));
    expect(
      await screen.findByRole("dialog", { name: "Browser" }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("runs snake movement, scoring, pause, and restart controls", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValue(0);

    render(<SnakeApp />);

    expect(screen.getByText("Score: 0")).toBeVisible();
    act(() => {
      vi.advanceTimersByTime(140);
    });
    expect(screen.getByText("Score: 1")).toBeVisible();

    fireEvent.keyDown(window, { key: " " });
    fireEvent.keyDown(window, { key: "w" });
    fireEvent.keyDown(window, { key: "a" });
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByText("Score: 0")).toBeVisible();
    vi.useRealTimers();
  });
});
