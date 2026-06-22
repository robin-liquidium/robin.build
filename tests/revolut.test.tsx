import { act, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { CallbackClient } from "@/src/features/revolut-personal/CallbackClient";
import { DocumentPage } from "@/src/features/revolut-personal/DocumentPage";

type RouteWithComponent = {
  component: React.ComponentType;
  head: () => {
    meta: Array<Record<string, string>>;
  };
  headers?: () => Record<string, string>;
};

/** Casts mocked TanStack route objects to the tiny shape used in tests. */
function asTestRoute(route: object): RouteWithComponent {
  return route as RouteWithComponent;
}

describe("Revolut document pages", () => {
  it("renders shared document page chrome", () => {
    render(
      <DocumentPage
        eyebrow="Utility"
        title="Personal Terms"
        updatedAt="June 21, 2026"
      >
        <p>Document body</p>
      </DocumentPage>,
    );

    expect(screen.getByRole("link", { name: "robin.build" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("heading", { name: "Personal Terms" }),
    ).toBeVisible();
    expect(screen.getByText("Last updated: June 21, 2026")).toBeVisible();
    expect(screen.getByText("Document body")).toBeVisible();
  });

  it("renders privacy and terms route metadata and content", async () => {
    const privacy = await import("@/src/routes/revolut-personal/privacy");
    const terms = await import("@/src/routes/revolut-personal/terms");
    const PrivacyComponent = asTestRoute(privacy.Route).component;
    const TermsComponent = asTestRoute(terms.Route).component;

    expect(asTestRoute(privacy.Route).head().meta[0]).toEqual({
      title: "Revolut Personal CLI Privacy Notice | robin.build",
    });
    expect(asTestRoute(terms.Route).head().meta[0]).toEqual({
      title: "Revolut Personal CLI Terms | robin.build",
    });

    render(
      <>
        <PrivacyComponent />
        <TermsComponent />
      </>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Revolut Personal CLI Privacy Notice",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Revolut Personal CLI Terms" }),
    ).toBeVisible();
  });
});

describe("Revolut callback", () => {
  it("shows an empty-state message after reading a URL without params", async () => {
    window.history.replaceState({}, "", "/revolut-personal/callback");

    render(<CallbackClient />);

    expect(
      await screen.findByText(
        "No authorization code was found in this callback URL.",
      ),
    ).toBeVisible();
  });

  it("shows callback errors", async () => {
    window.history.replaceState(
      {},
      "",
      "/revolut-personal/callback?error=access_denied",
    );

    render(<CallbackClient />);

    expect(
      await screen.findByText("Authorization returned an error"),
    ).toBeVisible();
    expect(screen.getByText("access_denied")).toBeVisible();
  });

  it("builds and copies the local exchange command", async () => {
    window.history.replaceState(
      {},
      "",
      "/revolut-personal/callback?code=abc123&state=state-value",
    );
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);

    render(<CallbackClient />);

    const copyButton = await screen.findByRole("button", {
      name: "Copy command",
    });
    vi.useFakeTimers();
    await act(async () => {
      fireEvent.click(copyButton);
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("code=abc123"),
    );
    expect(screen.getByRole("button", { name: "Copied" })).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(screen.getByRole("button", { name: "Copy command" })).toBeVisible();
    vi.useRealTimers();
  });

  it("sets callback route headers", async () => {
    const { Route } = await import("@/src/routes/revolut-personal/callback");
    const route = asTestRoute(Route);

    expect(route.headers?.()).toEqual({
      "Cache-Control": "no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    });
    expect(route.head().meta).toContainEqual({
      name: "robots",
      content: "noindex, nofollow",
    });

    const CallbackComponent = route.component;
    render(<CallbackComponent />);
    expect(
      screen.getByRole("heading", { name: "Revolut Personal CLI" }),
    ).toBeVisible();
  });
});
