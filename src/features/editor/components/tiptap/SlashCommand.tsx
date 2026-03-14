"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Extension } from "@tiptap/react";
import type { Range } from "@tiptap/react";
import { Suggestion } from "@tiptap/suggestion";
import type { SuggestionOptions } from "@tiptap/suggestion";
import { createPortal } from "react-dom";
import { Type, Image, Minus, MousePointerClick, Table, MoveVertical, Code } from "lucide-react";
import type { MJMLComponentType } from "@/features/editor/types";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ElementType;
  type: MJMLComponentType;
  category: "content" | "interactive";
}

const SLASH_ITEMS: SlashCommandItem[] = [
  {
    title: "Text",
    description: "Plain text block",
    icon: Type,
    type: "mj-text",
    category: "content",
  },
  {
    title: "Image",
    description: "Upload or embed an image",
    icon: Image,
    type: "mj-image",
    category: "content",
  },
  {
    title: "Button",
    description: "Call-to-action button",
    icon: MousePointerClick,
    type: "mj-button",
    category: "interactive",
  },
  {
    title: "Divider",
    description: "Horizontal line separator",
    icon: Minus,
    type: "mj-divider",
    category: "content",
  },
  {
    title: "Spacer",
    description: "Vertical spacing block",
    icon: MoveVertical,
    type: "mj-spacer",
    category: "content",
  },
  {
    title: "Table",
    description: "Data table with rows and columns",
    icon: Table,
    type: "mj-table",
    category: "content",
  },
  {
    title: "Raw HTML",
    description: "Custom HTML block",
    icon: Code,
    type: "mj-raw",
    category: "content",
  },
];

interface SlashMenuState {
  items: SlashCommandItem[];
  selectedIndex: number;
  onSelect: (item: SlashCommandItem) => void;
  clientRect: (() => DOMRect | null) | null;
}

const slashMenuState: {
  setProps: ((props: SlashMenuState | null) => void) | null;
} = { setProps: null };

function updateMenuSelectedIndex(index: number) {
  const current = slashMenuState.setProps;
  if (!current) return;
  // setProps is useState's setter, so functional updates work at runtime
  const setter = current as unknown as React.Dispatch<React.SetStateAction<SlashMenuState | null>>;
  setter((prev) => (prev ? { ...prev, selectedIndex: index } : null));
}

function SlashMenuPortal() {
  const [props, setProps] = useState<SlashMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    slashMenuState.setProps = setProps;
    return () => {
      slashMenuState.setProps = null;
    };
  }, []);

  const position = useMemo(() => {
    if (!props?.clientRect) return null;
    const rect = props.clientRect();
    if (!rect) return null;
    return { top: rect.bottom + 8, left: rect.left };
  }, [props]);

  if (!props || !position || props.items.length === 0) return null;

  return createPortal(
    <SlashMenu
      ref={menuRef}
      items={props.items}
      selectedIndex={props.selectedIndex}
      onSelect={props.onSelect}
      style={{ top: position.top, left: position.left }}
    />,
    document.body
  );
}

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SlashMenuProps {
  items: SlashCommandItem[];
  selectedIndex: number;
  onSelect: (item: SlashCommandItem) => void;
  style: React.CSSProperties;
}

const SlashMenu = forwardRef<HTMLDivElement, SlashMenuProps>(
  ({ items, selectedIndex, onSelect, style }, ref) => {
    return (
      <div
        ref={ref}
        className="fixed z-[9999] w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 animate-in fade-in-0 zoom-in-95 duration-100 max-h-80 overflow-y-auto"
        style={style}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => onSelect(item)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                index === selectedIndex ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md border",
                  index === selectedIndex
                    ? "bg-blue-100 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{item.title}</div>
                <div className="text-xs text-gray-500 truncate">{item.description}</div>
              </div>
            </button>
          );
        })}
        {items.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No results</div>}
      </div>
    );
  }
);

SlashMenu.displayName = "SlashMenu";

type SlashCommandCallbackFn = (item: SlashCommandItem, range: Range) => void;

let slashCommandCallback: SlashCommandCallbackFn | null = null;

export function setSlashCommandCallback(cb: SlashCommandCallbackFn | null) {
  slashCommandCallback = cb;
}

const suggestionConfig: Omit<SuggestionOptions<SlashCommandItem>, "editor"> = {
  char: "/",
  command: ({ editor, range, props: item }) => {
    editor.chain().focus().deleteRange(range).run();
    slashCommandCallback?.(item, range);
  },
  items: ({ query }) => {
    const lower = query.toLowerCase();
    return SLASH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) || item.description.toLowerCase().includes(lower)
    );
  },
  render: () => {
    let selectedIndex = 0;
    let items: SlashCommandItem[] = [];
    let command: ((item: SlashCommandItem) => void) | null = null;

    return {
      onStart: (props) => {
        items = props.items;
        selectedIndex = 0;
        command = props.command;
        slashMenuState.setProps?.({
          items,
          selectedIndex,
          onSelect: (item) => command?.(item),
          clientRect: props.clientRect ?? null,
        });
      },
      onUpdate: (props) => {
        items = props.items;
        command = props.command;
        if (selectedIndex >= items.length) selectedIndex = 0;
        slashMenuState.setProps?.({
          items,
          selectedIndex,
          onSelect: (item) => command?.(item),
          clientRect: props.clientRect ?? null,
        });
      },
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          selectedIndex = (selectedIndex - 1 + items.length) % items.length;
          updateMenuSelectedIndex(selectedIndex);
          return true;
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          selectedIndex = (selectedIndex + 1) % items.length;
          updateMenuSelectedIndex(selectedIndex);
          return true;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          if (items[selectedIndex]) {
            command?.(items[selectedIndex]);
          }
          return true;
        }
        if (event.key === "Escape") {
          slashMenuState.setProps?.(null);
          return true;
        }
        return false;
      },
      onExit: () => {
        slashMenuState.setProps?.(null);
      },
    };
  },
};

export const SlashCommands = Extension.create({
  name: "slashCommands",
  addOptions() {
    return {
      suggestion: suggestionConfig,
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export { SlashMenuPortal };
