"use client";

import {
  BookOpenText,
  Calculator,
  Compass,
  FileText,
  Folder,
  Moon,
  StickyNote,
  SunDim,
} from "lucide-react";
import {
  lazy,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MorphingText } from "@/components/magicui/morphing-text";
import { AppWindow } from "@/components/os/AppWindow";
import StatusBar from "@/components/os/StatusBar";
import { Dock } from "@/components/ui/dock";
import {
  DESKTOP_README_CONTENT,
  DESKTOP_README_FILE_NAME,
  getShortcutIconSrc,
  PROJECT_WEB_SHORTCUTS,
} from "@/lib/desktop-shortcuts";
import { cn } from "@/lib/utils";

const BrowserApp = lazy(() => import("@/components/os/apps/BrowserApp"));
const CalculatorApp = lazy(() => import("@/components/os/apps/CalculatorApp"));
const BlogApp = lazy(() => import("@/components/os/apps/BlogApp"));
const FilesApp = lazy(async () => {
  const module = await import("@/components/os/apps/FilesApp");
  return { default: module.FilesApp };
});
const ImageViewerApp = lazy(
  () => import("@/components/os/apps/ImageViewerApp"),
);
const NotesApp = lazy(() => import("@/components/os/apps/NotesApp"));
const SnakeApp = lazy(() => import("@/components/os/apps/SnakeApp"));
const TextReaderApp = lazy(() => import("@/components/os/apps/TextReaderApp"));

interface DesktopProps {
  className?: string;
  initialApp?: "blog";
  initialBlogSlug?: string;
  name?: string;
}

interface DesktopShortcutButtonProps {
  label: string;
  ariaLabel: string;
  icon: ReactNode;
  onClick: () => void;
}

/** Shared desktop shortcut tile so all shortcuts use one visual language. */
function DesktopShortcutButton({
  label,
  ariaLabel,
  icon,
  onClick,
}: DesktopShortcutButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "group flex w-20 flex-col items-center gap-1.5 rounded-md p-1.5 sm:w-28 sm:gap-2 sm:p-2",
        "transition-colors hover:bg-foreground/5 focus:outline-none",
      )}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md sm:h-12 sm:w-12",
          "bg-foreground/5 text-foreground transition-colors",
          "group-hover:bg-foreground/10",
        )}
      >
        {icon}
      </div>
      <span className="text-center text-[11px] leading-3.5 text-foreground/90 sm:text-xs sm:leading-4">
        {label}
      </span>
    </button>
  );
}

/** Keeps window bodies stable while a lazily loaded app chunk arrives. */
function WindowLoading({ label }: { label: string }) {
  return (
    <div className="grid min-h-0 flex-1 place-items-center p-4 text-sm text-muted-foreground">
      Loading {label}...
    </div>
  );
}

export function Desktop({
  className,
  initialApp,
  initialBlogSlug,
  name,
}: DesktopProps) {
  const [filesOpen, setFilesOpen] = useState(false);
  const openFiles = useCallback(() => setFilesOpen(true), []);
  const closeFiles = useCallback(() => setFilesOpen(false), []);
  const [calcOpen, setCalcOpen] = useState(false);
  const openCalc = useCallback(() => setCalcOpen(true), []);
  const closeCalc = useCallback(() => setCalcOpen(false), []);
  const [notesOpen, setNotesOpen] = useState(false);
  const openNotes = useCallback(() => setNotesOpen(true), []);
  const closeNotes = useCallback(() => setNotesOpen(false), []);
  const [blogOpen, setBlogOpen] = useState(initialApp === "blog");
  const openBlog = useCallback(() => setBlogOpen(true), []);
  const closeBlog = useCallback(() => setBlogOpen(false), []);
  const [snakeOpen, setSnakeOpen] = useState(false);
  const openSnake = useCallback(() => setSnakeOpen(true), []);
  const closeSnake = useCallback(() => setSnakeOpen(false), []);
  // Z-order management for windows (declare early so callbacks can depend on it)
  const [, setZCounter] = useState(20);
  const [zMap, setZMap] = useState<Record<string, number>>({});
  const bringToFront = useCallback((key: string) => {
    setZCounter((z) => {
      const next = z + 1;
      setZMap((m) => ({ ...m, [key]: next }));
      return next;
    });
  }, []);
  const [browserState, setBrowserState] = useState<{
    open: boolean;
    url: string;
  }>({ open: false, url: "https://robin.build" });
  const openBrowser = useCallback(
    (payload?: { url?: string }) => {
      setBrowserState((previousState) => ({
        open: true,
        url: payload?.url ?? previousState.url,
      }));
      bringToFront("browser");
    },
    [bringToFront],
  );
  const closeBrowser = useCallback(
    () =>
      setBrowserState((previousState) => ({ ...previousState, open: false })),
    [],
  );
  const [textReader, setTextReader] = useState<{
    open: boolean;
    fileName?: string;
    content?: string;
  }>({ open: false });
  const openTextReader = useCallback(
    (payload: { fileName: string; content: string }) => {
      setTextReader({
        open: true,
        fileName: payload.fileName,
        content: payload.content,
      });
      bringToFront("text");
    },
    [bringToFront],
  );
  const closeTextReader = useCallback(() => setTextReader({ open: false }), []);
  const [imageViewer, setImageViewer] = useState<{
    open: boolean;
    fileName?: string;
    src?: string;
  }>({ open: false });
  const openImageViewer = useCallback(
    (payload: { fileName: string; src: string }) => {
      setImageViewer({
        open: true,
        fileName: payload.fileName,
        src: payload.src,
      });
      bringToFront("image");
    },
    [bringToFront],
  );
  const closeImageViewer = useCallback(
    () => setImageViewer({ open: false }),
    [],
  );
  const desktopRef = useRef<HTMLDivElement | null>(null);
  // Theme toggle for Dock
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    try {
      setIsDark(document.documentElement.classList.contains("dark"));
    } catch {}
  }, []);
  const toggleTheme = useCallback(() => {
    try {
      const dark = document.documentElement.classList.toggle("dark");
      setIsDark(dark);
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
  }, []);

  // Time-aware greeting for background morphing text
  const [greeting, setGreeting] = useState<string>("morning");
  useEffect(() => {
    const compute = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return "morning";
      if (hour >= 12 && hour < 18) return "afternoon";
      if (hour >= 18 && hour < 22) return "evening";
      return "night";
    };
    setGreeting(compute());
    const id = setInterval(() => setGreeting(compute()), 60_000);
    return () => clearInterval(id);
  }, []);
  const displayName = name ?? "{name}";

  useEffect(() => {
    if (filesOpen) bringToFront("files");
  }, [filesOpen, bringToFront]);
  useEffect(() => {
    if (calcOpen) bringToFront("calc");
  }, [calcOpen, bringToFront]);
  useEffect(() => {
    if (notesOpen) bringToFront("notes");
  }, [notesOpen, bringToFront]);
  useEffect(() => {
    if (blogOpen) bringToFront("blog");
  }, [blogOpen, bringToFront]);
  useEffect(() => {
    if (snakeOpen) bringToFront("snake");
  }, [snakeOpen, bringToFront]);

  /** Opens a URL inside the in-OS browser window. */
  const openInBrowser = useCallback(
    (href: string) => {
      openBrowser({ url: href });
    },
    [openBrowser],
  );

  return (
    <div
      className={cn("relative min-h-screen w-full select-none", className)}
      ref={desktopRef}
    >
      {/* Subtle morphing greeting in the background */}
      <div className="pointer-events-none absolute inset-0 z-0 grid place-items-center">
        <MorphingText
          texts={["good", greeting, displayName]}
          className="text-foreground font-mono opacity-10"
        />
      </div>
      {/* Top-right status bar */}
      <StatusBar />

      {/* Desktop icons */}
      <div className="absolute left-3 top-14 grid grid-cols-2 gap-2 sm:left-6 sm:top-6 sm:grid-cols-1 sm:gap-4">
        <DesktopShortcutButton
          label="Files"
          ariaLabel="Files"
          onClick={() => {
            openFiles();
            bringToFront("files");
          }}
          icon={<Folder className="h-6 w-6" />}
        />

        <DesktopShortcutButton
          label="README.md"
          ariaLabel="Open desktop README"
          onClick={() => {
            openTextReader({
              fileName: DESKTOP_README_FILE_NAME,
              content: DESKTOP_README_CONTENT,
            });
            bringToFront("text");
          }}
          icon={<FileText className="h-6 w-6" />}
        />

        <DesktopShortcutButton
          label="Blog"
          ariaLabel="Open Blog"
          onClick={() => {
            openBlog();
            bringToFront("blog");
          }}
          icon={<BookOpenText className="h-6 w-6" />}
        />

        {PROJECT_WEB_SHORTCUTS.map((shortcut) => (
          <DesktopShortcutButton
            key={shortcut.id}
            label={shortcut.name}
            ariaLabel={`Open ${shortcut.name}`}
            onClick={() => openInBrowser(shortcut.href)}
            icon={
              <img
                src={getShortcutIconSrc(shortcut, isDark)}
                alt={`${shortcut.name} logo`}
                width={48}
                height={48}
                className="h-8 w-8 rounded-[4px] object-contain"
                decoding="async"
                loading="lazy"
              />
            }
          />
        ))}
      </div>

      {/* Dock pinned to bottom */}
      <div className="pointer-events-none fixed inset-x-0 bottom-1 z-10">
        <div className="pointer-events-auto flex w-full items-center justify-center">
          <Dock
            compact
            items={[
              {
                icon: Compass,
                label: "Browser",
                ariaLabel: "Open Browser",
                onClick: () => {
                  openBrowser();
                },
              },
              {
                icon: Folder,
                label: "Files",
                ariaLabel: "Open Files",
                onClick: () => {
                  openFiles();
                  bringToFront("files");
                },
              },
              {
                icon: Calculator,
                label: "Calculator",
                ariaLabel: "Open Calculator",
                onClick: () => {
                  openCalc();
                  bringToFront("calc");
                },
              },
              {
                icon: StickyNote,
                label: "Notes",
                ariaLabel: "Open Notes",
                onClick: () => {
                  openNotes();
                  bringToFront("notes");
                },
              },
              {
                icon: BookOpenText,
                label: "Blog",
                ariaLabel: "Open Blog",
                onClick: () => {
                  openBlog();
                  bringToFront("blog");
                },
              },
              {
                icon: isDark ? SunDim : Moon,
                label: "Theme",
                ariaLabel: "Toggle theme",
                onClick: toggleTheme,
              },
            ]}
          />
        </div>
      </div>

      {/* App windows */}
      {filesOpen && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: zMap.files ?? 20 }}
        >
          <div
            className="pointer-events-auto"
            onPointerDown={() => bringToFront("files")}
          >
            <AppWindow
              title="Files"
              onClose={closeFiles}
              onMinimize={closeFiles}
              dragConstraints={desktopRef}
              initialWidth={980}
              initialHeight={600}
            >
              <Suspense fallback={<WindowLoading label="Files" />}>
                <FilesApp
                  onOpenText={openTextReader}
                  onOpenImage={openImageViewer}
                  onOpenLink={({ href }) => openInBrowser(href)}
                  onOpenApp={({ appId }) => {
                    if (appId === "calculator") {
                      openCalc();
                      bringToFront("calc");
                    } else if (appId === "notes") {
                      openNotes();
                      bringToFront("notes");
                    } else if (appId === "blog") {
                      openBlog();
                      bringToFront("blog");
                    } else if (appId === "snake") {
                      openSnake();
                      bringToFront("snake");
                    } else if (appId === "files") {
                      openFiles();
                      bringToFront("files");
                    } else if (appId === "browser") {
                      openBrowser();
                    }
                  }}
                />
              </Suspense>
            </AppWindow>
          </div>
        </div>
      )}

      {browserState.open && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: (zMap as Record<string, number>).browser ?? 20 }}
        >
          <div
            className="pointer-events-auto"
            onPointerDown={() => bringToFront("browser")}
          >
            <AppWindow
              title="Browser"
              onClose={closeBrowser}
              onMinimize={closeBrowser}
              dragConstraints={desktopRef}
              initialWidth={1100}
              initialHeight={680}
              minWidth={460}
              minHeight={360}
            >
              <Suspense fallback={<WindowLoading label="Browser" />}>
                <BrowserApp initialUrl={browserState.url} />
              </Suspense>
            </AppWindow>
          </div>
        </div>
      )}

      {calcOpen && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: zMap.calc ?? 20 }}
        >
          <div
            className="pointer-events-auto"
            onPointerDown={() => bringToFront("calc")}
          >
            <AppWindow
              title="Calculator"
              onClose={closeCalc}
              onMinimize={closeCalc}
              dragConstraints={desktopRef}
              initialWidth={360}
              initialHeight={610}
              minWidth={280}
              minHeight={360}
              resizable={false}
            >
              <Suspense fallback={<WindowLoading label="Calculator" />}>
                <CalculatorApp />
              </Suspense>
            </AppWindow>
          </div>
        </div>
      )}

      {notesOpen && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: zMap.notes ?? 20 }}
        >
          <div
            className="pointer-events-auto"
            onPointerDown={() => bringToFront("notes")}
          >
            <AppWindow
              title="Notes"
              onClose={closeNotes}
              onMinimize={closeNotes}
              dragConstraints={desktopRef}
              initialWidth={820}
              initialHeight={560}
            >
              <Suspense fallback={<WindowLoading label="Notes" />}>
                <NotesApp />
              </Suspense>
            </AppWindow>
          </div>
        </div>
      )}

      {blogOpen && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: zMap.blog ?? 20 }}
        >
          <div
            className="pointer-events-auto"
            onPointerDown={() => bringToFront("blog")}
          >
            <AppWindow
              title="Blog"
              onClose={closeBlog}
              onMinimize={closeBlog}
              dragConstraints={desktopRef}
              initialWidth={960}
              initialHeight={660}
              minWidth={360}
              minHeight={420}
            >
              <Suspense fallback={<WindowLoading label="Blog" />}>
                <BlogApp initialSlug={initialBlogSlug} />
              </Suspense>
            </AppWindow>
          </div>
        </div>
      )}

      {textReader.open && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: (zMap as Record<string, number>).text ?? 20 }}
        >
          <div
            className="pointer-events-auto"
            onPointerDown={() => bringToFront("text")}
          >
            <AppWindow
              title={textReader.fileName ?? "Text Reader"}
              onClose={closeTextReader}
              onMinimize={closeTextReader}
              dragConstraints={desktopRef}
              initialWidth={780}
              initialHeight={520}
            >
              <Suspense fallback={<WindowLoading label="Text Reader" />}>
                <TextReaderApp
                  fileName={textReader.fileName ?? "Untitled.txt"}
                  content={textReader.content ?? ""}
                />
              </Suspense>
            </AppWindow>
          </div>
        </div>
      )}

      {imageViewer.open && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: (zMap as Record<string, number>).image ?? 20 }}
        >
          <div
            className="pointer-events-auto"
            onPointerDown={() => bringToFront("image")}
          >
            <AppWindow
              title={imageViewer.fileName ?? "Image Viewer"}
              onClose={closeImageViewer}
              onMinimize={closeImageViewer}
              dragConstraints={desktopRef}
              initialWidth={720}
              initialHeight={560}
            >
              <Suspense fallback={<WindowLoading label="Image Viewer" />}>
                <ImageViewerApp
                  fileName={imageViewer.fileName ?? "image"}
                  src={imageViewer.src ?? ""}
                />
              </Suspense>
            </AppWindow>
          </div>
        </div>
      )}

      {snakeOpen && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: (zMap as Record<string, number>).snake ?? 20 }}
        >
          <div
            className="pointer-events-auto"
            onPointerDown={() => bringToFront("snake")}
          >
            <AppWindow
              title="Snake"
              onClose={closeSnake}
              onMinimize={closeSnake}
              dragConstraints={desktopRef}
              initialWidth={520}
              initialHeight={640}
            >
              <Suspense fallback={<WindowLoading label="Snake" />}>
                <SnakeApp />
              </Suspense>
            </AppWindow>
          </div>
        </div>
      )}
    </div>
  );
}
