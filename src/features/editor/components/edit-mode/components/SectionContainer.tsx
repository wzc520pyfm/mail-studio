"use client";

import { useState } from "react";
import { useEditorStore, useIsNodeLocked } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { generateId } from "@/features/editor/lib/mjml";
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
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, Columns, LayoutGrid, Plus, Lock } from "lucide-react";
import { SortableColumnContainer } from "./ColumnContainer";
import { HeroContainer } from "./HeroContainer";

interface SectionContainerProps {
  node: EditorNode;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

export function SectionContainer({ node, dragHandleProps, isDragging }: SectionContainerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { selectedId, setSelectedId, removeNode, duplicateNode, addChildNode, updateNodeChildren } =
    useEditorStore();
  const isSelected = selectedId === node.id;
  const [activeColumnId, setActiveColumnId] = useState<UniqueIdentifier | null>(null);

  // Check if this section is locked
  const isLocked = useIsNodeLocked(node.id);
  const isDirectlyLocked = node.locked ?? false;

  const columnSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnIds = node.children?.map((col) => col.id) || [];

  const handleColumnDragStart = (event: DragStartEvent) => {
    setActiveColumnId(event.active.id);
  };

  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveColumnId(null);

    if (over && active.id !== over.id) {
      const oldIndex = columnIds.indexOf(active.id as string);
      const newIndex = columnIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1 && node.children) {
        const newChildren = arrayMove(node.children, oldIndex, newIndex);
        updateNodeChildren(node.id, newChildren);
      }
    }
  };

  const activeColumn = activeColumnId
    ? node.children?.find((col) => col.id === activeColumnId)
    : null;

  // Handle Hero type
  if (node.type === "mj-hero") {
    return <HeroContainer node={node} dragHandleProps={dragHandleProps} isLocked={isLocked} />;
  }

  // Handle Wrapper type
  if (node.type === "mj-wrapper") {
    return (
      <div
        className={cn(
          "relative group rounded-lg border-2 border-dashed transition-all",
          isSelected ? "border-blue-400 bg-blue-50/30" : "border-gray-200",
          isHovered && !isSelected && "border-gray-300 bg-gray-50/50"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(node.id);
        }}
      >
        <div className="absolute -top-3 left-3 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 font-medium flex items-center gap-1">
          {dragHandleProps && (
            <button className="cursor-grab active:cursor-grabbing touch-none" {...dragHandleProps}>
              <GripVertical className="w-3 h-3" />
            </button>
          )}
          Wrapper
        </div>
        <div className="p-4 space-y-2">
          {node.children?.map((section) => (
            <SectionContainer key={section.id} node={section} />
          ))}
        </div>
      </div>
    );
  }

  const handleAddColumn = () => {
    const newColumn: EditorNode = {
      id: generateId(),
      type: "mj-column",
      props: {},
      children: [],
    };
    addChildNode(node.id, newColumn);
  };

  const bgColor = (node.props["background-color"] as string) || "transparent";
  const columnCount = node.children?.length || 0;

  return (
    <div
      className={cn(
        "relative group rounded-lg transition-all",
        isSelected
          ? isLocked
            ? "ring-2 ring-amber-400 ring-offset-2"
            : "ring-2 ring-blue-400 ring-offset-2"
          : "",
        isHovered && !isSelected && (isLocked ? "ring-2 ring-amber-200" : "ring-2 ring-gray-200"),
        isDragging && "opacity-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedId(node.id);
      }}
    >
      {(isHovered || isSelected) && (
        <div
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg shadow-sm border",
            isLocked ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"
          )}
        >
          {isLocked ? (
            <>
              <div className="p-1 text-amber-600" title="This section is locked">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-amber-600 font-medium mr-1">
                <LayoutGrid className="w-3 h-3 inline mr-1" />
                Section {isDirectlyLocked && "(Locked)"}
              </span>
            </>
          ) : (
            <>
              {dragHandleProps && (
                <button
                  className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing touch-none"
                  title="Drag to reorder"
                  {...dragHandleProps}
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-xs text-gray-500 font-medium mr-1">
                <LayoutGrid className="w-3 h-3 inline mr-1" />
                Section
              </span>
              <div className="w-px h-4 bg-gray-200" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddColumn();
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Add Column"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateNode(node.id);
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Duplicate Section"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNode(node.id);
                }}
                className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-500"
                title="Delete Section"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}

      <div
        className="min-h-[80px] rounded-lg"
        style={{
          backgroundColor: bgColor !== "transparent" ? bgColor : undefined,
        }}
      >
        {columnCount > 0 ? (
          <DndContext
            sensors={columnSensors}
            collisionDetection={closestCenter}
            onDragStart={handleColumnDragStart}
            onDragEnd={handleColumnDragEnd}
          >
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              <div
                className={cn(
                  "grid gap-2 p-2",
                  columnCount === 1 && "grid-cols-1",
                  columnCount === 2 && "grid-cols-2",
                  columnCount === 3 && "grid-cols-3",
                  columnCount >= 4 && "grid-cols-4"
                )}
              >
                {node.children?.map((column) => (
                  <SortableColumnContainer key={column.id} node={column} parentId={node.id} />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeColumn ? (
                <div className="bg-white rounded-lg shadow-xl border-2 border-blue-400 opacity-90 p-4">
                  <div className="text-center text-gray-500 text-sm">
                    <Columns className="w-5 h-5 mx-auto mb-1" />
                    Column ({activeColumn.children?.length || 0} blocks)
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddColumn();
              }}
              className="flex items-center gap-1 hover:text-gray-600"
            >
              <Plus className="w-4 h-4" />
              Add Column
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Sortable wrapper for SectionContainer
export function SortableSectionContainer({ node }: { node: EditorNode }) {
  const isLocked = useIsNodeLocked(node.id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    disabled: isLocked, // Disable sorting for locked nodes
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionContainer
        node={node}
        dragHandleProps={isLocked ? undefined : { ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}
