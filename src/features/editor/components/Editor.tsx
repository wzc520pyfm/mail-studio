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
  DragOverEvent,
  pointerWithin,
  rectIntersection,
  closestCenter,
  CollisionDetection,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useEditorStore, useUIStore } from "@/features/editor/stores";
import { useKeyboardShortcuts } from "@/features/editor/hooks";
import { componentDefinitions } from "@/features/editor/lib/mjml/schema";
import type { MJMLComponentType } from "@/features/editor/types";
import { Toolbar } from "./toolbar";
import { Sidebar } from "./sidebar";
import { Canvas } from "./canvas";
import { Properties } from "./properties";
// Import other mode components from original location (to be migrated later)
import { EditMode } from "@/components/editor/EditMode";
import { Preview } from "@/components/preview/Preview";
import { CodeEditor } from "@/components/editor/CodeEditor";

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
  const reorderNode = useEditorStore((s) => s.reorderNode);
  const editorMode = useUIStore((s) => s.editorMode);
  const setIsDragging = useUIStore((s) => s.setIsDragging);
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
      if (active.data.current?.type === "new-component") {
        setActiveType(active.data.current.componentType);
      } else {
        setActiveType(null);
      }
    },
    [setIsDragging]
  );

  // Track the last over id to avoid redundant moves
  const lastOverId = useRef<string | null>(null);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;

      if (!over) {
        lastOverId.current = null;
        return;
      }

      const activeData = active.data.current;
      const overData = over.data.current;

      if (!activeData || !overData) return;

      // Only handle real-time sorting for existing nodes
      if (activeData.type !== "existing-node" || overData.type !== "existing-node") {
        return;
      }

      const activeId = activeData.nodeId as string;
      const overId = overData.nodeId as string;

      // Don't process if same element
      if (activeId === overId) {
        return;
      }

      // Don't process if same as last processed (debounce)
      if (lastOverId.current === overId) {
        return;
      }

      // Only allow sorting within the same parent
      const activeParentId = activeData.parentId as string;
      const overParentId = overData.parentId as string;

      if (activeParentId !== overParentId) {
        return;
      }

      // Reorder the node to the target position
      lastOverId.current = overId;
      reorderNode(activeId, overId);
    },
    [reorderNode]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setIsDragging(false);
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
      // Handle cross-container move (existing node to different parent)
      else if (activeData.type === "existing-node") {
        const nodeId = activeData.nodeId as string;
        const nodeType = activeData.nodeType as MJMLComponentType;
        const activeParentId = activeData.parentId as string;

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
          const overIndex = (overData.index as number) ?? 0;
          acceptTypes = overData.parentAcceptTypes as MJMLComponentType[] | undefined;
          targetIndex = overIndex;
        } else {
          targetParentId = overData.nodeId as string;
          targetIndex = (overData.index as number) ?? 0;
          acceptTypes = overData.acceptTypes as MJMLComponentType[] | undefined;
        }

        // Skip if same parent (already handled by onDragOver)
        if (activeParentId === targetParentId) {
          return;
        }

        // Validate that the target accepts this node type
        if (nodeType && !canDropInto(nodeType, acceptTypes)) {
          return;
        }

        moveNode(nodeId, targetParentId, targetIndex);
      }
    },
    [addNode, moveNode, setIsDragging]
  );

  const handleDragCancel = useCallback(() => {
    setIsDragging(false);
    setActiveId(null);
    setActiveType(null);
    lastOverId.current = null;
  }, [setIsDragging]);

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
      onDragOver={handleDragOver}
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
