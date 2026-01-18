/**
 * Divider node renderer for the canvas
 */

"use client";

import { memo, useMemo } from "react";
import type { EditorNode } from "@/features/editor/types";

interface DividerNodeProps {
  node: EditorNode;
}

export const DividerNode = memo(function DividerNode({ node }: DividerNodeProps) {
  const style = useMemo(
    () => ({
      padding: (node.props["padding"] as string) || "10px 25px",
    }),
    [node.props]
  );

  const hrStyle = useMemo(
    () => ({
      borderColor: (node.props["border-color"] as string) || "#e2e8f0",
      borderWidth: (node.props["border-width"] as string) || "1px",
      borderStyle: (node.props["border-style"] as string) || "solid",
      width: (node.props["width"] as string) || "100%",
      margin: "0 auto",
    }),
    [node.props]
  );

  return (
    <div style={style}>
      <hr style={hrStyle} />
    </div>
  );
});
