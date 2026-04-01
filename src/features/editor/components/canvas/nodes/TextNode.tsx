"use client";

import { memo, useState, useCallback, useMemo, useRef } from "react";
import { EditorContent } from "@tiptap/react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { useTipTapEditor } from "../../tiptap/useTipTapEditor";
import { getRichTextExtensions } from "../../tiptap/extensions";
import { TipTapToolbar } from "../../tiptap/TipTapToolbar";

interface TextNodeProps {
  node: EditorNode;
}

export const TextNode = memo(function TextNode({ node }: TextNodeProps) {
  const updateNodeContent = useEditorStore((s) => s.updateNodeContent);
  const selectedId = useEditorStore((s) => s.selectedId);
  const isSelected = selectedId === node.id;
  const [isEditing, setIsEditing] = useState(false);
  const isPopoverOpenRef = useRef(false);

  const extensions = useMemo(() => getRichTextExtensions(), []);

  const handleUpdate = useCallback(
    (html: string) => {
      updateNodeContent(node.id, html);
    },
    [node.id, updateNodeContent]
  );

  const handleFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    if (isPopoverOpenRef.current) return;
    setTimeout(() => {
      if (!isPopoverOpenRef.current) {
        setIsEditing(false);
      }
    }, 150);
  }, []);

  const editor = useTipTapEditor({
    content: node.content || "",
    extensions,
    editable: isEditing,
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

  const handleDoubleClick = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => {
        editor?.commands.focus("end");
      }, 0);
    }
  }, [isEditing, editor]);

  if (!editor) return null;

  return (
    <div style={containerStyle} className="relative">
      {isEditing && (
        <div className="absolute -top-10 left-0 z-[9999]">
          <TipTapToolbar
            editor={editor}
            onPopoverOpenChange={(open) => {
              isPopoverOpenRef.current = open;
            }}
          />
        </div>
      )}

      <div
        onDoubleClick={handleDoubleClick}
        className={cn(
          "min-h-[1em] transition-all",
          "[&_.tiptap-editor_a]:underline [&_.tiptap-editor_a]:cursor-pointer",
          isEditing && "cursor-text bg-blue-50/50 ring-1 ring-blue-200",
          !isEditing && isSelected && "cursor-pointer"
        )}
        style={textStyle}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});
