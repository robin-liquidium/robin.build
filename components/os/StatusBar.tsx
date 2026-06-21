"use client";

import { Maximize2, Minimize2, Power } from "lucide-react";
import { type KeyboardEvent, useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { SlidingNumber } from "@/components/ui/sliding-number";

export default function StatusBar() {
  const [now, setNow] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [clockOpen, setClockOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /** Returns the current fullscreen element across standard and WebKit APIs. */
  const getFullscreenElement = useCallback((): Element | null => {
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
    };
    return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(getFullscreenElement()));
    };

    onFullscreenChange();
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange,
      );
    };
  }, [getFullscreenElement]);

  /** Toggles true browser fullscreen for an immersive desktop experience. */
  const toggleFullscreen = useCallback(async () => {
    try {
      if (getFullscreenElement()) {
        const doc = document as Document & {
          webkitExitFullscreen?: () => Promise<void> | void;
        };
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
          return;
        }
        if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
        return;
      }

      const root = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      };
      if (root.requestFullscreen) {
        await root.requestFullscreen();
        return;
      }
      if (root.webkitRequestFullscreen) {
        await root.webkitRequestFullscreen();
      }
    } catch {
      // Ignore: fullscreen can fail when browser policies block it.
    }
  }, [getFullscreenElement]);

  const hours24 = now.getHours();
  const hours12 = ((hours24 + 11) % 12) + 1; // 1-12
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ampm = hours24 >= 12 ? "PM" : "AM";

  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
  }).format(now);
  const fullDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);

  /**
   * Closes popovers when activated with keyboard from overlay elements.
   */
  const handleDismissOverlayKey = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, onClose: () => void) => {
      if (
        event.key === "Escape" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        onClose();
      }
    },
    [],
  );

  return (
    <div className="pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-1.5 sm:right-3 sm:gap-2">
      <Badge
        asChild
        variant="secondary"
        className="pointer-events-auto h-10 cursor-pointer select-none px-2 font-mono text-xs tracking-tight sm:h-auto sm:px-2"
      >
        <button
          type="button"
          className="inline-flex min-h-10 items-center sm:min-h-0"
          aria-label="Open calendar"
          onClick={() => {
            setCalendarOpen((v) => !v);
            setClockOpen(false);
          }}
        >
          {date}
        </button>
      </Badge>
      <Badge
        asChild
        variant="secondary"
        className="pointer-events-auto h-10 cursor-pointer select-none px-2 font-mono text-xs tracking-tight sm:h-auto sm:px-2"
      >
        <button
          type="button"
          className="inline-flex min-h-10 items-center sm:min-h-0"
          aria-label="Open clock"
          onClick={() => {
            setClockOpen((v) => !v);
            setCalendarOpen(false);
          }}
        >
          <span className="flex items-center gap-1 tabular-nums">
            <SlidingNumber value={hours12} padStart />
            <span>:</span>
            <SlidingNumber value={minutes} padStart />
            <span>:</span>
            <SlidingNumber value={seconds} padStart />
            <span className="ml-1 text-muted-foreground">{ampm}</span>
          </span>
        </button>
      </Badge>
      {/* Power button: hard navigate to landing to reset state */}
      <button
        type="button"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        onClick={toggleFullscreen}
        className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background/70 text-foreground shadow-sm transition-colors hover:bg-foreground/10 sm:h-7 sm:w-7"
      >
        {isFullscreen ? (
          <Minimize2 className="h-5 w-5 sm:h-4 sm:w-4" />
        ) : (
          <Maximize2 className="h-5 w-5 sm:h-4 sm:w-4" />
        )}
      </button>
      <button
        type="button"
        aria-label="Go to home"
        onClick={() => {
          try {
            window.location.assign("/");
          } catch {
            // Fallback
            window.location.href = "/";
          }
        }}
        className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background/70 text-foreground shadow-sm transition-colors hover:bg-foreground/10 sm:h-7 sm:w-7"
      >
        <Power className="h-5 w-5 sm:h-4 sm:w-4" />
      </button>
      {calendarOpen ? (
        <div
          className="pointer-events-auto fixed inset-0 z-20"
          onClick={() => setCalendarOpen(false)}
          onKeyDown={(event) =>
            handleDismissOverlayKey(event, () => setCalendarOpen(false))
          }
          role="button"
          tabIndex={0}
          aria-label="Close calendar"
        >
          <div
            className="absolute right-2 top-10 rounded-xl border border-border bg-background p-2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <Calendar
              mode="single"
              selected={now}
              initialFocus
              classNames={{
                day_button:
                  "pointer-events-none cursor-default group-data-[selected]:rounded-full hover:rounded-full group-[.range-start]:rounded-full group-[.range-end]:rounded-full group-[.range-middle]:rounded-full",
              }}
            />
          </div>
        </div>
      ) : null}
      {clockOpen ? (
        <div
          className="pointer-events-auto fixed inset-0 z-20"
          onClick={() => setClockOpen(false)}
          onKeyDown={(event) =>
            handleDismissOverlayKey(event, () => setClockOpen(false))
          }
          role="button"
          tabIndex={0}
          aria-label="Close clock"
        >
          <div
            className="absolute right-2 top-10 w-[min(92vw,420px)] rounded-xl border border-border bg-background/95 p-3 shadow-xl backdrop-blur md:p-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <div className="flex items-end justify-center gap-1.5 text-5xl font-mono tabular-nums md:gap-2 md:text-6xl">
              <SlidingNumber value={hours12} padStart />
              <span>:</span>
              <SlidingNumber value={minutes} padStart />
              <span>:</span>
              <SlidingNumber value={seconds} padStart />
              <span className="mb-1 text-sm text-muted-foreground md:text-base">
                {ampm}
              </span>
            </div>
            <div className="mt-2 text-center text-xs text-muted-foreground md:text-sm">
              {fullDate}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
