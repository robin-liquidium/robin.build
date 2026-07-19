import { SITE_URL } from "@/lib/site";

export type BlogBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "code";
      language: string;
      code: string;
    }
  | {
      type: "link";
      href: string;
      label: string;
    };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  tags: string[];
  content: BlogBlock[];
}

export const BLOG_POSTS = [
  {
    slug: "building-dayline-macos-menu-bar",
    title: "Building Dayline: Calendar, Linear, and notes in one macOS menu",
    description:
      "Dayline is a lightweight native macOS menu bar app that keeps Google Calendar, Linear issues, and local notes one click away.",
    publishedAt: "2026-07-19",
    updatedAt: "2026-07-19",
    readingTime: "4 min read",
    tags: ["macOS", "SwiftUI", "productivity", "open source"],
    content: [
      {
        type: "paragraph",
        text: "My day was hiding in three different apps.",
      },
      {
        type: "paragraph",
        text: "Meetings lived in Google Calendar. Work lived in Linear. Temporary thoughts, reminders, and things I did not want to forget lived in local notes.",
      },
      {
        type: "paragraph",
        text: "None of those tools was broken. The annoying part was having to keep opening them to answer tiny questions:",
      },
      {
        type: "list",
        items: [
          "What is my next meeting?",
          "Which issue should I be working on?",
          "Where did I write that thing down?",
        ],
      },
      {
        type: "paragraph",
        text: "Opening a full application or another browser tab every time felt ridiculous.",
      },
      {
        type: "paragraph",
        text: "So I built Dayline.",
      },
      {
        type: "heading",
        text: "One quiet place for the whole day",
      },
      {
        type: "paragraph",
        text: "Dayline is a native macOS app that lives entirely in the menu bar.",
      },
      {
        type: "paragraph",
        text: "There is no Dock icon and no dashboard demanding attention. Click the menu-bar item and your day appears. Click away and it disappears.",
      },
      {
        type: "paragraph",
        text: "The calendar section shows the remaining timed events for today, with tomorrow available when I want a head start. The current meeting stays visible until it is actually finished, while the next event and its countdown can sit directly in the menu bar.",
      },
      {
        type: "paragraph",
        text: "Linear issues live directly underneath. I can see assigned work, create an issue, copy its URL, change its status, or adjust its priority without opening Linear. The common actions have configurable keyboard shortcuts, because reaching for the mouse every time defeats the point.",
      },
      {
        type: "paragraph",
        text: "The final section is deliberately boring: plain local notes. The first line becomes the title, everything stays on this Mac, and capturing something takes seconds.",
      },
      {
        type: "paragraph",
        text: "That is the whole product. Calendar, work, and notes—one click away.",
      },
      {
        type: "heading",
        text: "Smallness was a design constraint",
      },
      {
        type: "paragraph",
        text: "Dayline could easily have turned into another productivity dashboard.",
      },
      {
        type: "paragraph",
        text: "I did not want that.",
      },
      {
        type: "paragraph",
        text: "The useful part is not having more information. It is removing the repeated context switch between the tools I already use.",
      },
      {
        type: "paragraph",
        text: "That shaped nearly every decision:",
      },
      {
        type: "list",
        items: [
          "Menu-bar only",
          "Native SwiftUI",
          "Fast background refresh",
          "Launch at login",
          "Keyboard-first issue actions",
          "Configurable ordering",
          "No account system",
          "No analytics or tracking",
        ],
      },
      {
        type: "paragraph",
        text: "A good utility should disappear when you are not using it. Dayline should feel like part of macOS, not another service asking to become the centre of your life.",
      },
      {
        type: "heading",
        text: "Direct and private",
      },
      {
        type: "paragraph",
        text: "Dayline has no backend.",
      },
      {
        type: "paragraph",
        text: "Your Mac connects directly to Google Calendar and Linear over HTTPS using OAuth 2.0 with PKCE. Tokens are stored in the macOS Keychain. Notes stay on disk.",
      },
      {
        type: "paragraph",
        text: "There is no Dayline server sitting between you and those services. There is no separate Dayline account, advertising system, or analytics SDK quietly recording how you use the app.",
      },
      {
        type: "paragraph",
        text: "I wanted the privacy model to fit into one paragraph without bullshit.",
      },
      {
        type: "heading",
        text: "Building it natively",
      },
      {
        type: "paragraph",
        text: "Dayline is built with SwiftUI and Swift Package Manager.",
      },
      {
        type: "paragraph",
        text: "Going native mattered because this app spends most of its life waiting quietly in the menu bar. It should launch quickly, use almost no resources in the background, and behave like a proper macOS utility.",
      },
      {
        type: "paragraph",
        text: "The small surface also forced useful discipline. Every row, action, shortcut, and setting had to justify its space. If something required turning the menu into a miniature desktop app, it probably did not belong there.",
      },
      {
        type: "paragraph",
        text: "The result is a surprisingly capable app that still feels small.",
      },
      {
        type: "heading",
        text: "Free and open source",
      },
      {
        type: "paragraph",
        text: "Dayline is free and open source.",
      },
      {
        type: "paragraph",
        text: "You can inspect the code, build it yourself, or download the signed and notarized release. It currently requires macOS 26 or newer.",
      },
      {
        type: "paragraph",
        text: "If your day also lives somewhere between Calendar, Linear, and scattered notes, give it a try:",
      },
      {
        type: "link",
        href: "https://dayline.robin.build",
        label: "Visit Dayline",
      },
      {
        type: "link",
        href: "https://github.com/robin-liquidium/dayline",
        label: "View the source on GitHub",
      },
    ],
  },
  {
    slug: "fix-codex-cli-colors-ssh-ghostty",
    title: "Fixing Codex CLI colors over SSH in Ghostty",
    description:
      "Codex CLI looked flat over SSH from Ghostty because the Ubuntu devbox did not know xterm-ghostty, and the shell environment was disabling color. This is the setup I use and the fix that made the Codex textbox background render correctly again.",
    publishedAt: "2026-05-19",
    updatedAt: "2026-05-19",
    readingTime: "6 min read",
    tags: ["development", "codex", "ssh"],
    content: [
      {
        type: "paragraph",
        text: "I run most of my coding setup on machines that are not in my backpack.",
      },
      {
        type: "paragraph",
        text: "My daily machine is a MacBook. I travel with it, work from random places, and spend a lot of time unplugged from power. My IP address changes all the time. Some days I am on hotel Wi-Fi, some days I am tethered to my phone, and some days I want to check something from the phone itself without opening the laptop at all.",
      },
      {
        type: "paragraph",
        text: "So I keep the real work somewhere else.",
      },
      {
        type: "paragraph",
        text: "At a fixed place I have a small Ubuntu devbox. I also use a VPS for the same kind of work. Both sit on Tailscale. My laptop and phone connect into that private network, and I SSH into whichever box has the context I need. Codex runs there, not on the device in my hands.",
      },
      {
        type: "paragraph",
        text: "This setup is boring in the best way. My laptop stays cool. Battery lasts longer. My phone can become a thin client when I need it. Long-running sessions do not die because I closed the lid or changed networks. I can leave a Codex session open on the devbox, come back later from a different device, and keep going.",
      },
      {
        type: "paragraph",
        text: "The annoying part was cosmetic, but it was annoying enough to fix.",
      },
      {
        type: "paragraph",
        text: "Codex CLI did not look right over SSH from Ghostty. The app worked, but the styling was off. The most obvious missing piece was the grey background behind the input textbox. Locally, Codex has a nice TUI with shaded areas and clear visual separation. Over SSH, my prompt area looked flat. It was usable, but the whole interface felt half-rendered.",
      },
      {
        type: "paragraph",
        text: "I first blamed Tailscale SSH because that is how I usually connect. Then I tried regular SSH and saw the same thing. That ruled out Tailscale. The problem sat somewhere between Ghostty, SSH, Ubuntu, and Codex's terminal rendering.",
      },
      {
        type: "heading",
        text: "The setup",
      },
      {
        type: "paragraph",
        text: "The client side:",
      },
      {
        type: "list",
        items: [
          "macOS",
          "Ghostty as the terminal",
          "SSH or Tailscale SSH into remote machines",
        ],
      },
      {
        type: "paragraph",
        text: "The server side:",
      },
      {
        type: "list",
        items: [
          "Ubuntu devbox at a fixed place",
          "Ubuntu VPS with the same issue",
          "Codex CLI installed on the remote machine",
          "Bash as the interactive shell",
        ],
      },
      {
        type: "paragraph",
        text: "Ghostty sets TERM=xterm-ghostty. That is the right value. The catch is that the remote machine also needs to know what xterm-ghostty means.",
      },
      {
        type: "paragraph",
        text: "Terminal apps read TERM as more than a label. They ask the system's terminfo database what the terminal can do. Colors, background color erase, cursor movement, alternate screen behavior, keyboard handling, mouse support: a lot of that comes from terminfo.",
      },
      {
        type: "paragraph",
        text: "On my Ubuntu box, this failed:",
      },
      {
        type: "code",
        language: "bash",
        code: "infocmp xterm-ghostty",
      },
      {
        type: "paragraph",
        text: "The output was:",
      },
      {
        type: "code",
        language: "text",
        code: "infocmp: couldn't open terminfo file /usr/share/terminfo/x/xterm-ghostty",
      },
      {
        type: "paragraph",
        text: 'That was the first real clue. Ghostty was telling the remote machine "I am xterm-ghostty", and Ubuntu was replying "never heard of it."',
      },
      {
        type: "heading",
        text: "The first fix: install Ghostty terminfo",
      },
      {
        type: "paragraph",
        text: "Ghostty documents this exact SSH problem. Newer terminal emulators often ship their own TERM value before every remote system has that entry in its terminfo database.",
      },
      {
        type: "paragraph",
        text: "The usual fix is to copy the Ghostty terminfo entry to the remote host:",
      },
      {
        type: "code",
        language: "bash",
        code: "infocmp -x xterm-ghostty | ssh user@host -- tic -x -",
      },
      {
        type: "paragraph",
        text: "That works when your local machine has the terminfo source available through infocmp. In my case, I was already inside the Ubuntu box while debugging, so I installed the compiled entry on the remote machine instead.",
      },
      {
        type: "paragraph",
        text: "Ubuntu 24.04 did not have xterm-ghostty, even after installing the extended ncurses package:",
      },
      {
        type: "code",
        language: "bash",
        code: "sudo apt-get install -y ncurses-term\ninfocmp xterm-ghostty",
      },
      {
        type: "paragraph",
        text: "Still missing.",
      },
      {
        type: "paragraph",
        text: "I pulled a packaged ghostty-terminfo entry and installed the compiled file into my user terminfo directory:",
      },
      {
        type: "code",
        language: "bash",
        code: "mkdir -p ~/.terminfo/x\ninstall -m 0644 xterm-ghostty ~/.terminfo/x/xterm-ghostty",
      },
      {
        type: "paragraph",
        text: "After that:",
      },
      {
        type: "code",
        language: "bash",
        code: "infocmp xterm-ghostty >/dev/null && echo terminfo-ok\ntput colors",
      },
      {
        type: "paragraph",
        text: "Returned:",
      },
      {
        type: "code",
        language: "text",
        code: "terminfo-ok\n256",
      },
      {
        type: "paragraph",
        text: "That fixed the remote terminal capability lookup. But Codex still did not look quite right.",
      },
      {
        type: "heading",
        text: "The second fix: clean up the SSH environment",
      },
      {
        type: "paragraph",
        text: "The next clue came from printing the color-related environment:",
      },
      {
        type: "code",
        language: "bash",
        code: 'echo "$TERM"\necho "$COLORTERM"\necho "$TERM_PROGRAM"\necho "$NO_COLOR"',
      },
      {
        type: "paragraph",
        text: "I had:",
      },
      {
        type: "code",
        language: "text",
        code: "xterm-ghostty\n\n\n1",
      },
      {
        type: "paragraph",
        text: "TERM was correct. COLORTERM and TERM_PROGRAM were empty. Worse, NO_COLOR=1 was set.",
      },
      {
        type: "paragraph",
        text: "NO_COLOR is not a vague preference. It is a convention that tells command-line programs to disable ANSI color output. If a TUI respects it, backgrounds and styling can disappear. That matched what I saw in Codex.",
      },
      {
        type: "paragraph",
        text: "For Ghostty SSH sessions, I wanted three things:",
      },
      {
        type: "list",
        items: [
          "keep TERM=xterm-ghostty",
          "set COLORTERM=truecolor",
          "unset NO_COLOR",
        ],
      },
      {
        type: "paragraph",
        text: "I added this near the top of ~/.bashrc, after the interactive-shell check:",
      },
      {
        type: "code",
        language: "bash",
        code: `# Ghostty over SSH: make color capability explicit for TUI apps such as Codex.
if [ "\${TERM:-}" = "xterm-ghostty" ]; then
    export COLORTERM="\${COLORTERM:-truecolor}"
    export TERM_PROGRAM="\${TERM_PROGRAM:-ghostty}"
    unset NO_COLOR
fi`,
      },
      {
        type: "paragraph",
        text: "Then I opened a fresh SSH session and checked:",
      },
      {
        type: "code",
        language: "bash",
        code: `echo "$TERM $COLORTERM $TERM_PROGRAM \${NO_COLOR-unset}"
infocmp xterm-ghostty >/dev/null && echo terminfo-ok
tput colors`,
      },
      {
        type: "paragraph",
        text: "Expected output:",
      },
      {
        type: "code",
        language: "text",
        code: "xterm-ghostty truecolor ghostty unset\nterminfo-ok\n256",
      },
      {
        type: "paragraph",
        text: "After that, Codex rendered correctly. The grey textbox background came back.",
      },
      {
        type: "heading",
        text: "The short version",
      },
      {
        type: "paragraph",
        text: "If Codex CLI looks flat or colorless over SSH from Ghostty, check these on the remote machine:",
      },
      {
        type: "code",
        language: "bash",
        code: 'echo "$TERM"\necho "$COLORTERM"\necho "$TERM_PROGRAM"\necho "$NO_COLOR"\ninfocmp xterm-ghostty >/dev/null && echo terminfo-ok\ntput colors',
      },
      {
        type: "paragraph",
        text: "You want:",
      },
      {
        type: "code",
        language: "text",
        code: "TERM=xterm-ghostty\nCOLORTERM=truecolor\nTERM_PROGRAM=ghostty\nNO_COLOR unset\ntput colors -> 256",
      },
      {
        type: "paragraph",
        text: "Install terminfo if infocmp fails:",
      },
      {
        type: "code",
        language: "bash",
        code: "infocmp -x xterm-ghostty | ssh user@host -- tic -x -",
      },
      {
        type: "paragraph",
        text: "If you cannot do that, use the downgrade path:",
      },
      {
        type: "code",
        language: "bash",
        code: "TERM=xterm-256color codex",
      },
      {
        type: "paragraph",
        text: "That avoids the unknown terminal type, but you lose the Ghostty-specific entry. I would rather fix terminfo once and keep the terminal honest.",
      },
      {
        type: "heading",
        text: "Why this matters to me",
      },
      {
        type: "paragraph",
        text: "I know this sounds like a small thing. The app worked before. I could still type prompts, read diffs, and run commands.",
      },
      {
        type: "paragraph",
        text: "But I spend hours in Codex now. The TUI is part of the workspace. When the input area loses its background, the interface becomes harder to scan. It feels like the terminal is lying about the state of the app. Tiny visual bugs become friction when you stare at them all day.",
      },
      {
        type: "paragraph",
        text: "The whole point of my devbox setup is that my laptop and phone stay light. I want my devices to act like windows into the same remote workspace, not like machines carrying the whole environment around. SSH should feel local enough that I forget about it.",
      },
      {
        type: "paragraph",
        text: "For Codex in Ghostty, that meant teaching Ubuntu what Ghostty is and making sure the shell was not telling Codex to turn colors off.",
      },
      {
        type: "paragraph",
        text: "Once both were fixed, the setup felt like it should have from the start.",
      },
      {
        type: "heading",
        text: "Links",
      },
      {
        type: "list",
        items: [
          "Ghostty terminfo docs: https://ghostty.org/docs/help/terminfo",
          "Ghostty shell integration docs: https://ghostty.org/docs/features/shell-integration",
          "NO_COLOR convention: https://no-color.org/",
        ],
      },
    ],
  },
] satisfies BlogPost[];

export const getBlogPosts = (): BlogPost[] =>
  [...BLOG_POSTS].sort(
    (postA, postB) =>
      new Date(postB.publishedAt).getTime() -
      new Date(postA.publishedAt).getTime(),
  );

export const getBlogPostBySlug = (slug: string): BlogPost | undefined =>
  BLOG_POSTS.find((post) => post.slug === slug);

export const getBlogPostUrl = (slug: string): string =>
  `${SITE_URL}/blog/${slug}`;
