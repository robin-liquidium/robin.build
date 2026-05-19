"use client";

import {
  AppWindow,
  BookOpenText,
  Calculator as CalculatorIcon,
  Clock,
  Compass,
  Download,
  FileText,
  Folder,
  Gamepad2,
  Globe,
  Home,
  Image as ImageIcon,
  StickyNote,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type TreeNode, TreeView } from "@/components/ui/tree-view";
import {
  DESKTOP_README_CONTENT,
  DESKTOP_README_FILE_NAME,
  getShortcutIconSrc,
  PROJECT_WEB_SHORTCUTS,
} from "@/lib/desktop-shortcuts";
import { cn } from "@/lib/utils";

interface FilesAppProps {
  className?: string;
  onOpenText?: (payload: { fileName: string; content: string }) => void;
  onOpenImage?: (payload: { fileName: string; src: string }) => void;
  onOpenLink?: (payload: { href: string }) => void;
  onOpenApp?: (payload: {
    appId: "blog" | "browser" | "calculator" | "notes" | "files" | "snake";
  }) => void;
}

const sidebarData: TreeNode[] = [
  { id: "recents", label: "Recents", icon: <Clock className="h-4 w-4" /> },
  {
    id: "favorites",
    label: "Favorites",
    children: [
      { id: "desktop", label: "Desktop", icon: <Home className="h-4 w-4" /> },
      {
        id: "applications",
        label: "Applications",
        icon: <AppWindow className="h-4 w-4" />,
      },
      {
        id: "documents",
        label: "Documents",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: "downloads",
        label: "Downloads",
        icon: <Download className="h-4 w-4" />,
      },
      {
        id: "images",
        label: "Images",
        icon: <ImageIcon className="h-4 w-4" />,
      },
      {
        id: "code",
        label: "code",
        icon: <Folder className="h-4 w-4" />,
        children: [
          {
            id: "robin-build",
            label: "robin.build",
            icon: <Folder className="h-4 w-4" />,
          },
        ],
      },
    ],
  },
];

// Minimal in-memory VFS
type FileType = "folder" | "text" | "link" | "app" | "image";
type FileEntry = {
  name: string;
  type: FileType;
  icon: React.ReactNode;
  modified: string;
  children?: FileEntry[];
  content?: string;
  href?: string;
  src?: string;
  appId?: "blog" | "browser" | "calculator" | "notes" | "files" | "snake";
};

const VFS_DATE = {
  RECENT: "Sep 12, 2025",
  MID: "Sep 11, 2025",
  OLDER: "Sep 10, 2025",
} as const;

/** Renders a compact website logo icon for link entries in the Files table. */
const makeShortcutIcon = (src: string, alt: string): React.ReactNode => (
  <Image
    src={src}
    alt={alt}
    width={16}
    height={16}
    className="h-4 w-4 rounded-[3px] bg-zinc-900 object-contain p-[1px]"
  />
);

const makeVfsRoot = (isDarkTheme: boolean): Record<string, FileEntry> => {
  const projectWebShortcuts: FileEntry[] = PROJECT_WEB_SHORTCUTS.map(
    (shortcut) => ({
      name: shortcut.name,
      type: "link",
      icon: makeShortcutIcon(
        getShortcutIconSrc(shortcut, isDarkTheme),
        `${shortcut.name} logo`,
      ),
      modified: VFS_DATE.RECENT,
      href: shortcut.href,
    }),
  );

  const desktop: FileEntry = {
    name: "Desktop",
    type: "folder",
    icon: <Home className="h-4 w-4" />,
    modified: VFS_DATE.RECENT,
    children: [
      {
        name: "Files",
        type: "app",
        icon: <AppWindow className="h-4 w-4" />,
        modified: VFS_DATE.MID,
        appId: "files",
      },
      {
        name: "Blog",
        type: "app",
        icon: <BookOpenText className="h-4 w-4" />,
        modified: VFS_DATE.RECENT,
        appId: "blog",
      },
      {
        name: DESKTOP_README_FILE_NAME,
        type: "text",
        icon: <FileText className="h-4 w-4" />,
        modified: VFS_DATE.RECENT,
        content: DESKTOP_README_CONTENT,
      },
      ...projectWebShortcuts,
    ],
  };

  const documents: FileEntry = {
    name: "Documents",
    type: "folder",
    icon: <FileText className="h-4 w-4" />,
    modified: VFS_DATE.MID,
    children: [
      {
        name: "design-notes.md",
        type: "text",
        icon: <FileText className="h-4 w-4" />,
        modified: VFS_DATE.RECENT,
        content: `# Design Notes\n\nThis is a small web OS experiment.\n\n- Windows: drag, resize, z-order\n- Dock: quick launch\n- Files: simple VFS and text reader`,
      },
    ],
  };

  const robinBuildFolder: FileEntry = {
    name: "robin.build",
    type: "folder",
    icon: <Folder className="h-4 w-4" />,
    modified: VFS_DATE.OLDER,
    children: [
      {
        name: "Visit robin.build",
        type: "link",
        icon: <Globe className="h-4 w-4" />,
        modified: VFS_DATE.OLDER,
        href: "https://robin.build",
      },
    ],
  };

  const code: FileEntry = {
    name: "code",
    type: "folder",
    icon: <Folder className="h-4 w-4" />,
    modified: VFS_DATE.OLDER,
    children: [robinBuildFolder],
  };

  const images: FileEntry = {
    name: "Images",
    type: "folder",
    icon: <ImageIcon className="h-4 w-4" />,
    modified: VFS_DATE.MID,
    children: [
      {
        name: "icon.png",
        type: "image",
        icon: <ImageIcon className="h-4 w-4" />,
        modified: VFS_DATE.RECENT,
        src: "/icon.png",
      },
      ((): FileEntry => {
        const liquidiumChildren: FileEntry[] = [
          {
            name: "liquidium_black_horizontal.png",
            type: "image",
            icon: <ImageIcon className="h-4 w-4" />,
            modified: VFS_DATE.MID,
            src: "/images/liquidium-images/liquidium_black_horizontal.png",
          },
          {
            name: "liquidium_black_logomark.png",
            type: "image",
            icon: <ImageIcon className="h-4 w-4" />,
            modified: VFS_DATE.MID,
            src: "/images/liquidium-images/liquidium_black_logomark.png",
          },
          {
            name: "liquidium_black_vertical.png",
            type: "image",
            icon: <ImageIcon className="h-4 w-4" />,
            modified: VFS_DATE.MID,
            src: "/images/liquidium-images/liquidium_black_vertical.png",
          },
          {
            name: "liquidium_logo-black-circle.png",
            type: "image",
            icon: <ImageIcon className="h-4 w-4" />,
            modified: VFS_DATE.MID,
            src: "/images/liquidium-images/liquidium_logo-black-circle.png",
          },
          {
            name: "liquidium_logo-black-square.png",
            type: "image",
            icon: <ImageIcon className="h-4 w-4" />,
            modified: VFS_DATE.MID,
            src: "/images/liquidium-images/liquidium_logo-black-square.png",
          },
          {
            name: "liquidium_logo-white-circle.png",
            type: "image",
            icon: <ImageIcon className="h-4 w-4" />,
            modified: VFS_DATE.MID,
            src: "/images/liquidium-images/liquidium_logo-white-circle.png",
          },
          {
            name: "liquidium_logo-white-square.png",
            type: "image",
            icon: <ImageIcon className="h-4 w-4" />,
            modified: VFS_DATE.MID,
            src: "/images/liquidium-images/liquidium_logo-white-square.png",
          },
        ];
        return {
          name: "liquidium",
          type: "folder",
          icon: <Folder className="h-4 w-4" />,
          modified: VFS_DATE.MID,
          children: liquidiumChildren,
        };
      })(),
    ],
  };

  return {
    desktop,
    applications: {
      name: "Applications",
      type: "folder",
      icon: <AppWindow className="h-4 w-4" />,
      modified: VFS_DATE.OLDER,
      children: [
        {
          name: "Browser",
          type: "app",
          icon: <Compass className="h-4 w-4" />,
          modified: VFS_DATE.MID,
          appId: "browser",
        },
        {
          name: "Calculator",
          type: "app",
          icon: <CalculatorIcon className="h-4 w-4" />,
          modified: VFS_DATE.MID,
          appId: "calculator",
        },
        {
          name: "Notes",
          type: "app",
          icon: <StickyNote className="h-4 w-4" />,
          modified: VFS_DATE.MID,
          appId: "notes",
        },
        {
          name: "Blog",
          type: "app",
          icon: <BookOpenText className="h-4 w-4" />,
          modified: VFS_DATE.RECENT,
          appId: "blog",
        },
        {
          name: "Snake",
          type: "app",
          icon: <Gamepad2 className="h-4 w-4" />,
          modified: VFS_DATE.MID,
          appId: "snake",
        },
        ...projectWebShortcuts,
      ],
    },
    documents,
    downloads: {
      name: "Downloads",
      type: "folder",
      icon: <Download className="h-4 w-4" />,
      modified: VFS_DATE.OLDER,
      children: [],
    },
    images,
    code,
    "robin-build": robinBuildFolder,
    liquidium: images.children?.find(
      (c) => c.name === "liquidium",
    ) as FileEntry,
  } as const;
};

export function FilesApp({
  className,
  onOpenText,
  onOpenImage,
  onOpenLink,
  onOpenApp,
}: FilesAppProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setIsDarkTheme(root.classList.contains("dark"));
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const vfs = useMemo(() => makeVfsRoot(isDarkTheme), [isDarkTheme]);
  const [currentFolderId, setCurrentFolderId] = useState<string>("desktop");

  const currentFolder: FileEntry | null = useMemo(() => {
    return (
      (vfs as Record<string, FileEntry | undefined>)[currentFolderId] ?? null
    );
  }, [vfs, currentFolderId]);

  const items: FileEntry[] = currentFolder?.children ?? [];

  const handleNodeClick = useCallback(
    (node: TreeNode) => {
      // Map tree node ids to VFS keys
      const targetId = node.id;
      if (targetId in vfs) {
        setCurrentFolderId(targetId);
      }
    },
    [vfs],
  );

  const handleOpen = useCallback(
    (entry: FileEntry) => {
      if (entry.type === "folder") {
        // Find by name match among vfs keys for known folders
        const byName = Object.entries(vfs).find(
          ([, v]) => v.name === entry.name,
        );
        if (byName) setCurrentFolderId(byName[0]);
        return;
      }
      if (entry.type === "link" && entry.href) {
        onOpenLink?.({ href: entry.href });
        if (onOpenLink) return;
        try {
          window.open(entry.href, "_blank", "noopener,noreferrer");
        } catch {}
        return;
      }
      if (entry.type === "text" && entry.content) {
        onOpenText?.({ fileName: entry.name, content: entry.content });
        return;
      }
      if (entry.type === "image") {
        const src = entry.src ?? `/${entry.name}`;
        onOpenImage?.({ fileName: entry.name, src });
        return;
      }
      if (entry.type === "app" && entry.appId) {
        onOpenApp?.({ appId: entry.appId });
        return;
      }
    },
    [onOpenText, onOpenImage, onOpenLink, onOpenApp, vfs],
  );

  const toolbarTitle = currentFolder?.name ?? "Recents";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col md:flex-row", className)}>
      {/* Sidebar */}
      <div className="w-full max-h-44 shrink-0 overflow-auto border-b border-border/80 p-2 md:max-h-none md:w-60 md:border-b-0 md:border-r">
        <TreeView
          data={sidebarData}
          className="bg-transparent border-0"
          defaultExpandedIds={["favorites", "code"]}
          showLines={false}
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border/80 px-3 py-2 md:px-6 md:py-3">
          <div className="text-xs font-medium md:text-sm">{toolbarTitle}</div>
          <div className="text-[11px] text-muted-foreground md:text-xs">
            <span className="md:hidden">Tap to open</span>
            <span className="hidden md:inline">Double-click to open</span>
          </div>
        </div>

        {/* Mobile list */}
        <div className="flex-1 overflow-auto p-2 md:hidden">
          <div className="space-y-1">
            {items.map((entry) => (
              <button
                key={entry.name}
                type="button"
                onClick={() => handleOpen(entry)}
                className="flex w-full items-center gap-2 rounded-md border border-border/70 px-2 py-2 text-left transition-colors hover:bg-accent/40"
              >
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">
                  {entry.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">
                    {entry.name}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {entry.type} • {entry.modified}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden flex-1 overflow-auto p-3 md:block">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <tr className="text-muted-foreground">
                <th className="py-2 pr-2 pl-3 text-left font-normal">Name</th>
                <th className="py-2 px-2 text-left font-normal">Kind</th>
                <th className="py-2 pl-2 text-left font-normal">Modified</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr
                  key={f.name}
                  className="cursor-default group"
                  onDoubleClick={() => handleOpen(f)}
                >
                  <td className="py-2 pr-2 pl-3 rounded-l-md group-hover:bg-accent/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground">
                        {f.icon}
                      </span>
                      <span>{f.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground group-hover:bg-accent/40 transition-colors">
                    {f.type}
                  </td>
                  <td className="py-2 pl-2 text-muted-foreground rounded-r-md group-hover:bg-accent/40 transition-colors">
                    {f.modified}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
