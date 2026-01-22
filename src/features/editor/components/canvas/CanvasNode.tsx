/**
 * Canvas node wrapper with selection, hover, and drag-drop support
 */

"use client";

import { memo, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, Lock } from "lucide-react";
import { useEditorStore, useUIStore, useIsNodeLocked } from "@/features/editor/stores";
import { componentDefinitions } from "@/features/editor/lib/mjml/schema";
import type { EditorNode, MJMLComponentType } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { SectionNode } from "./SectionNode";
import { ColumnNode } from "./ColumnNode";
import {
  TextNode,
  ImageNode,
  ButtonNode,
  DividerNode,
  SpacerNode,
  TableNode,
  NavbarNode,
  AccordionNode,
  CarouselNode,
  SocialNode,
  GenericNode,
} from "./nodes";

interface CanvasNodeProps {
  node: EditorNode;
  index: number;
  parentId: string;
  parentAcceptTypes?: MJMLComponentType[];
}

export const CanvasNode = memo(function CanvasNode({
  node,
  index,
  parentId,
  parentAcceptTypes,
}: CanvasNodeProps) {
  const selectedId = useEditorStore((s) => s.selectedId);
  const hoveredId = useEditorStore((s) => s.hoveredId);
  const setSelectedId = useEditorStore((s) => s.setSelectedId);
  const setHoveredId = useEditorStore((s) => s.setHoveredId);
  const removeNode = useEditorStore((s) => s.removeNode);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const globalIsDragging = useUIStore((s) => s.isDragging);

  // Check if this node is locked
  const isLocked = useIsNodeLocked(node.id);
  const isDirectlyLocked = node.locked ?? false;

  const isSelected = selectedId === node.id;
  const isHovered = hoveredId === node.id && !globalIsDragging;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: node.id,
      disabled: isLocked, // Disable sorting for locked nodes
      data: {
        type: "existing-node",
        nodeId: node.id,
        nodeType: node.type,
        parentId,
        parentAcceptTypes,
        index,
        isLocked, // Pass locked state to drag handlers
      },
    });

  // Calculate column-specific styles for proper flex layout
  const isColumn = node.type === "mj-column";
  const explicitWidth = isColumn ? (node.props["width"] as string) : undefined;
  // If column has explicit width, use it; otherwise use flex: 1 to share space equally
  const hasExplicitWidth = explicitWidth && explicitWidth !== "";

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    // Apply flex properties for columns so they properly participate in section's flex layout
    ...(isColumn &&
      hasExplicitWidth && {
        flex: `0 0 ${explicitWidth}`,
        maxWidth: explicitWidth,
        minWidth: 0,
      }),
    ...(isColumn &&
      !hasExplicitWidth && {
        flex: "1 1 0%", // Equal share with siblings
        minWidth: 0,
      }),
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedId(node.id);
    },
    [node.id, setSelectedId]
  );

  const handleMouseEnter = useCallback(() => {
    if (!globalIsDragging) {
      setHoveredId(node.id);
    }
  }, [node.id, setHoveredId, globalIsDragging]);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, [setHoveredId]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLocked) return; // Prevent deletion of locked nodes
      removeNode(node.id);
    },
    [node.id, removeNode, isLocked]
  );

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLocked) return; // Prevent duplication of locked nodes
      duplicateNode(node.id);
    },
    [node.id, duplicateNode, isLocked]
  );

  const renderContent = () => {
    switch (node.type) {
      case "mj-section":
        return <SectionNode node={node} />;
      case "mj-column":
        return <ColumnNode node={node} />;
      case "mj-text":
        return <TextNode node={node} />;
      case "mj-image":
        return <ImageNode node={node} />;
      case "mj-button":
        return <ButtonNode node={node} />;
      case "mj-divider":
        return <DividerNode node={node} />;
      case "mj-spacer":
        return <SpacerNode node={node} />;
      case "mj-table":
        return <TableNode node={node} />;
      case "mj-navbar":
        return <NavbarNode node={node} />;
      case "mj-accordion":
        return <AccordionNode node={node} />;
      case "mj-carousel":
        return <CarouselNode node={node} />;
      case "mj-social":
        return <SocialNode node={node} />;
      default:
        return <GenericNode node={node} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group transition-all duration-150",
        // Selection states - use amber for locked nodes
        !isDragging &&
          isSelected &&
          (isLocked
            ? "ring-2 ring-amber-500 ring-offset-2 rounded-sm z-10"
            : "ring-2 ring-blue-500 ring-offset-2 rounded-sm z-10"),
        !isDragging &&
          isHovered &&
          !isSelected &&
          (isLocked ? "ring-2 ring-amber-300/50 rounded-sm" : "ring-2 ring-blue-300/50 rounded-sm"),
        // Dragging states - subtle opacity to indicate dragging
        isDragging && "opacity-75 z-50 scale-[1.02] shadow-lg",
        // Locked visual indicator
        isLocked && "relative"
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Component Label */}
      {(isSelected || isHovered) && !isDragging && (
        <div className="absolute -top-7 left-0 z-[9999] flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1 duration-150">
          {/* Drag Handle - disabled for locked nodes */}
          {!isLocked ? (
            <button
              {...attributes}
              {...listeners}
              className={cn(
                "p-1.5 rounded-md bg-blue-500 text-white shadow-md",
                "cursor-grab active:cursor-grabbing",
                "hover:bg-blue-600 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-300"
              )}
              title="Drag to reorder"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div
              className="p-1.5 rounded-md bg-amber-500 text-white shadow-md"
              title="This content is locked and cannot be edited"
            >
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-md shadow-md",
              isLocked ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
            )}
          >
            {componentDefinitions[node.type]?.name || node.type}
            {isDirectlyLocked && " (Locked)"}
          </span>
        </div>
      )}

      {/* Actions - hide for locked nodes */}
      {isSelected && !isDragging && !isLocked && (
        <div className="absolute -top-7 right-0 z-[9999] flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1 duration-150">
          <button
            onClick={handleDuplicate}
            className={cn(
              "p-1.5 rounded-md bg-white border border-gray-200 shadow-md",
              "hover:bg-gray-50 hover:border-gray-300 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-blue-300"
            )}
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              "p-1.5 rounded-md bg-white border border-gray-200 shadow-md",
              "hover:bg-red-50 hover:border-red-300 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-red-300"
            )}
            title="Delete (Del)"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className={cn(isDragging && "pointer-events-none")}>{renderContent()}</div>
    </div>
  );
});
