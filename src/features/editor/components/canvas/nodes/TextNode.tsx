/**
 * Text node renderer for the canvas
 * Supports inline text formatting via floating toolbar
 */

"use client";

import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  Link,
  Strikethrough,
  Palette,
  Type,
  RemoveFormatting,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TextNodeProps {
  node: EditorNode;
}

// Preset colors for quick selection
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

// Font size options
const FONT_SIZES = [
  { label: "10px", value: "1" },
  { label: "12px", value: "2" },
  { label: "14px", value: "3" },
  { label: "16px", value: "4" },
  { label: "18px", value: "5" },
  { label: "24px", value: "6" },
  { label: "32px", value: "7" },
];

// Floating toolbar component
const FloatingToolbar = memo(function FloatingToolbar({
  onFormat,
  onColorChange,
  onFontSizeChange,
  onRemoveFormat,
  onPopoverOpenChange,
}: {
  onFormat: (command: string, value?: string) => void;
  onColorChange: (color: string) => void;
  onFontSizeChange: (size: string) => void;
  onRemoveFormat: () => void;
  onPopoverOpenChange?: (isOpen: boolean) => void;
}) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [customColor, setCustomColor] = useState("#000000");

  // Helper to update popover state and notify parent immediately
  const handleColorPickerOpenChange = useCallback(
    (open: boolean) => {
      setColorPickerOpen(open);
      onPopoverOpenChange?.(open || fontSizeOpen || linkPopoverOpen);
    },
    [fontSizeOpen, linkPopoverOpen, onPopoverOpenChange]
  );

  const handleFontSizeOpenChange = useCallback(
    (open: boolean) => {
      setFontSizeOpen(open);
      onPopoverOpenChange?.(colorPickerOpen || open || linkPopoverOpen);
    },
    [colorPickerOpen, linkPopoverOpen, onPopoverOpenChange]
  );

  const handleLinkPopoverOpenChange = useCallback(
    (open: boolean) => {
      setLinkPopoverOpen(open);
      onPopoverOpenChange?.(colorPickerOpen || fontSizeOpen || open);
    },
    [colorPickerOpen, fontSizeOpen, onPopoverOpenChange]
  );

  return (
    <div
      className="absolute -top-10 left-0 z-[9999] flex items-center gap-0.5 p-1 bg-white rounded-lg shadow-xl border border-gray-200 animate-in fade-in-0 zoom-in-95 duration-150"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Bold */}
      <button
        onClick={() => onFormat("bold")}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>

      {/* Italic */}
      <button
        onClick={() => onFormat("italic")}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>

      {/* Underline */}
      <button
        onClick={() => onFormat("underline")}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>

      {/* Strikethrough */}
      <button
        onClick={() => onFormat("strikeThrough")}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {/* Text Color */}
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
                    onColorChange(color);
                    setCustomColor(color);
                    setColorPickerOpen(false);
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
                  onColorChange(customColor);
                  setColorPickerOpen(false);
                }}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Font Size */}
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
                key={size.value}
                onClick={() => {
                  onFontSizeChange(size.value);
                  setFontSizeOpen(false);
                }}
                className="px-3 py-1.5 text-left text-sm hover:bg-gray-100 rounded transition-colors"
              >
                {size.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {/* Link */}
      <Popover open={linkPopoverOpen} onOpenChange={handleLinkPopoverOpenChange}>
        <div
          onMouseDown={() => {
            // Notify parent immediately on mousedown (before any blur fires)
            onPopoverOpenChange?.(true);
          }}
        >
          <PopoverTrigger asChild>
            <button
              className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
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
                if (e.key === "Enter" && linkUrl) {
                  onFormat("createLink", linkUrl);
                  setLinkUrl("");
                  setLinkPopoverOpen(false);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setLinkUrl("");
                  setLinkPopoverOpen(false);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (linkUrl) {
                    onFormat("createLink", linkUrl);
                    setLinkUrl("");
                    setLinkPopoverOpen(false);
                  }
                }}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Remove Formatting */}
      <button
        onClick={onRemoveFormat}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
        title="Remove Formatting"
      >
        <RemoveFormatting className="w-4 h-4" />
      </button>
    </div>
  );
});

export const TextNode = memo(function TextNode({ node }: TextNodeProps) {
  const updateNodeContent = useEditorStore((s) => s.updateNodeContent);
  const selectedId = useEditorStore((s) => s.selectedId);
  const isSelected = selectedId === node.id;
  const [isEditing, setIsEditing] = useState(false);
  const isPopoverOpenRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  // Store initial content to avoid re-rendering issues
  const initialContentRef = useRef(node.content || "");

  // Callback for FloatingToolbar to notify popover state changes
  const handlePopoverOpenChange = useCallback((isOpen: boolean) => {
    isPopoverOpenRef.current = isOpen;
  }, []);

  // Sync content from props only when not editing and node.id changes
  useEffect(() => {
    initialContentRef.current = node.content || "";
    if (contentRef.current && !isEditing) {
      // Only update if not currently focused/editing
      if (document.activeElement !== contentRef.current) {
        contentRef.current.innerHTML = node.content || "";
      }
    }
  }, [node.id, node.content, isEditing]);

  const containerStyle = useMemo(
    () => ({
      backgroundColor: node.props["container-background-color"] as string,
      padding: (node.props["padding"] as string) || "10px 25px",
    }),
    [node.props]
  );

  const textStyle = useMemo(
    () => ({
      color: (node.props["color"] as string) || "#000000",
      fontSize: (node.props["font-size"] as string) || "13px",
      fontWeight: node.props["font-weight"] as string,
      fontFamily: node.props["font-family"] as string,
      fontStyle: node.props["font-style"] as string,
      lineHeight: (node.props["line-height"] as string) || "1.5",
      letterSpacing: node.props["letter-spacing"] as string,
      textAlign: (node.props["align"] as "left" | "center" | "right") || "left",
      textDecoration: node.props["text-decoration"] as string,
      textTransform: node.props["text-transform"] as
        | "none"
        | "capitalize"
        | "uppercase"
        | "lowercase",
    }),
    [node.props]
  );

  // Save selection for formatting commands
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && contentRef.current) {
      const range = selection.getRangeAt(0);
      if (contentRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
      }
    }
  }, []);

  // Handle selection change to save selection
  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const handleSelectionChange = () => {
      saveSelection();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [isEditing, saveSelection]);

  // Restore selection before executing command
  const restoreSelection = useCallback(() => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
  }, []);

  // Execute formatting command
  const handleFormat = useCallback(
    (command: string, value?: string) => {
      restoreSelection();
      document.execCommand(command, false, value);
      if (contentRef.current) {
        updateNodeContent(node.id, contentRef.current.innerHTML);
      }
    },
    [node.id, updateNodeContent, restoreSelection]
  );

  // Handle text color change
  const handleColorChange = useCallback(
    (color: string) => {
      restoreSelection();
      document.execCommand("foreColor", false, color);
      if (contentRef.current) {
        updateNodeContent(node.id, contentRef.current.innerHTML);
      }
    },
    [node.id, updateNodeContent, restoreSelection]
  );

  // Handle font size change
  const handleFontSizeChange = useCallback(
    (size: string) => {
      restoreSelection();
      document.execCommand("fontSize", false, size);
      if (contentRef.current) {
        updateNodeContent(node.id, contentRef.current.innerHTML);
      }
    },
    [node.id, updateNodeContent, restoreSelection]
  );

  // Remove formatting
  const handleRemoveFormat = useCallback(() => {
    restoreSelection();
    document.execCommand("removeFormat", false);
    if (contentRef.current) {
      updateNodeContent(node.id, contentRef.current.innerHTML);
    }
  }, [node.id, updateNodeContent, restoreSelection]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      // Don't blur if any popover is open (use ref for latest value)
      if (isPopoverOpenRef.current) return;

      // Don't blur if clicking on toolbar or popover content
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (relatedTarget?.closest("[data-slot='popover-content']")) {
        return;
      }

      // Delay to allow toolbar clicks to complete
      setTimeout(() => {
        // Check again in case popover opened during the timeout
        if (isPopoverOpenRef.current) return;

        if (contentRef.current) {
          updateNodeContent(node.id, contentRef.current.innerHTML);
        }
        setIsEditing(false);
      }, 150);
    },
    [node.id, updateNodeContent]
  );

  const handleInput = useCallback(() => {
    if (contentRef.current) {
      updateNodeContent(node.id, contentRef.current.innerHTML);
    }
  }, [node.id, updateNodeContent]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            handleFormat("bold");
            break;
          case "i":
            e.preventDefault();
            handleFormat("italic");
            break;
          case "u":
            e.preventDefault();
            handleFormat("underline");
            break;
        }
      }
    },
    [handleFormat]
  );

  return (
    <div style={containerStyle} className="relative">
      {/* Floating Toolbar - always visible when in edit mode */}
      {isEditing && (
        <FloatingToolbar
          onFormat={handleFormat}
          onColorChange={handleColorChange}
          onFontSizeChange={handleFontSizeChange}
          onRemoveFormat={handleRemoveFormat}
          onPopoverOpenChange={handlePopoverOpenChange}
        />
      )}

      <div
        ref={(el) => {
          contentRef.current = el;
          // Set initial content only when element is mounted and empty
          if (el && !el.innerHTML) {
            el.innerHTML = initialContentRef.current;
          }
        }}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={cn(
          "outline-none min-h-[1em] transition-all",
          "[&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer",
          isEditing && "cursor-text bg-blue-50/50 ring-1 ring-blue-200",
          !isEditing && isSelected && "cursor-pointer"
        )}
        style={textStyle}
      />
    </div>
  );
});
