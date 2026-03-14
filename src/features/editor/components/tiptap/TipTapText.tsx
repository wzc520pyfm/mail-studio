"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { EditorContent } from "@tiptap/react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { useTipTapEditor } from "./useTipTapEditor";
import { getRichTextExtensions } from "./extensions";
import { TipTapToolbar } from "./TipTapToolbar";

interface TipTapTextProps {
  node: EditorNode;
  isLocked?: boolean;
}

export function TipTapText({ node, isLocked = false }: TipTapTextProps) {
  const { updateNodeContent, selectedId } = useEditorStore();
  const [showToolbar, setShowToolbar] = useState(false);
  const isPopoverOpenRef = useRef(false);
  const isSelected = selectedId === node.id;

  const extensions = useMemo(() => getRichTextExtensions(), []);

  const handleUpdate = useCallback(
    (html: string) => {
      updateNodeContent(node.id, html);
    },
    [node.id, updateNodeContent]
  );

  const handleFocus = useCallback(() => {
    setShowToolbar(true);
  }, []);

  const handleBlur = useCallback(() => {
    if (isPopoverOpenRef.current) return;
    setTimeout(() => {
      if (!isPopoverOpenRef.current) {
        setShowToolbar(false);
      }
    }, 200);
  }, []);

  const editor = useTipTapEditor({
    content: node.content || "",
    extensions,
    editable: !isLocked,
    onUpdate: handleUpdate,
    onFocus: handleFocus,
    onBlur: handleBlur,
  });

  const containerStyle = useMemo(
    () => ({
      backgroundColor: node.props["container-background-color"] as string,
      padding: (node.props["padding"] as string) || "10px 25px",
    }),
    [node.props]
  );

  const editorStyle = useMemo(
    () => ({
      fontSize: (node.props["font-size"] as string) || "13px",
      fontWeight: node.props["font-weight"] as string,
      fontFamily: node.props["font-family"] as string,
      fontStyle: node.props["font-style"] as string,
      color: (node.props["color"] as string) || "#000000",
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

  if (!editor) return null;

  return (
    <div className="relative" style={containerStyle}>
      {!isLocked && (showToolbar || isSelected) && (
        <div className="absolute -top-10 left-0 z-50">
          <TipTapToolbar
            editor={editor}
            onPopoverOpenChange={(open) => {
              isPopoverOpenRef.current = open;
            }}
          />
        </div>
      )}

      <div
        className={cn(
          "min-h-[1.6em] px-2 py-1 rounded",
          isLocked && "cursor-not-allowed",
          "[&_.tiptap-editor]:outline-none",
          "[&_.tiptap-editor_a]:text-blue-600 [&_.tiptap-editor_a]:underline [&_.tiptap-editor_a]:cursor-pointer"
        )}
        style={editorStyle}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
