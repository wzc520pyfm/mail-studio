"use client";

import { useMemo, useCallback, useState } from "react";
import { EditorContent } from "@tiptap/react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { Link } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTipTapEditor } from "./useTipTapEditor";
import { getPlainTextExtensions } from "./extensions";

interface TipTapButtonProps {
  node: EditorNode;
  isLocked?: boolean;
}

export function TipTapButton({ node, isLocked = false }: TipTapButtonProps) {
  const { updateNodeContent, updateNodeProps, selectedId } = useEditorStore();
  const [showToolbar, setShowToolbar] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const isSelected = selectedId === node.id;

  const extensions = useMemo(() => getPlainTextExtensions(), []);

  const handleUpdate = useCallback(
    (html: string) => {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      updateNodeContent(node.id, temp.textContent || "");
    },
    [node.id, updateNodeContent]
  );

  const editor = useTipTapEditor({
    content: node.content || "Button",
    extensions,
    editable: !isLocked,
    onUpdate: handleUpdate,
    onFocus: () => setShowToolbar(true),
    onBlur: () => setTimeout(() => setShowToolbar(false), 200),
  });

  const bgColor = (node.props["background-color"] as string) || "#414141";
  const textColor = (node.props["color"] as string) || "#ffffff";
  const borderRadius = (node.props["border-radius"] as string) || "3px";
  const align = (node.props["align"] as string) || "center";
  const containerBgColor = node.props["container-background-color"] as string;
  const padding = (node.props["padding"] as string) || "10px 25px";
  const innerPadding = (node.props["inner-padding"] as string) || "10px 25px";
  const fontSize = (node.props["font-size"] as string) || "13px";
  const fontWeight = (node.props["font-weight"] as string) || "normal";
  const fontStyle = node.props["font-style"] as string;
  const fontFamily = node.props["font-family"] as string;
  const textDecoration = (node.props["text-decoration"] as string) || "none";
  const textTransform = (node.props["text-transform"] as string) || "none";
  const letterSpacing = node.props["letter-spacing"] as string;
  const lineHeight = (node.props["line-height"] as string) || "120%";
  const href = (node.props["href"] as string) || "";

  if (!editor) return null;

  return (
    <div
      className="relative"
      style={{
        textAlign: align as "left" | "center" | "right",
        backgroundColor: containerBgColor,
        padding,
      }}
    >
      {!isLocked && (showToolbar || isSelected) && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <select
            value={borderRadius}
            onChange={(e) => updateNodeProps(node.id, { "border-radius": e.target.value })}
            className="text-sm px-2 py-1 rounded border-0 bg-gray-50"
          >
            <option value="0">Square</option>
            <option value="6px">Round</option>
            <option value="9999px">Pill</option>
          </select>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <input
            type="color"
            value={bgColor}
            onChange={(e) => updateNodeProps(node.id, { "background-color": e.target.value })}
            className="w-6 h-6 rounded cursor-pointer"
            title="Background Color"
          />
          <input
            type="color"
            value={textColor}
            onChange={(e) => updateNodeProps(node.id, { color: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer"
            title="Text Color"
          />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <Popover
            open={linkPopoverOpen}
            onOpenChange={(open) => {
              setLinkPopoverOpen(open);
              if (open) {
                setLinkUrl(href);
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                onMouseDown={(e) => e.preventDefault()}
                className="p-1.5 rounded hover:bg-gray-100"
                title="Edit Link"
              >
                <Link className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="center" sideOffset={8}>
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Button URL</div>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateNodeProps(node.id, { href: linkUrl });
                      setLinkPopoverOpen(false);
                    }
                  }}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setLinkUrl(href);
                      setLinkPopoverOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateNodeProps(node.id, { href: linkUrl });
                      setLinkPopoverOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div
        className={`inline-block ${isLocked ? "cursor-not-allowed" : "cursor-text"}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderRadius,
          padding: innerPadding,
          fontSize,
          fontWeight,
          fontStyle,
          fontFamily,
          textDecoration,
          textTransform: textTransform as "none" | "capitalize" | "uppercase" | "lowercase",
          letterSpacing,
          lineHeight,
        }}
      >
        <EditorContent
          editor={editor}
          className="[&_.tiptap-editor]:outline-none [&_.tiptap-editor_p]:m-0"
        />
      </div>
    </div>
  );
}
