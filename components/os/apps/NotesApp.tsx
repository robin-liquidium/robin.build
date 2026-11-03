"use client";

import type { Block } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NotesAppProps {
  className?: string;
}

type Note = { id: string; content: Block[]; updatedAt: number };

const STORAGE_KEY = "notesApp.bn.notes";
const emptyBlocks = (): Block[] => [
  { id: crypto.randomUUID(), type: "paragraph" } as Block,
];

// Minimal shapes used for safe narrowing without `any`.
type InlineNodeLike = { text?: string };
type BlockLike = { type?: string; content?: string | InlineNodeLike[] };

const isEmptyBlocks = (blocks: Block[]): boolean => {
  if (!blocks || blocks.length === 0) return true;
  if (blocks.length > 1) return false;
  const b = blocks[0] as unknown as BlockLike;
  if (b.type !== "paragraph") return false;
  const content = b.content;
  if (typeof content === "string") return content.trim().length === 0;
  if (Array.isArray(content))
    return (
      content.length === 0 || content.every((c) => (c.text ?? "").trim() === "")
    );
  return true;
};

const titleFrom = (content: Block[]) => {
  const first = content?.[0] as unknown as BlockLike | undefined;
  if (!first) return "Untitled";
  let text = "";
  const c = first.content;
  if (typeof c === "string") text = c;
  else if (Array.isArray(c)) text = c.map((x) => x.text ?? "").join("");
  const t = (text || first.type || "Untitled").trim() || "Untitled";
  return t.length > 40 ? `${t.slice(0, 40)}…` : t;
};

export default function NotesApp({ className }: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const creatingRef = useRef<string | null>(null);

  // Load from localStorage; no legacy migration kept.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = (raw ? JSON.parse(raw) : []) as Note[];
      setNotes(parsed);
      setActiveId(null); // start with empty editor; create on type
    } catch {
      // Unreadable or corrupt saved notes: start empty.
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Storage can be blocked or full; notes stay in memory.
    }
  }, [notes]);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeId) ?? null,
    [notes, activeId],
  );

  const updateActive = useCallback(
    (nextContent: Block[]) => {
      if (!activeNote) return;
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNote.id
            ? { ...n, content: nextContent, updatedAt: Date.now() }
            : n,
        ),
      );
    },
    [activeNote],
  );

  const createNote = useCallback((content: Block[]): string => {
    const id = crypto.randomUUID();
    const newNote: Note = { id, content, updatedAt: Date.now() };
    creatingRef.current = id;
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  useEffect(() => {
    if (creatingRef.current && activeId === creatingRef.current) {
      // Creation completed; clear guard so future creations are allowed.
      creatingRef.current = null;
    }
  }, [activeId]);

  const addNote = () => {
    const id = createNote(emptyBlocks());
    setActiveId(id);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) {
      const next = notes.find((n) => n.id !== id);
      setActiveId(next ? next.id : null);
    }
  };

  // titleFrom moved to top-level util

  return (
    <div className={cn("flex h-full min-h-0 flex-col md:flex-row", className)}>
      {/* Sidebar: notes list */}
      <div className="flex w-full max-h-52 shrink-0 flex-col gap-2 overflow-auto border-b border-border/80 p-2 md:max-h-none md:w-64 md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-1 py-1">
          <div className="text-xs font-medium md:text-sm">Notes</div>
          <button
            type="button"
            onClick={addNote}
            className="rounded-md border px-2 py-1 text-xs hover:bg-accent md:text-xs"
          >
            New
          </button>
        </div>
        <div className="flex-1 overflow-auto pr-1">
          {notes.map((n) => (
            <div
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={cn(
                "group mb-2 cursor-pointer rounded-md border p-2 text-xs md:text-sm",
                n.id === activeId
                  ? "bg-accent border-accent-foreground/20"
                  : "hover:bg-accent/40 border-transparent",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium truncate">
                  {titleFrom(n.content)}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(n.id);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground md:p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-1 truncate text-[11px] text-muted-foreground md:text-xs">
                {new Date(n.updatedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor column */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative flex-1 overflow-auto p-1.5 md:p-2">
          <BlockNoteEditorPane
            noteId={activeNote?.id ?? null}
            value={
              activeNote?.content ?? [
                { id: crypto.randomUUID(), type: "paragraph" } as Block,
              ]
            }
            onChange={(blocks) => {
              if (!activeNote) {
                // Create only once while pending
                if (creatingRef.current) return;
                if (!isEmptyBlocks(blocks)) createNote(blocks);
                return;
              }
              updateActive(blocks);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BlockNoteEditorPane({
  noteId,
  value,
  onChange,
}: {
  noteId: string | null;
  value: Block[];
  onChange: (next: Block[]) => void;
}) {
  const editor = useCreateBlockNote({ initialContent: value });
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Keep BlockNote theme in sync with app's `.dark` class.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const update = () =>
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    update();
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // When switching between notes, update the editor content without remounting to preserve focus.
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editor) return;
    if (noteId !== prevIdRef.current) {
      // If we are transitioning from no note -> new note (created from typing),
      // keep current content and selection.
      if (prevIdRef.current === null && noteId !== null) {
        prevIdRef.current = noteId;
        return;
      }
      const empty: Block[] = [
        { id: crypto.randomUUID(), type: "paragraph" } as Block,
      ];
      const next = noteId ? value : empty;
      // Replace entire document only when switching notes.
      editor.replaceBlocks(editor.document, next);
      prevIdRef.current = noteId;
    }
  }, [noteId, value, editor]);

  return (
    <div className="h-full">
      <BlockNoteView
        editor={editor}
        theme={theme}
        onChange={() => onChange(editor.document)}
      />
    </div>
  );
}
