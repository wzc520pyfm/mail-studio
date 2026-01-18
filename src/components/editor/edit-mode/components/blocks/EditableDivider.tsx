"use client";

import { EditorNode } from "@/types/editor";

interface EditableDividerProps {
  node: EditorNode;
}

export function EditableDivider({ node }: EditableDividerProps) {
  const borderColor = (node.props["border-color"] as string) || "#e2e8f0";
  const borderWidth = (node.props["border-width"] as string) || "1px";

  return (
    <div className="py-4">
      <hr
        style={{
          borderColor,
          borderWidth,
          borderStyle: "solid",
        }}
      />
    </div>
  );
}
