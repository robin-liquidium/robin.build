"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { TypingHyperText } from "@/components/custom/typing-hyper-text";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
  useTerminalSequenceItem,
} from "@/components/magicui/terminal";
import { cn } from "@/lib/utils";

const TERMINAL_NAME_INPUT_ID = "terminal-name-input";
type InitialDesktopApp = "blog";
const DesktopShell = lazy(async () => {
  const { Desktop } = await import("@/components/os/Desktop");
  return { default: Desktop };
});

interface HomeScreenProps {
  initialApp?: InitialDesktopApp;
  initialBlogSlug?: string;
}

type TerminalNamePromptProps = {
  onBootComplete: () => void;
  onNameSubmit: (name: string) => void;
};

/** Keeps the document from scrolling while the desktop surface owns the screen. */
function useDesktopScrollLock(isLocked: boolean) {
  useEffect(() => {
    const html = document.documentElement;
    const { style: htmlStyle } = html;
    const { style: bodyStyle } = document.body;

    if (isLocked) {
      htmlStyle.overflow = "hidden";
      bodyStyle.overflow = "hidden";
    } else {
      htmlStyle.overflow = "";
      bodyStyle.overflow = "";
    }

    return () => {
      htmlStyle.overflow = "";
      bodyStyle.overflow = "";
    };
  }, [isLocked]);
}

/** Keeps the viewport stable while the desktop shell loads on demand. */
function DesktopLoading() {
  return <div className="min-h-screen bg-background" aria-hidden="true" />;
}

/** Prompts for the user's name as the final step in the terminal boot sequence. */
function TerminalNamePrompt({
  onBootComplete,
  onNameSubmit,
}: TerminalNamePromptProps) {
  const { isActive, complete } = useTerminalSequenceItem();
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const input = document.getElementById(
      TERMINAL_NAME_INPUT_ID,
    ) as HTMLInputElement | null;
    input?.focus();
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-mono text-muted-foreground">{">"}</span>
      <label
        htmlFor={TERMINAL_NAME_INPUT_ID}
        className="font-mono text-muted-foreground"
      >
        enter your name:
      </label>
      <input
        id={TERMINAL_NAME_INPUT_ID}
        className="ml-2 min-w-0 flex-1 bg-transparent font-mono outline-none placeholder:text-muted-foreground"
        placeholder="your name"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && value.trim()) {
            setSubmitted(true);
            const name = value.trim();
            onNameSubmit(name);
            complete();
            onBootComplete();
          }
        }}
        disabled={submitted}
        aria-label="enter your name"
      />
    </div>
  );
}

/** Runs the robin.build boot flow and mounts the interactive desktop. */
export function HomeScreen({ initialApp, initialBlogSlug }: HomeScreenProps) {
  const startsInBlog = initialApp === "blog";
  const [showCta, setShowCta] = useState(false);
  const [launched, setLaunched] = useState(startsInBlog);
  const [bootComplete, setBootComplete] = useState(startsInBlog);
  const [initialDesktopApp, setInitialDesktopApp] = useState<
    InitialDesktopApp | undefined
  >(initialApp);
  const [userName, setUserName] = useState<string | null>(null);
  const desktopActive = launched && bootComplete;

  useEffect(() => {
    if (!launched) return;
    if (initialDesktopApp === "blog") return;
    setBootComplete(false);
  }, [launched, initialDesktopApp]);

  useDesktopScrollLock(desktopActive);

  /** Launches straight into a named desktop app without replaying the boot flow. */
  const launchDesktop = (app?: InitialDesktopApp) => {
    setInitialDesktopApp(app);
    setLaunched(true);
    if (app === "blog") {
      setUserName(null);
      setBootComplete(true);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center">
      {!bootComplete && (
        <div className="absolute right-4 top-4 z-30">
          <AnimatedThemeToggler className="grid size-8 cursor-pointer place-items-center rounded-md outline-none focus:outline-none" />
        </div>
      )}

      <div
        className={
          "flex flex-col items-center gap-4 transition-all duration-500 ease-out " +
          (launched
            ? "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
            : "translate-y-0 scale-100 opacity-100")
        }
        aria-hidden={launched}
      >
        <TypingHyperText
          className="text-4xl sm:text-6xl"
          typeInterval={140}
          scrambleDuration={420}
          onComplete={() => setShowCta(true)}
        >
          robin.build
        </TypingHyperText>
        <div
          className={
            (showCta ? "mt-1 h-12" : "mt-0 h-0 ") +
            " w-full overflow-hidden transition-[height,margin] duration-300 ease-out"
          }
        >
          <div
            className={
              "flex w-full justify-center transition-all duration-300 ease-out " +
              (showCta
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0")
            }
          >
            <InteractiveHoverButton onClick={() => launchDesktop()}>
              Continue
            </InteractiveHoverButton>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={cn(
          "fixed inset-x-0 bottom-5 z-20 mx-auto w-fit rounded-md px-3 py-2",
          "font-mono text-xs text-muted-foreground underline-offset-4",
          "transition-colors hover:text-foreground hover:underline",
          showCta && !launched
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => launchDesktop("blog")}
      >
        Skip to blog
      </button>

      {launched && !bootComplete ? (
        <div
          className="absolute inset-0 z-10 grid place-items-center"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex w-full items-center justify-center px-4 sm:px-0">
            <Terminal startOnView={false} className="shadow-sm">
              <TypingAnimation className="text-muted-foreground">
                {"> start robin.build"}
              </TypingAnimation>

              <AnimatedSpan className="text-muted-foreground">
                starting robin.build...
              </AnimatedSpan>

              <AnimatedSpan className="text-green-500">
                - initializing kernel
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                - mounting workspace volume
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                - loading core services
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                - network online
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                - window manager ready
              </AnimatedSpan>
              <TypingAnimation className="text-muted-foreground">
                launching apps: files, editor, terminal
              </TypingAnimation>
              <AnimatedSpan className="text-muted-foreground">
                boot complete - welcome to robin.build
              </AnimatedSpan>
              <TerminalNamePrompt
                onNameSubmit={setUserName}
                onBootComplete={() => setBootComplete(true)}
              />
            </Terminal>
          </div>
        </div>
      ) : null}

      {desktopActive ? (
        <div className="fixed inset-0 z-10">
          <Suspense fallback={<DesktopLoading />}>
            <DesktopShell
              initialApp={initialDesktopApp}
              initialBlogSlug={initialBlogSlug}
              name={userName ?? undefined}
            />
          </Suspense>
        </div>
      ) : null}
    </div>
  );
}
