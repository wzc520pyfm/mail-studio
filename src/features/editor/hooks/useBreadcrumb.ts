/**
 * Hook for building breadcrumb path to selected node
 */

import { useMemo } from "react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";

export function useBreadcrumb(): EditorNode[] {
  const document = useEditorStore((s) => s.document);
  const selectedId = useEditorStore((s) => s.selectedId);

  return useMemo(() => {
    if (!selectedId) return [];

    const path: EditorNode[] = [];

    const findPath = (node: EditorNode, target: string): boolean => {
      if (node.id === target) {
        path.push(node);
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          if (findPath(child, target)) {
            path.unshift(node);
            return true;
          }
        }
      }
      return false;
    };

    findPath(document, selectedId);
    return path;
  }, [document, selectedId]);
}
