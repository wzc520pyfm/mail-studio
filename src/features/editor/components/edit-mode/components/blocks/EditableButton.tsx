"use client";

import { useState, useRef } from "react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { Link } from "lucide-react";

interface EditableButtonProps {
  node: EditorNode;
  isLocked?: boolean;
}

export function EditableButton({ node, isLocked = false }: EditableButtonProps) {
  const { updateNodeContent, updateNodeProps, selectedId } = useEditorStore();
  const [showToolbar, setShowToolbar] = useState(false);
  const contentRef = useRef<HTMLSpanElement>(null);
  const isSelected = selectedId === node.id;
  const initialContentRef = useRef(node.content || "Button");

  const bgColor = (node.props["background-color"] as string) || "#2563eb";
  const textColor = (node.props["color"] as string) || "#ffffff";
  const borderRadius = (node.props["border-radius"] as string) || "6px";
  const align = (node.props["align"] as string) || "center";
  const containerBgColor = node.props["container-background-color"] as string;
  const fontStyle = node.props["font-style"] as string;
  const fontFamily = node.props["font-family"] as string;
  const textDecoration = (node.props["text-decoration"] as string) || "none";
  const textTransform = node.props["text-transform"] as string;
  const letterSpacing = node.props["letter-spacing"] as string;
  const lineHeight = node.props["line-height"] as string;

  return (
    <div
      className="relative py-2"
      style={{
        textAlign: align as "left" | "center" | "right",
        backgroundColor: containerBgColor,
      }}
    >
      {!isLocked && (showToolbar || isSelected) && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <select
            value={borderRadius}
            onMouseDown={(e) => e.preventDefault()}
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
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => updateNodeProps(node.id, { "background-color": e.target.value })}
            className="w-6 h-6 rounded cursor-pointer"
            title="Background Color"
          />
          <input
            type="color"
            value={textColor}
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => updateNodeProps(node.id, { color: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer"
            title="Text Color"
          />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const url = prompt("Enter button URL:", (node.props["href"] as string) || "");
              if (url !== null) updateNodeProps(node.id, { href: url });
            }}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Edit Link"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>
      )}

      <span
        ref={(el) => {
          contentRef.current = el;
          if (el && !el.textContent) {
            el.textContent = initialContentRef.current;
          }
        }}
        contentEditable={!isLocked}
        suppressContentEditableWarning
        onFocus={isLocked ? undefined : () => setShowToolbar(true)}
        onBlur={
          isLocked
            ? undefined
            : (e) => {
                setTimeout(() => setShowToolbar(false), 200);
                updateNodeContent(node.id, e.currentTarget.textContent || "");
              }
        }
        className={`inline-block px-6 py-3 font-medium outline-none ${isLocked ? "cursor-not-allowed" : "cursor-text"}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderRadius,
          fontStyle,
          fontFamily,
          textDecoration,
          textTransform: textTransform as "none" | "capitalize" | "uppercase" | "lowercase",
          letterSpacing,
          lineHeight,
        }}
      />
    </div>
  );
}
