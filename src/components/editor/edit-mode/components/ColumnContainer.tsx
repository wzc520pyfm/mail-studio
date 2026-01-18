"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores/editor";
import { EditorNode } from "@/types/editor";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, MoreHorizontal, Columns } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortableEditBlock, EditBlockContent } from "./EditBlock";
import { AddBlockButton } from "./AddBlockButton";

interface ColumnContainerProps {
  node: EditorNode;
  parentId: string;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

export function ColumnContainer({
  node,
  parentId,
  dragHandleProps,
  isDragging: isColumnDragging,
}: ColumnContainerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { selectedId, setSelectedId, removeNode, findNode, duplicateNode, updateNodeChildren } =
    useEditorStore();
  const isSelected = selectedId === node.id;
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const bgColor = (node.props["background-color"] as string) || "transparent";
  const width = node.props["width"] as string;

  const parentSection = findNode(parentId);
  const parentBgColor = parentSection?.props?.["background-color"] as string | undefined;
  const hasColoredParent =
    parentBgColor &&
    parentBgColor !== "transparent" &&
    parentBgColor !== "#ffffff" &&
    parentBgColor !== "#fff" &&
    parentBgColor !== "white";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const childIds = node.children?.map((child) => child.id) || [];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = childIds.indexOf(active.id as string);
      const newIndex = childIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1 && node.children) {
        const newChildren = arrayMove(node.children, oldIndex, newIndex);
        updateNodeChildren(node.id, newChildren);
      }
    }
  };

  const activeNode = activeId ? node.children?.find((child) => child.id === activeId) : null;

  return (
    <div
      className={cn(
        "relative group min-h-[60px] rounded-lg transition-all",
        !hasColoredParent && isSelected && "ring-2 ring-blue-300 ring-inset bg-blue-50/30",
        !hasColoredParent &&
          isHovered &&
          !isSelected &&
          "ring-1 ring-gray-200 ring-inset bg-gray-50/50",
        hasColoredParent && isSelected && "ring-2 ring-white/30 ring-inset bg-white/10",
        hasColoredParent &&
          isHovered &&
          !isSelected &&
          "ring-1 ring-white/15 ring-inset bg-white/5",
        !hasColoredParent &&
          bgColor === "transparent" &&
          !isHovered &&
          !isSelected &&
          "bg-white/50",
        isColumnDragging && "opacity-50"
      )}
      style={{
        backgroundColor: bgColor !== "transparent" ? bgColor : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedId(node.id);
      }}
    >
      {(isHovered || isSelected) && (
        <div className="absolute -top-2 right-1 z-10 flex items-center gap-1">
          {dragHandleProps && (
            <button
              className={cn(
                "p-1 rounded shadow-sm border cursor-grab active:cursor-grabbing touch-none",
                hasColoredParent
                  ? "bg-white/90 border-white/50 hover:bg-white"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              )}
              title="Drag to reorder column"
              {...dragHandleProps}
            >
              <GripVertical
                className={cn("w-3 h-3", hasColoredParent ? "text-gray-700" : "text-gray-500")}
              />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateNode(node.id);
            }}
            className={cn(
              "p-1 rounded shadow-sm border",
              hasColoredParent
                ? "bg-white/90 border-white/50 hover:bg-white"
                : "bg-white border-gray-200 hover:bg-gray-50"
            )}
            title="Duplicate Column"
          >
            <Copy className={cn("w-3 h-3", hasColoredParent ? "text-gray-700" : "text-gray-500")} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "p-1 rounded shadow-sm border",
                  hasColoredParent
                    ? "bg-white/90 border-white/50 hover:bg-white"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                )}
              >
                <MoreHorizontal
                  className={cn("w-3 h-3", hasColoredParent ? "text-gray-700" : "text-gray-500")}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem className="text-xs">
                <Columns className="w-3 h-3 mr-2" />
                {width || "Auto"} width
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-xs text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNode(node.id);
                }}
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          <div className="p-2 space-y-1">
            {node.children?.map((child) => (
              <SortableEditBlock
                key={child.id}
                node={child}
                parentId={node.id}
                hasColoredParent={!!hasColoredParent}
              />
            ))}
            <AddBlockButton parentId={node.id} hasColoredParent={!!hasColoredParent} />
          </div>
        </SortableContext>
        <DragOverlay>
          {activeNode ? (
            <div className="bg-white rounded-lg shadow-lg border-2 border-blue-400 opacity-90">
              <EditBlockContent node={activeNode} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Sortable wrapper for ColumnContainer
export function SortableColumnContainer({
  node,
  parentId,
}: {
  node: EditorNode;
  parentId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ColumnContainer
        node={node}
        parentId={parentId}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}
