/**
 * Canonical project web shortcuts shown on the desktop and in the Files app.
 */
export const PROJECT_WEB_SHORTCUTS = [
  {
    id: "dayline",
    name: "Dayline",
    host: "dayline.robin.build",
    href: "https://dayline.robin.build",
    iconSrc: "https://dayline.robin.build/images/icon-256.webp",
  },
  {
    id: "runesswap",
    name: "RunesSwap",
    host: "runesswap.app",
    href: "https://runesswap.app",
    iconSrc: "/images/project-icons/runesswap_logo.png",
  },
  {
    id: "bitcoinpuppets-community",
    name: "Bitcoin Puppets",
    host: "bitcoinpuppets.community",
    href: "https://bitcoinpuppets.community/",
    iconSrc: "/images/project-icons/bitcoinpuppets_icon_light.png",
    iconSrcLight: "/images/project-icons/bitcoinpuppets_icon_light.png",
    iconSrcDark: "/images/project-icons/bitcoinpuppets_icon_dark.png",
  },
  {
    id: "liquidium-fi",
    name: "Liquidium Fi",
    host: "liquidium.fi",
    href: "https://liquidium.fi",
    iconSrc: "/images/project-icons/liquidium_fi_icon_light.svg",
    iconSrcLight: "/images/project-icons/liquidium_fi_icon_light.svg",
    iconSrcDark: "/images/project-icons/liquidium_fi_icon_dark.svg",
  },
  {
    id: "liquidium-wtf",
    name: "Liquidium WTF",
    host: "liquidium.wtf",
    href: "https://liquidium.wtf",
    iconSrc: "/images/project-icons/liquidium_wtf_icon.svg",
  },
  {
    id: "liquidium-org",
    name: "Liquidium Org",
    host: "liquidium.org",
    href: "https://liquidium.org",
    iconSrc: "/images/project-icons/liquidium_org_icon.svg",
  },
] as const;

export type ProjectWebShortcut = (typeof PROJECT_WEB_SHORTCUTS)[number];

/**
 * Returns the icon URL for a shortcut based on current theme preference.
 */
export const getShortcutIconSrc = (
  shortcut: ProjectWebShortcut,
  isDarkTheme: boolean,
): string => {
  if (isDarkTheme && "iconSrcDark" in shortcut && shortcut.iconSrcDark) {
    return shortcut.iconSrcDark;
  }
  if (!isDarkTheme && "iconSrcLight" in shortcut && shortcut.iconSrcLight) {
    return shortcut.iconSrcLight;
  }
  return shortcut.iconSrc;
};

export const DESKTOP_README_FILE_NAME = "README.md" as const;

/**
 * Short, plain-text quick start shown in the Text Reader when opening README.
 */
export const DESKTOP_README_CONTENT = `# robin.build Desktop

Welcome. This is your mini web OS workspace.

Quick Start
- Click desktop icons to open apps, links, and files.
- Open Blog for educational notes with shareable URLs.
- Drag windows from the top bar.
- Use yellow to minimize and red to close a window.
- Click the green window control to maximize that window.
- Click the top-right fullscreen button for immersive mode (Esc exits too).

Finder (Files App)
- Open "Desktop" to see your desktop shortcuts and README.
- Open "Applications" for built-in apps and your project site shortcuts.
- Double-click any item to open it.

Pinned Project Shortcuts
- dayline.robin.build
- runesswap.app
- bitcoinpuppets.community
- liquidium.fi
- liquidium.wtf
- liquidium.org

Blog
- /blog/fix-codex-cli-colors-ssh-ghostty
- /blog
`;
