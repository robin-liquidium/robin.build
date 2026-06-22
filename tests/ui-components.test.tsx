import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarDays, Circle } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { MorphingText } from "@/components/magicui/morphing-text";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
  useTerminalSequenceItem,
} from "@/components/magicui/terminal";
import { NoiseBackground } from "@/components/NoiseBackground";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dock } from "@/components/ui/dock";
import { Noise } from "@/components/ui/noise";
import { SlidingNumber } from "@/components/ui/sliding-number";
import { Textarea } from "@/components/ui/textarea";
import { type TreeNode, TreeView } from "@/components/ui/tree-view";

const TREE_DATA: TreeNode[] = [
  {
    id: "root",
    label: "Root",
    children: [
      { id: "child", label: "Child" },
      { id: "sibling", label: "Sibling", icon: <Circle aria-hidden /> },
    ],
  },
];

/** Custom terminal item used to exercise the sequence hook. */
function ManualTerminalItem() {
  const { complete, isActive } = useTerminalSequenceItem();
  return isActive ? (
    <button type="button" onClick={complete}>
      Manual step
    </button>
  ) : null;
}

describe("primitive components", () => {
  it("renders button and badge variants including asChild composition", () => {
    render(
      <>
        <Button variant="secondary" size="sm">
          Plain button
        </Button>
        <Button asChild variant="link">
          <a href="/linked">Linked button</a>
        </Button>
        <Badge variant="outline">Status</Badge>
        <Badge asChild variant="destructive">
          <a href="/danger">Danger</a>
        </Badge>
      </>,
    );

    expect(screen.getByRole("button", { name: "Plain button" })).toHaveClass(
      "h-8",
    );
    expect(screen.getByRole("link", { name: "Linked button" })).toHaveAttribute(
      "href",
      "/linked",
    );
    expect(screen.getByText("Status")).toHaveAttribute("data-slot", "badge");
    expect(screen.getByRole("link", { name: "Danger" })).toHaveAttribute(
      "href",
      "/danger",
    );
    expect(buttonVariants({ variant: "destructive", size: "icon" })).toContain(
      "h-9",
    );
    expect(badgeVariants({ variant: "secondary" })).toContain("bg-secondary");
  });

  it("renders textarea with forwarded props", () => {
    render(<Textarea aria-label="Notes" placeholder="Write" disabled />);

    expect(screen.getByLabelText("Notes")).toBeDisabled();
    expect(screen.getByPlaceholderText("Write")).toBeVisible();
  });

  it("renders calendar with merged class names and custom chevron", () => {
    render(
      <Calendar
        month={new Date("2026-06-01T00:00:00Z")}
        className="calendar-test"
        classNames={{ day_button: "custom-day" }}
        components={{
          Chevron: () => <CalendarDays aria-label="custom calendar nav" />,
        }}
      />,
    );

    expect(screen.getByText("June 2026")).toBeVisible();
    expect(screen.getAllByLabelText("custom calendar nav")).toHaveLength(2);
  });

  it("renders sliding numbers with padding, sign, and decimals", () => {
    render(
      <>
        <SlidingNumber value={7} padStart />
        <SlidingNumber value={-12.34} decimalSeparator="," />
      </>,
    );

    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText("-")).toBeVisible();
    expect(screen.getByText(",")).toBeVisible();
  });

  it("renders noise canvas and background wrapper", () => {
    render(
      <>
        <Noise patternSize={2} patternRefreshInterval={1} />
        <NoiseBackground />
      </>,
    );

    expect(document.querySelectorAll("canvas")).toHaveLength(2);
  });
});

describe("interactive UI components", () => {
  it("runs dock item actions", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Dock
        compact
        items={[{ icon: Circle, label: "Launch", onClick }]}
        className="dock-test"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Launch" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("selects and expands tree nodes in controlled and uncontrolled modes", async () => {
    const user = userEvent.setup();
    const onNodeClick = vi.fn();
    const onNodeExpand = vi.fn();
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <TreeView
        data={TREE_DATA}
        onNodeClick={onNodeClick}
        onNodeExpand={onNodeExpand}
        animateExpand={false}
      />,
    );

    await user.click(screen.getByText("Root"));
    expect(onNodeExpand).toHaveBeenCalledWith("root", true);
    expect(onNodeClick).toHaveBeenCalledWith(TREE_DATA[0]);
    expect(screen.getByText("Child")).toBeVisible();

    await user.click(screen.getByText("Child"));
    expect(screen.getByText("Child").closest("div")).toHaveClass(
      "bg-accent/80",
    );

    rerender(
      <TreeView
        data={TREE_DATA}
        defaultExpandedIds={["root"]}
        multiSelect
        onSelectionChange={onSelectionChange}
        selectedIds={["child"]}
        showIcons={false}
        showLines={false}
      />,
    );

    await user.keyboard("{Control>}");
    await user.click(screen.getByText("Sibling"));
    await user.keyboard("{/Control}");
    expect(onSelectionChange).toHaveBeenCalledWith(["child", "sibling"]);
  });

  it("toggles theme with the animated theme button", async () => {
    const user = userEvent.setup();

    render(<AnimatedThemeToggler />);

    await user.click(screen.getByRole("button"));
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("renders the interactive hover button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <InteractiveHoverButton onClick={onClick}>
        Continue
      </InteractiveHoverButton>,
    );

    await user.click(screen.getByRole("button", { name: "Continue Continue" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Magic UI animation components", () => {
  it("types hyper text and can restart with keyboard", async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(
      <TypingAnimation duration={10} startOnView={false}>
        boot
      </TypingAnimation>,
    );

    await act(async () => {
      vi.advanceTimersByTime(0);
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });
    expect(screen.getByText("boot")).toBeVisible();

    const { TypingHyperText } = await import(
      "@/components/custom/typing-hyper-text"
    );
    render(
      <TypingHyperText
        typeInterval={10}
        scrambleDuration={10}
        characterSet={["x"]}
        onComplete={onComplete}
      >
        hi
      </TypingHyperText>,
    );

    act(() => {
      vi.advanceTimersByTime(50);
    });
    fireEvent.keyDown(screen.getByLabelText("hi"), { key: "Enter" });
    expect(screen.getByLabelText("hi")).toBeVisible();
    vi.useRealTimers();
  });

  it("morphs text layers and terminal sequences advance", async () => {
    const user = userEvent.setup();

    render(<MorphingText texts={["good", "night"]} />);
    expect(
      screen.getByTitle("Morphing text filter definitions"),
    ).toBeInTheDocument();

    render(
      <Terminal startOnView={false}>
        <AnimatedSpan>First</AnimatedSpan>
        <TypingAnimation duration={1} startOnView={false}>
          Second
        </TypingAnimation>
        <ManualTerminalItem />
      </Terminal>,
    );

    expect(await screen.findByText("First")).toBeVisible();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Manual step")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Manual step" }));
  });

  it("renders terminal children immediately when sequence is disabled", () => {
    render(
      <Terminal sequence={false}>
        <AnimatedSpan>Always visible</AnimatedSpan>
      </Terminal>,
    );

    expect(screen.getByText("Always visible")).toBeVisible();
  });
});
