"use client";

import { motion, useDragControls, useMotionValue } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AppWindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  /** Pass a ref to constrain dragging within this element. Optional. */
  dragConstraints?: React.RefObject<HTMLElement | null> | false;
  /** Initial top offset in pixels. */
  top?: number;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  /** Enable window edge/corner resizing. Default: true */
  resizable?: boolean;
}

const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";
const MOBILE_WINDOW_GUTTER_PX = 24;
const MOBILE_WINDOW_RESERVED_HEIGHT_PX = 132;
const MOBILE_WINDOW_TOP_PX = 48;
const DESKTOP_DRAG_THRESHOLD_PX = 2;
const MOBILE_DRAG_THRESHOLD_PX = 8;
type ResizeHandle = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const RESIZE_HANDLES = [
  {
    handle: "top-left",
    className: "left-0 top-0 cursor-nwse-resize",
  },
  {
    handle: "top-right",
    className: "right-0 top-0 cursor-nesw-resize",
  },
  {
    handle: "bottom-left",
    className: "bottom-0 left-0 cursor-nesw-resize",
  },
  {
    handle: "bottom-right",
    className: "bottom-0 right-0 cursor-nwse-resize",
  },
] satisfies Array<{
  handle: ResizeHandle;
  className: string;
}>;

/** Tracks whether the viewport matches the mobile breakpoint. */
function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const sync = () => setIsMobile(media.matches);
    sync();

    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

export function AppWindow({
  title,
  children,
  className,
  bodyClassName,
  onClose,
  onMinimize,
  dragConstraints,
  top = 64,
  initialWidth = 960,
  initialHeight = 560,
  minWidth = 640,
  minHeight = 420,
  resizable = true,
}: AppWindowProps) {
  const controls = useDragControls();
  const labelId = useId();
  const isMobile = useIsMobileViewport();
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [maximized, setMaximized] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const resizingRef = useRef<null | {
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startMotionX: number;
    startMotionY: number;
    handle: ResizeHandle;
  }>(null);
  const resizeCleanupRef = useRef<null | (() => void)>(null);

  const startResize = (handle: ResizeHandle, e: React.PointerEvent) => {
    if (maximized || isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    resizeCleanupRef.current?.();
    resizingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
      startMotionX: x.get(),
      startMotionY: y.get(),
      handle,
    };

    const onMove = (ev: PointerEvent) => {
      const r = resizingRef.current;
      if (!r) return;
      const dx = ev.clientX - r.startX;
      const dy = ev.clientY - r.startY;
      const resizesLeft = r.handle.endsWith("left");
      const resizesTop = r.handle.startsWith("top");
      const nextWidth = Math.max(minWidth, r.startW + (resizesLeft ? -dx : dx));
      const nextHeight = Math.max(
        minHeight,
        r.startH + (resizesTop ? -dy : dy),
      );

      const widthDelta = nextWidth - r.startW;
      const heightDelta = nextHeight - r.startH;

      x.set(r.startMotionX + (resizesLeft ? -widthDelta / 2 : widthDelta / 2));
      if (resizesTop) {
        y.set(r.startMotionY - heightDelta);
      }

      setSize({ width: nextWidth, height: nextHeight });
    };
    const onUp = () => {
      resizingRef.current = null;
      resizeCleanupRef.current?.();
      resizeCleanupRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    resizeCleanupRef.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  };

  useEffect(() => {
    return () => {
      resizeCleanupRef.current?.();
      resizeCleanupRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    x.set(0);
    y.set(0);
  }, [isMobile, x, y]);

  const canDrag = !maximized;
  const mobileWindowWidth = `min(${size.width}px, calc(100vw - ${MOBILE_WINDOW_GUTTER_PX}px))`;
  const mobileWindowHeight = `min(${size.height}px, calc(100dvh - ${MOBILE_WINDOW_RESERVED_HEIGHT_PX}px))`;

  /**
   * Starts dragging from titlebar while ignoring window controls.
   */
  const startDragFromTitlebar = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canDrag) return;
    if (event.button !== 0) return;

    const target = event.target as HTMLElement | null;
    if (target?.closest("[data-window-control='true']")) return;

    controls.start(event, {
      distanceThreshold: isMobile
        ? MOBILE_DRAG_THRESHOLD_PX
        : DESKTOP_DRAG_THRESHOLD_PX,
    });
  };

  return (
    <motion.div
      role="dialog"
      aria-labelledby={labelId}
      className={cn(
        // Make the window a flex column so the body can flex and
        // the titlebar height doesn't cause the content to overflow/cut off.
        "mx-auto rounded-2xl border border-border bg-background shadow-xl overflow-hidden",
        "fixed flex h-full flex-col",
        maximized
          ? "inset-0 left-0 top-0 w-screen h-screen"
          : "left-1/2 -translate-x-1/2",
        className,
      )}
      style={
        maximized
          ? { x, y }
          : isMobile
            ? {
                top: MOBILE_WINDOW_TOP_PX,
                width: mobileWindowWidth,
                height: mobileWindowHeight,
                x,
                y,
              }
            : { top, width: size.width, height: size.height, x, y }
      }
      drag={canDrag}
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragConstraints ?? undefined}
    >
      {/* Titlebar / Drag handle */}
      <div
        className={cn(
          "relative flex items-center gap-2 border-b border-border select-none touch-none",
          isMobile ? "h-11 px-2.5" : "h-10 px-4",
          canDrag ? "cursor-move" : "cursor-default",
        )}
        onPointerDown={startDragFromTitlebar}
      >
        <div
          className={cn(
            "flex items-center pr-2",
            isMobile ? "gap-0 pr-1.5" : "gap-2",
          )}
        >
          <button
            type="button"
            data-window-control="true"
            aria-label="Close"
            onClick={onClose}
            className={cn(
              "grid place-items-center rounded-full transition-transform hover:scale-105",
              isMobile ? "h-9 w-8" : "h-4 w-4",
            )}
          >
            <span
              className={cn(
                "rounded-full bg-red-500",
                isMobile ? "h-3.5 w-3.5" : "h-2.5 w-2.5",
              )}
            />
          </button>
          <button
            type="button"
            data-window-control="true"
            aria-label="Minimize"
            onClick={onMinimize}
            className={cn(
              "grid place-items-center rounded-full transition-transform hover:scale-105",
              isMobile ? "h-9 w-8" : "h-4 w-4",
            )}
          >
            <span
              className={cn(
                "rounded-full bg-yellow-500",
                isMobile ? "h-3.5 w-3.5" : "h-2.5 w-2.5",
              )}
            />
          </button>
          <button
            type="button"
            data-window-control="true"
            aria-label="Toggle maximize"
            onClick={() => {
              // Reset any drag offsets so maximized window anchors to viewport
              x.set(0);
              y.set(0);
              setMaximized((v) => !v);
            }}
            className={cn(
              "grid place-items-center rounded-full transition-transform hover:scale-105",
              isMobile ? "h-9 w-8" : "h-4 w-4",
            )}
          >
            <span
              className={cn(
                "rounded-full bg-green-500",
                isMobile ? "h-3.5 w-3.5" : "h-2.5 w-2.5",
              )}
            />
          </button>
        </div>
        <div
          id={labelId}
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 max-w-[60%] -translate-x-1/2 -translate-y-1/2 truncate text-center font-medium",
            isMobile ? "text-xs" : "text-sm",
          )}
        >
          {title}
        </div>
      </div>

      {/* Body */}
      <div
        className={cn(
          // Let the body take remaining space under the titlebar.
          "flex flex-1 min-h-0 flex-col overflow-hidden",
          bodyClassName,
        )}
      >
        {children}
      </div>

      {/* Resize handles (disabled when maximized or not resizable) */}
      {!maximized &&
        resizable &&
        !isMobile &&
        RESIZE_HANDLES.map((handle) => (
          <div
            className={cn(
              "absolute z-10 h-4 w-4 touch-none select-none",
              handle.className,
            )}
            key={handle.handle}
            onPointerDown={(e) => startResize(handle.handle, e)}
          />
        ))}
    </motion.div>
  );
}
