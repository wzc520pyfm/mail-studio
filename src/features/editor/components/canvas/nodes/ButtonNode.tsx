"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { EditorContent } from "@tiptap/react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { useTipTapEditor } from "../../tiptap/useTipTapEditor";
import { getPlainTextExtensions } from "../../tiptap/extensions";

interface ButtonNodeProps {
  node: EditorNode;
}

export const ButtonNode = memo(function ButtonNode({ node }: ButtonNodeProps) {
  const updateNodeContent = useEditorStore((s) => s.updateNodeContent);
  const selectedId = useEditorStore((s) => s.selectedId);
  const isSelected = selectedId === node.id;
  const [isEditing, setIsEditing] = useState(false);

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
    editable: isEditing,
    onUpdate: handleUpdate,
    onFocus: () => setIsEditing(true),
    onBlur: () => setTimeout(() => setIsEditing(false), 150),
  });

  const containerStyle = useMemo(
    () => ({
      backgroundColor: node.props["container-background-color"] as string,
      padding: (node.props["padding"] as string) || "10px 25px",
      textAlign: (node.props["align"] as "left" | "center" | "right") || "center",
    }),
    [node.props]
  );

  const buttonStyle = useMemo(
    () => ({
      backgroundColor: (node.props["background-color"] as string) || "#414141",
      color: (node.props["color"] as string) || "#ffffff",
      fontSize: (node.props["font-size"] as string) || "13px",
      fontWeight: (node.props["font-weight"] as string) || "normal",
      fontStyle: node.props["font-style"] as string,
      fontFamily: node.props["font-family"] as string,
      borderRadius: (node.props["border-radius"] as string) || "3px",
      border: (node.props["border"] as string) || "none",
      padding: (node.props["inner-padding"] as string) || "10px 25px",
      display: "inline-block",
      textDecoration: (node.props["text-decoration"] as string) || "none",
      textTransform:
        (node.props["text-transform"] as "none" | "capitalize" | "uppercase" | "lowercase") ||
        "none",
      letterSpacing: node.props["letter-spacing"] as string,
      lineHeight: (node.props["line-height"] as string) || "120%",
      cursor: "pointer",
    }),
    [node.props]
  );

  const handleDoubleClick = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => editor?.commands.focus("end"), 0);
    }
  }, [isEditing, editor]);

  if (!editor) return null;

  return (
    <div style={containerStyle}>
      <span
        onDoubleClick={handleDoubleClick}
        className={cn(
          "outline-none",
          isEditing && "ring-2 ring-blue-300",
          !isEditing && isSelected && "cursor-pointer",
          "[&_.tiptap-editor]:outline-none [&_.tiptap-editor_p]:m-0"
        )}
        style={buttonStyle}
      >
        <EditorContent editor={editor} />
      </span>
    </div>
  );
});
