"use client";

import { EditorNode } from "@/types/editor";
import { MoveVertical } from "lucide-react";

interface EditableSpacerProps {
  node: EditorNode;
}

export function EditableSpacer({ node }: EditableSpacerProps) {
  const height = (node.props["height"] as string) || "30px";

  return (
    <div className="flex items-center justify-center text-gray-400 text-xs" style={{ height }}>
      <MoveVertical className="w-3 h-3 mr-1" />
      {height}
    </div>
  );
}
