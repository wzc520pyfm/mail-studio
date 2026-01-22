"use client";

import { useState, useCallback } from "react";
import { useEditorStore, useIsNodeLocked } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Lock } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  EditableText,
  EditableImage,
  EditableButton,
  EditableDivider,
  EditableSpacer,
  EditableTable,
  EditableSocial,
  EditableNavbar,
  EditableAccordion,
  EditableCarousel,
  EditableRaw,
} from "./blocks";

interface EditBlockProps {
  node: EditorNode;
  parentId: string;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
  hasColoredParent?: boolean;
  isParentLocked?: boolean;
}

export function EditBlock({
  node,
  parentId,
  dragHandleProps,
  isDragging,
  hasColoredParent = false,
  isParentLocked = false,
}: EditBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { removeNode, selectedId, setSelectedId } = useEditorStore();
  const isSelected = selectedId === node.id;

  // Check if this block is locked (directly or via parent)
  const isNodeLocked = useIsNodeLocked(node.id);
  const isLocked = isNodeLocked || isParentLocked;
  const isDirectlyLocked = node.locked ?? false;

  const handleDelete = useCallback(() => {
    if (isLocked) return;
    removeNode(node.id);
  }, [node.id, removeNode, isLocked]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[contenteditable="true"]')) {
        setSelectedId(node.id);
      }
    },
    [node.id, setSelectedId]
  );

  return (
    <div
      className={cn(
        "group relative rounded-lg transition-all duration-150",
        !hasColoredParent && isHovered && (isLocked ? "bg-amber-50/70" : "bg-gray-100/70"),
        !hasColoredParent &&
          isSelected &&
          (isLocked
            ? "bg-amber-50/50 ring-2 ring-amber-200"
            : "bg-blue-50/50 ring-2 ring-blue-200"),
        hasColoredParent &&
          isHovered &&
          !isSelected &&
          (isLocked
            ? "bg-amber-50/10 ring-1 ring-amber-200/20"
            : "bg-white/10 ring-1 ring-white/20"),
        hasColoredParent &&
          isSelected &&
          (isLocked
            ? "bg-amber-50/15 ring-2 ring-amber-200/40"
            : "bg-white/15 ring-2 ring-white/40"),
        isDragging && "opacity-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div
        className={cn(
          "absolute -left-10 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 transition-opacity",
          (isHovered || isSelected) && "opacity-100"
        )}
      >
        {isLocked ? (
          <div
            className="p-1 rounded text-amber-500"
            title={isDirectlyLocked ? "This block is locked" : "Parent is locked"}
          >
            <Lock className="w-4 h-4" />
          </div>
        ) : (
          <>
            <button
              className="p-1 rounded cursor-grab active:cursor-grabbing touch-none hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              title="Drag to reorder"
              {...dragHandleProps}
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className="py-1">
        {node.type === "mj-text" && <EditableText node={node} isLocked={isLocked} />}
        {node.type === "mj-image" && <EditableImage node={node} isLocked={isLocked} />}
        {node.type === "mj-button" && <EditableButton node={node} isLocked={isLocked} />}
        {node.type === "mj-divider" && <EditableDivider node={node} />}
        {node.type === "mj-spacer" && <EditableSpacer node={node} />}
        {node.type === "mj-table" && <EditableTable node={node} isLocked={isLocked} />}
        {node.type === "mj-social" && <EditableSocial node={node} />}
        {node.type === "mj-navbar" && <EditableNavbar node={node} />}
        {node.type === "mj-accordion" && <EditableAccordion node={node} />}
        {node.type === "mj-carousel" && <EditableCarousel node={node} />}
        {node.type === "mj-raw" && <EditableRaw node={node} isLocked={isLocked} />}
      </div>
    </div>
  );
}

// Sortable wrapper for EditBlock
interface SortableEditBlockProps {
  node: EditorNode;
  parentId: string;
  hasColoredParent: boolean;
  isParentLocked?: boolean;
}

export function SortableEditBlock({
  node,
  parentId,
  hasColoredParent,
  isParentLocked = false,
}: SortableEditBlockProps) {
  const isLocked = useIsNodeLocked(node.id) || isParentLocked;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    disabled: isLocked, // Disable sorting for locked blocks
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EditBlock
        node={node}
        parentId={parentId}
        dragHandleProps={isLocked ? undefined : { ...attributes, ...listeners }}
        isDragging={isDragging}
        hasColoredParent={hasColoredParent}
        isParentLocked={isParentLocked}
      />
    </div>
  );
}

// Block content preview for DragOverlay
export function EditBlockContent({ node }: { node: EditorNode }) {
  return (
    <div className="py-1 px-2">
      {node.type === "mj-text" && (
        <div
          className="min-h-[1.6em] px-2 py-1 text-gray-600"
          dangerouslySetInnerHTML={{ __html: node.content || "Text block" }}
        />
      )}
      {node.type === "mj-image" && (
        <div className="py-2 text-center">
          {node.props["src"] ? (
            <img
              src={node.props["src"] as string}
              alt=""
              className="max-w-full h-auto max-h-20 rounded"
            />
          ) : (
            <div className="text-gray-400 text-sm">Image</div>
          )}
        </div>
      )}
      {node.type === "mj-button" && (
        <div className="py-2 text-center">
          <span
            className="inline-block px-4 py-2 text-sm rounded"
            style={{
              backgroundColor: (node.props["background-color"] as string) || "#2563eb",
              color: (node.props["color"] as string) || "#ffffff",
            }}
          >
            {node.content || "Button"}
          </span>
        </div>
      )}
      {node.type === "mj-divider" && (
        <div className="py-2">
          <hr className="border-gray-300" />
        </div>
      )}
      {node.type === "mj-spacer" && (
        <div className="py-2 text-center text-gray-400 text-xs">
          Spacer ({node.props["height"] || "30px"})
        </div>
      )}
      {!["mj-text", "mj-image", "mj-button", "mj-divider", "mj-spacer"].includes(node.type) && (
        <div className="py-2 text-center text-gray-500 text-sm">{node.type.replace("mj-", "")}</div>
      )}
    </div>
  );
}
