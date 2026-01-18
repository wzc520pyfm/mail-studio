"use client";

import { useState, useRef } from "react";
import { useEditorStore } from "@/stores/editor";
import { EditorNode } from "@/types/editor";
import { Link } from "lucide-react";

interface EditableButtonProps {
  node: EditorNode;
}

export function EditableButton({ node }: EditableButtonProps) {
  const { updateNodeContent, updateNodeProps, selectedId } = useEditorStore();
  const [showToolbar, setShowToolbar] = useState(false);
  const contentRef = useRef<HTMLSpanElement>(null);
  const isSelected = selectedId === node.id;
  const initialContentRef = useRef(node.content || "Button");

  const bgColor = (node.props["background-color"] as string) || "#2563eb";
  const textColor = (node.props["color"] as string) || "#ffffff";
  const borderRadius = (node.props["border-radius"] as string) || "6px";
  const align = (node.props["align"] as string) || "center";

  return (
    <div className="relative py-2" style={{ textAlign: align as "left" | "center" | "right" }}>
      {(showToolbar || isSelected) && (
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
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setShowToolbar(true)}
        onBlur={(e) => {
          setTimeout(() => setShowToolbar(false), 200);
          updateNodeContent(node.id, e.currentTarget.textContent || "");
        }}
        className="inline-block px-6 py-3 font-medium outline-none cursor-text"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderRadius,
        }}
      />
    </div>
  );
}
