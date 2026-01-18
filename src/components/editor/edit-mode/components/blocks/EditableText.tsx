"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useEditorStore } from "@/stores/editor";
import { EditorNode } from "@/types/editor";
import { cn } from "@/lib/utils";
import { Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface EditableTextProps {
  node: EditorNode;
}

export function EditableText({ node }: EditableTextProps) {
  const { updateNodeContent, updateNodeProps, selectedId } = useEditorStore();
  const [showToolbar, setShowToolbar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedId === node.id;
  const initialContentRef = useRef(node.content || "");

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== node.content) {
      if (document.activeElement !== contentRef.current) {
        contentRef.current.innerHTML = node.content || "";
      }
    }
  }, [node.id]);

  const handleInput = useCallback(() => {
    if (contentRef.current) {
      updateNodeContent(node.id, contentRef.current.innerHTML);
    }
  }, [node.id, updateNodeContent]);

  const handleFocus = () => setShowToolbar(true);

  const handleBlur = useCallback(() => {
    if (contentRef.current) {
      updateNodeContent(node.id, contentRef.current.innerHTML);
    }
    setTimeout(() => setShowToolbar(false), 200);
  }, [node.id, updateNodeContent]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const style = {
    fontSize: (node.props["font-size"] as string) || "16px",
    fontWeight: node.props["font-weight"] as string,
    fontFamily: node.props["font-family"] as string,
    color: (node.props["color"] as string) || "#333",
    lineHeight: (node.props["line-height"] as string) || "1.6",
    textAlign: node.props["align"] as "left" | "center" | "right",
  };

  return (
    <div className="relative">
      {(showToolbar || isSelected) && (
        <div className="absolute -top-10 left-0 z-50 flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("bold")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("italic")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("underline")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateNodeProps(node.id, { align: "left" })}
            className={cn(
              "p-1.5 rounded hover:bg-gray-100",
              node.props["align"] === "left" && "bg-gray-100"
            )}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateNodeProps(node.id, { align: "center" })}
            className={cn(
              "p-1.5 rounded hover:bg-gray-100",
              node.props["align"] === "center" && "bg-gray-100"
            )}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateNodeProps(node.id, { align: "right" })}
            className={cn(
              "p-1.5 rounded hover:bg-gray-100",
              node.props["align"] === "right" && "bg-gray-100"
            )}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const url = prompt("Enter URL:");
              if (url) execCommand("createLink", url);
            }}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Add Link"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        ref={(el) => {
          contentRef.current = el;
          if (el && !el.innerHTML) {
            el.innerHTML = initialContentRef.current;
          }
        }}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="outline-none min-h-[1.6em] px-2 py-1 rounded focus:ring-2 focus:ring-white/30"
        style={style}
      />
    </div>
  );
}
