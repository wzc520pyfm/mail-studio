"use client";

import { useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Palette,
  Type,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PRESET_COLORS = [
  "#000000",
  "#333333",
  "#666666",
  "#999999",
  "#CCCCCC",
  "#FFFFFF",
  "#E53935",
  "#D81B60",
  "#8E24AA",
  "#5E35B1",
  "#3949AB",
  "#1E88E5",
  "#039BE5",
  "#00ACC1",
  "#00897B",
  "#43A047",
  "#7CB342",
  "#C0CA33",
  "#FDD835",
  "#FFB300",
  "#FB8C00",
  "#F4511E",
];

const FONT_SIZES = [
  { label: "10px", css: "10px" },
  { label: "12px", css: "12px" },
  { label: "14px", css: "14px" },
  { label: "16px", css: "16px" },
  { label: "18px", css: "18px" },
  { label: "24px", css: "24px" },
  { label: "32px", css: "32px" },
];

interface TipTapToolbarProps {
  editor: Editor;
  className?: string;
  showAlignment?: boolean;
  showFontSize?: boolean;
  showColor?: boolean;
  onPopoverOpenChange?: (isOpen: boolean) => void;
}

export function TipTapToolbar({
  editor,
  className,
  showAlignment = true,
  showFontSize = true,
  showColor = true,
  onPopoverOpenChange,
}: TipTapToolbarProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [customColor, setCustomColor] = useState("#000000");

  const notifyPopover = useCallback(
    (open: boolean) => onPopoverOpenChange?.(open),
    [onPopoverOpenChange]
  );

  const handleColorPickerOpenChange = useCallback(
    (open: boolean) => {
      setColorPickerOpen(open);
      notifyPopover(open || fontSizeOpen || linkPopoverOpen);
    },
    [fontSizeOpen, linkPopoverOpen, notifyPopover]
  );

  const handleFontSizeOpenChange = useCallback(
    (open: boolean) => {
      setFontSizeOpen(open);
      notifyPopover(colorPickerOpen || open || linkPopoverOpen);
    },
    [colorPickerOpen, linkPopoverOpen, notifyPopover]
  );

  const handleLinkPopoverOpenChange = useCallback(
    (open: boolean) => {
      setLinkPopoverOpen(open);
      notifyPopover(colorPickerOpen || fontSizeOpen || open);
      if (open) {
        const existingUrl = editor.getAttributes("link").href || "";
        setLinkUrl(existingUrl);
      }
    },
    [colorPickerOpen, fontSizeOpen, notifyPopover, editor]
  );

  const applyLink = useCallback(() => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkUrl("");
    setLinkPopoverOpen(false);
    notifyPopover(false);
  }, [editor, linkUrl, notifyPopover]);

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 p-1 bg-white rounded-lg shadow-xl border border-gray-200 animate-in fade-in-0 zoom-in-95 duration-150",
        className
      )}
      onMouseDown={(e) => e.preventDefault()}
    >
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      {showColor && (
        <>
          <Separator />
          <Popover open={colorPickerOpen} onOpenChange={handleColorPickerOpenChange}>
            <PopoverTrigger asChild>
              <button
                className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors relative"
                title="Text Color"
              >
                <Palette className="w-4 h-4" />
                <div
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full"
                  style={{ backgroundColor: customColor }}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="center" sideOffset={8}>
              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setCustomColor(color);
                        setColorPickerOpen(false);
                        notifyPopover(false);
                      }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-8 h-8 rounded border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border rounded"
                    placeholder="#000000"
                  />
                  <button
                    onClick={() => {
                      editor.chain().focus().setColor(customColor).run();
                      setColorPickerOpen(false);
                      notifyPopover(false);
                    }}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}

      {showFontSize && (
        <Popover open={fontSizeOpen} onOpenChange={handleFontSizeOpenChange}>
          <PopoverTrigger asChild>
            <button
              className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
              title="Font Size"
            >
              <Type className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1" align="center" sideOffset={8}>
            <div className="flex flex-col">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.css}
                  onClick={() => {
                    editor.chain().focus().setMark("textStyle", { fontSize: size.css }).run();
                    setFontSizeOpen(false);
                    notifyPopover(false);
                  }}
                  className="px-3 py-1.5 text-left text-sm hover:bg-gray-100 rounded transition-colors"
                >
                  {size.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {showAlignment && (
        <>
          <Separator />
          <ToolbarButton
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
        </>
      )}

      <Separator />

      <Popover open={linkPopoverOpen} onOpenChange={handleLinkPopoverOpenChange}>
        <div onMouseDown={() => notifyPopover(true)}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors",
                editor.isActive("link") && "bg-gray-200 text-blue-600"
              )}
              title="Add Link"
            >
              <Link className="w-4 h-4" />
            </button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-72 p-3" align="center" sideOffset={8}>
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Enter URL</div>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") applyLink();
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setLinkUrl("");
                  setLinkPopoverOpen(false);
                  notifyPopover(false);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyLink}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <ToolbarButton
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        title="Remove Formatting"
      >
        <RemoveFormatting className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  children,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors",
        active && "bg-gray-200 text-blue-600"
      )}
      title={title}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5" />;
}
