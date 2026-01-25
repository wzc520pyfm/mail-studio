"use client";

import type { EditorNode } from "@/features/editor/types";

interface EditableDividerProps {
  node: EditorNode;
}

export function EditableDivider({ node }: EditableDividerProps) {
  const borderColor = (node.props["border-color"] as string) || "#000000";
  const borderWidth = (node.props["border-width"] as string) || "4px";
  const borderStyle = (node.props["border-style"] as string) || "solid";
  const width = (node.props["width"] as string) || "100%";
  const align = (node.props["align"] as string) || "center";
  const padding = (node.props["padding"] as string) || "10px 25px";
  const containerBgColor = node.props["container-background-color"] as string;

  return (
    <div
      style={{
        backgroundColor: containerBgColor,
        padding,
        textAlign: align as "left" | "center" | "right",
      }}
    >
      <hr
        style={{
          borderColor,
          borderWidth,
          borderStyle,
          width,
          margin: align === "left" ? "0" : align === "right" ? "0 0 0 auto" : "0 auto",
        }}
      />
    </div>
  );
}
