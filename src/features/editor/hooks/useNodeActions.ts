/**
 * Hook for node manipulation actions
 */

import { useCallback } from "react";
import { useEditorStore } from "@/features/editor/stores";

export function useNodeActions(nodeId: string) {
  const removeNode = useEditorStore((s) => s.removeNode);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps);
  const updateNodeContent = useEditorStore((s) => s.updateNodeContent);

  const handleDelete = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      removeNode(nodeId);
    },
    [nodeId, removeNode]
  );

  const handleDuplicate = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      duplicateNode(nodeId);
    },
    [nodeId, duplicateNode]
  );

  const handleUpdateProps = useCallback(
    (props: Record<string, string | number | undefined>) => {
      updateNodeProps(nodeId, props);
    },
    [nodeId, updateNodeProps]
  );

  const handleUpdateContent = useCallback(
    (content: string) => {
      updateNodeContent(nodeId, content);
    },
    [nodeId, updateNodeContent]
  );

  return {
    handleDelete,
    handleDuplicate,
    handleUpdateProps,
    handleUpdateContent,
  };
}
