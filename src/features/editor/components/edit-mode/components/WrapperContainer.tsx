"use client";

import { useState } from "react";
import { useEditorStore, useIsNodeLocked } from "@/features/editor/stores";
import type { EditorNode, MJMLComponentType } from "@/features/editor/types";
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
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { GripVertical, Copy, Trash2, LayoutGrid, Plus, Lock, Square } from "lucide-react";
import { SortableSectionContainer } from "./SectionContainer";

interface WrapperContainerProps {
  node: EditorNode;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

export function WrapperContainer({ node, dragHandleProps, isDragging }: WrapperContainerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { selectedId, setSelectedId, removeNode, duplicateNode, addChildNode, updateNodeChildren } =
    useEditorStore();
  const isSelected = selectedId === node.id;
  const [activeSectionId, setActiveSectionId] = useState<UniqueIdentifier | null>(null);

  // Check if this wrapper is locked
  const isLocked = useIsNodeLocked(node.id);
  const isDirectlyLocked = node.locked ?? false;

  const sectionSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sectionIds = node.children?.map((section) => section.id) || [];

  const handleSectionDragStart = (event: DragStartEvent) => {
    setActiveSectionId(event.active.id);
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSectionId(null);

    if (over && active.id !== over.id) {
      const oldIndex = sectionIds.indexOf(active.id as string);
      const newIndex = sectionIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1 && node.children) {
        const newChildren = arrayMove(node.children, oldIndex, newIndex);
        updateNodeChildren(node.id, newChildren);
      }
    }
  };

  const activeSection = activeSectionId
    ? node.children?.find((section) => section.id === activeSectionId)
    : null;

  const handleAddSection = () => {
    const newSection: EditorNode = {
      id: generateId(),
      type: "mj-section" as MJMLComponentType,
      props: { padding: "20px 0", "background-color": "#ffffff" },
      children: [
        {
          id: generateId(),
          type: "mj-column" as MJMLComponentType,
          props: { width: "100%" },
          children: [],
        },
      ],
    };
    addChildNode(node.id, newSection);
  };

  const bgColor = (node.props["background-color"] as string) || "transparent";
  const bgUrl = node.props["background-url"] as string | undefined;
  const sectionCount = node.children?.length || 0;

  return (
    <div
      className={cn(
        "relative group rounded-lg transition-all",
        isSelected
          ? isLocked
            ? "ring-2 ring-amber-400 ring-offset-2"
            : "ring-2 ring-purple-400 ring-offset-2"
          : "",
        isHovered && !isSelected && (isLocked ? "ring-2 ring-amber-200" : "ring-2 ring-purple-200"),
        isDragging && "opacity-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedId(node.id);
      }}
    >
      {/* Toolbar */}
      {(isHovered || isSelected) && (
        <div
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg shadow-sm border",
            isLocked ? "bg-amber-50 border-amber-200" : "bg-white border-purple-200"
          )}
        >
          {isLocked ? (
            <>
              <div className="p-1 text-amber-600" title="This wrapper is locked">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-amber-600 font-medium mr-1">
                <Square className="w-3 h-3 inline mr-1" />
                Wrapper {isDirectlyLocked && "(Locked)"}
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
              <span className="text-xs text-purple-600 font-medium mr-1">
                <Square className="w-3 h-3 inline mr-1" />
                Wrapper
              </span>
              <div className="w-px h-4 bg-gray-200" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSection();
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Add Section"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateNode(node.id);
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Duplicate Wrapper"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNode(node.id);
                }}
                className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-500"
                title="Delete Wrapper"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Wrapper Content */}
      <div
        className="min-h-[80px] rounded-lg border-2 border-dashed border-purple-200"
        style={{
          backgroundColor: bgColor !== "transparent" ? bgColor : undefined,
          backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
          backgroundSize: (node.props["background-size"] as string) || "auto",
          backgroundRepeat: (node.props["background-repeat"] as string) || "repeat",
        }}
      >
        {sectionCount > 0 ? (
          <DndContext
            sensors={sectionSensors}
            collisionDetection={closestCenter}
            onDragStart={handleSectionDragStart}
            onDragEnd={handleSectionDragEnd}
          >
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 p-3">
                {node.children?.map((section) => (
                  <SortableSectionContainer key={section.id} node={section} />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeSection ? (
                <div className="bg-white rounded-lg shadow-xl border-2 border-blue-400 opacity-90 p-4">
                  <div className="text-center text-gray-500 text-sm">
                    <LayoutGrid className="w-5 h-5 mx-auto mb-1" />
                    Section ({activeSection.children?.length || 0} columns)
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
                handleAddSection();
              }}
              className="flex items-center gap-1 hover:text-gray-600"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
