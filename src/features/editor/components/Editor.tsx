/**
 * Main Editor component - orchestrates the entire editor UI
 */

"use client";

import { memo, useState, useCallback, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
  rectIntersection,
  closestCenter,
  CollisionDetection,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useEditorStore, useUIStore } from "@/features/editor/stores";
import { useKeyboardShortcuts } from "@/features/editor/hooks";
import { componentDefinitions } from "@/features/editor/lib/mjml/schema";
import type { MJMLComponentType } from "@/features/editor/types";
import { Toolbar } from "./toolbar";
import { Sidebar } from "./sidebar";
import { Canvas } from "./canvas";
import { Properties } from "./properties";
import { EditMode } from "./edit-mode";
import { Preview } from "./preview";
import { CodeEditor } from "./code-editor";

// Direct icon imports for better performance
import {
  Type,
  Image,
  Minus,
  Space,
  Table,
  Code,
  MousePointerClick,
  Menu,
  ChevronDown,
  GalleryHorizontal,
  Share2,
  Rows3,
  Columns3,
  Group,
  Square,
  LayoutTemplate,
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  Image,
  Minus,
  Space,
  Table,
  Code,
  MousePointerClick,
  Menu,
  ChevronDown,
  GalleryHorizontal,
  Share2,
  Rows3,
  Columns3,
  Group,
  Square,
  LayoutTemplate,
};

// Custom collision detection optimized for both new component drops and reordering
const customCollisionDetection: CollisionDetection = (args) => {
  const activeData = args.active.data.current;
  const activeType = activeData?.type;
  const isDraggingNewComponent = activeType === "new-component";
  const activeParentId = activeData?.parentId;

  if (isDraggingNewComponent) {
    // For new components, use pointerWithin to find the deepest container
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    // Fallback to rect intersection
    return rectIntersection(args);
  } else {
    // For existing nodes, use closestCenter for accurate reordering
    const centerCollisions = closestCenter(args);

    // Filter to only include siblings (same parent) for better reordering accuracy
    const siblingCollisions = centerCollisions.filter((collision) => {
      const collisionData = collision.data?.droppableContainer?.data?.current;
      return collisionData?.parentId === activeParentId && collisionData?.type === "existing-node";
    });

    if (siblingCollisions.length > 0) {
      return siblingCollisions;
    }

    // If no sibling collisions, check all existing nodes and drop containers
    if (centerCollisions.length > 0) {
      return centerCollisions;
    }

    // Fallback to pointerWithin for cross-container drops
    return pointerWithin(args);
  }
};

export const Editor = memo(function Editor() {
  const addNode = useEditorStore((s) => s.addNode);
  const moveNode = useEditorStore((s) => s.moveNode);
  const findNode = useEditorStore((s) => s.findNode);
  const updateNodeChildren = useEditorStore((s) => s.updateNodeChildren);
  const editorMode = useUIStore((s) => s.editorMode);
  const setIsDragging = useUIStore((s) => s.setIsDragging);
  const setIsDraggingNewComponent = useUIStore((s) => s.setIsDraggingNewComponent);
  const isDragging = useUIStore((s) => s.isDragging);

  const [, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<MJMLComponentType | null>(null);

  // Configure sensors to match EditMode for consistent drag behavior
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Start drag after 8px movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setIsDragging(true);
      setActiveId(active.id as string);

      // Check if it's a new component drag
      const isNewComponent = active.data.current?.type === "new-component";
      setIsDraggingNewComponent(isNewComponent);

      if (isNewComponent && active.data.current) {
        setActiveType(active.data.current.componentType);
      } else {
        setActiveType(null);
      }
    },
    [setIsDragging, setIsDraggingNewComponent]
  );

  // Track the last over id (used for reference but no longer for real-time reordering)
  const lastOverId = useRef<string | null>(null);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setIsDragging(false);
      setIsDraggingNewComponent(false);
      setActiveId(null);
      setActiveType(null);
      lastOverId.current = null;

      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      if (!activeData || !overData) return;

      // Helper function to check if a component type can be dropped into a target
      const canDropInto = (
        componentType: MJMLComponentType,
        acceptTypes: MJMLComponentType[] | undefined
      ): boolean => {
        if (!acceptTypes) return true;
        return acceptTypes.includes(componentType);
      };

      // Handle new component drop
      if (activeData.type === "new-component") {
        const componentType = activeData.componentType as MJMLComponentType;
        const overId = over.id as string;
        const isDropContainer = overId.startsWith("drop-") || overId.startsWith("empty-");

        let targetId: string;
        let targetIndex: number | undefined;
        let acceptTypes: MJMLComponentType[] | undefined;

        if (isDropContainer) {
          // Dropping directly on a container
          targetId = overData.nodeId as string;
          targetIndex = overData.index as number | undefined;
          acceptTypes = overData.acceptTypes as MJMLComponentType[] | undefined;
        } else if (overData.type === "existing-node") {
          // Dropping on an existing node - add after it
          targetId = overData.parentId as string;
          acceptTypes = overData.parentAcceptTypes as MJMLComponentType[] | undefined;
          const overIndex = (overData.index as number) ?? 0;
          targetIndex = overIndex + 1;
        } else {
          // Fallback
          targetId = overData.nodeId as string;
          targetIndex = overData.index as number | undefined;
          acceptTypes = overData.acceptTypes as MJMLComponentType[] | undefined;
        }

        // Validate that the target accepts this component type
        if (!canDropInto(componentType, acceptTypes)) {
          return;
        }

        addNode(targetId, componentType, targetIndex);
      }
      // Handle existing node drag (reorder within same parent or move to different parent)
      else if (activeData.type === "existing-node") {
        const nodeId = activeData.nodeId as string;
        const nodeType = activeData.nodeType as MJMLComponentType;
        const activeParentId = activeData.parentId as string;
        const activeIndex = activeData.index as number;

        // Determine the target container
        const overId = over.id as string;
        const isDropContainer = overId.startsWith("drop-") || overId.startsWith("empty-");

        let targetParentId: string;
        let targetIndex: number;
        let acceptTypes: MJMLComponentType[] | undefined;

        if (isDropContainer) {
          targetParentId = overData.nodeId as string;
          targetIndex = (overData.index as number) ?? 0;
          acceptTypes = overData.acceptTypes as MJMLComponentType[] | undefined;
        } else if (overData.type === "existing-node") {
          targetParentId = overData.parentId as string;
          targetIndex = (overData.index as number) ?? 0;
          acceptTypes = overData.parentAcceptTypes as MJMLComponentType[] | undefined;
        } else {
          targetParentId = overData.nodeId as string;
          targetIndex = (overData.index as number) ?? 0;
          acceptTypes = overData.acceptTypes as MJMLComponentType[] | undefined;
        }

        // Handle reordering within the same parent (like Editor mode)
        if (activeParentId === targetParentId) {
          if (activeIndex !== targetIndex) {
            const parent = findNode(activeParentId);
            if (parent?.children) {
              const newChildren = arrayMove(parent.children, activeIndex, targetIndex);
              updateNodeChildren(activeParentId, newChildren);
            }
          }
          return;
        }

        // Handle cross-container move
        // Validate that the target accepts this node type
        if (nodeType && !canDropInto(nodeType, acceptTypes)) {
          return;
        }

        moveNode(nodeId, targetParentId, targetIndex);
      }
    },
    [addNode, moveNode, findNode, updateNodeChildren, setIsDragging, setIsDraggingNewComponent]
  );

  const handleDragCancel = useCallback(() => {
    setIsDragging(false);
    setIsDraggingNewComponent(false);
    setActiveId(null);
    setActiveType(null);
    lastOverId.current = null;
  }, [setIsDragging, setIsDraggingNewComponent]);

  // Render drag overlay
  const renderDragOverlay = () => {
    if (!activeType) return null;

    const def = componentDefinitions[activeType];
    const IconComponent = iconMap[def.icon];

    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg shadow-2xl border-2 border-blue-400 transform -rotate-2 scale-105">
        <div className="p-1.5 bg-blue-50 rounded-md">
          {IconComponent && <IconComponent className="w-4 h-4 text-blue-600" />}
        </div>
        <span className="text-sm font-semibold text-gray-700">{def.name}</span>
        <div className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
          Dragging
        </div>
      </div>
    );
  };

  // Custom drop animation
  const dropAnimation = {
    duration: 200,
    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      collisionDetection={customCollisionDetection}
    >
      <div className="h-screen flex flex-col bg-background">
        <Toolbar />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Sidebar (hidden in edit mode) */}
          {editorMode === "canvas" && (
            <div className="w-[280px] min-w-[280px] flex-shrink-0 border-r border-border">
              <Sidebar />
            </div>
          )}

          {/* Center Panel - Canvas / Edit / Code / Preview */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {editorMode === "code" && (
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50} minSize={30}>
                  <CodeEditor />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={30}>
                  <Preview />
                </ResizablePanel>
              </ResizablePanelGroup>
            )}
            {editorMode === "preview" && <Preview />}
            {editorMode === "edit" && <EditMode />}
            {editorMode === "canvas" && <Canvas />}
          </div>

          {/* Right Panel - Properties (hidden in edit, code, preview mode) */}
          {editorMode === "canvas" && (
            <div className="w-[300px] min-w-[300px] flex-shrink-0 border-l border-border">
              <Properties />
            </div>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>{isDragging && renderDragOverlay()}</DragOverlay>
    </DndContext>
  );
});
