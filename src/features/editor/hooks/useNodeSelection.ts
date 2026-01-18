/**
 * Hook for node selection and hover management
 */

import { useCallback } from "react";
import { useEditorStore } from "@/features/editor/stores";

export function useNodeSelection(nodeId: string) {
  const selectedId = useEditorStore((s) => s.selectedId);
  const hoveredId = useEditorStore((s) => s.hoveredId);
  const setSelectedId = useEditorStore((s) => s.setSelectedId);
  const setHoveredId = useEditorStore((s) => s.setHoveredId);

  const isSelected = selectedId === nodeId;
  const isHovered = hoveredId === nodeId;

  const handleSelect = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setSelectedId(nodeId);
    },
    [nodeId, setSelectedId]
  );

  const handleMouseEnter = useCallback(() => {
    setHoveredId(nodeId);
  }, [nodeId, setHoveredId]);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, [setHoveredId]);

  const handleDeselect = useCallback(() => {
    if (isSelected) {
      setSelectedId(null);
    }
  }, [isSelected, setSelectedId]);

  return {
    isSelected,
    isHovered,
    handleSelect,
    handleMouseEnter,
    handleMouseLeave,
    handleDeselect,
  };
}
