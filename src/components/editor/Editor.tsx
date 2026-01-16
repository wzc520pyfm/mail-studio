"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { useState, useCallback } from "react";
import { Toolbar } from "./Toolbar";
import { Sidebar } from "./Sidebar";
import { Canvas } from "./Canvas";
import { EditMode } from "./EditMode";
import { Properties } from "./Properties";
import { Preview } from "../preview/Preview";
import { CodeEditor } from "./CodeEditor";
import { useEditorStore } from "@/stores/editor";
import { useUIStore } from "@/stores/ui";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { MJMLComponentType } from "@/types/editor";
import { componentDefinitions } from "@/lib/mjml/schema";
import * as Icons from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export function Editor() {
  const { addNode, moveNode, setSelectedId } = useEditorStore();
  const { editorMode, setIsDragging, isDragging } = useUIStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<MJMLComponentType | null>(null);

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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setIsDragging(false);
      setActiveId(null);
      setActiveType(null);

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
        const targetId = overData.nodeId as string;
        const index = overData.index as number | undefined;
        const acceptTypes = overData.acceptTypes as MJMLComponentType[] | undefined;

        // Validate that the target accepts this component type
        if (!canDropInto(componentType, acceptTypes)) {
          console.warn(`Cannot drop ${componentType} into this container`);
          return;
        }

        addNode(targetId, componentType, index);
      }
      // Handle existing node move
      else if (activeData.type === "existing-node") {
        const nodeId = activeData.nodeId as string;
        const nodeType = activeData.nodeType as MJMLComponentType;
        
        // Determine the actual target parent and index
        // If dropping on a DroppableContainer (drop-* or empty-*), use that nodeId as parent
        // If dropping on another sortable node, use that node's parent
        const overId = over.id as string;
        const isDropContainer = overId.startsWith('drop-') || overId.startsWith('empty-');
        
        let targetParentId: string;
        let targetIndex: number;
        let acceptTypes: MJMLComponentType[] | undefined;
        
        if (isDropContainer) {
          // Dropping directly into a container
          targetParentId = overData.nodeId as string;
          targetIndex = (overData.index as number) ?? 0;
          acceptTypes = overData.acceptTypes as MJMLComponentType[] | undefined;
        } else if (overData.type === 'existing-node') {
          // Dropping onto another node - use the node's parent as the target
          targetParentId = overData.parentId as string;
          targetIndex = (overData.index as number) ?? 0;
          acceptTypes = overData.parentAcceptTypes as MJMLComponentType[] | undefined;
          
          // Don't move if trying to drop on itself
          if (nodeId === overId) return;
          
          // If the active node is from the same parent and before the over node,
          // we need to adjust the index
          if (activeData.parentId === targetParentId) {
            const activeIndex = activeData.index as number;
            if (activeIndex < targetIndex) {
              targetIndex = targetIndex; // Insert after the over node
            } else {
              targetIndex = targetIndex; // Insert at the over node's position
            }
          }
        } else {
          // Fallback
          targetParentId = overData.nodeId as string;
          targetIndex = (overData.index as number) ?? 0;
          acceptTypes = overData.acceptTypes as MJMLComponentType[] | undefined;
        }

        // Validate that the target accepts this node type
        if (nodeType && !canDropInto(nodeType, acceptTypes)) {
          console.warn(`Cannot move ${nodeType} into this container`);
          return;
        }

        // Don't move if nothing changes
        if (nodeId === targetParentId) return;
        
        moveNode(nodeId, targetParentId, targetIndex);
      }
    },
    [addNode, moveNode, setIsDragging]
  );

  const handleDragCancel = useCallback(() => {
    setIsDragging(false);
    setActiveId(null);
    setActiveType(null);
  }, [setIsDragging]);

  // Render drag overlay
  const renderDragOverlay = () => {
    if (!activeType) return null;

    const def = componentDefinitions[activeType];
    const IconComponent = Icons[
      def.icon as keyof typeof Icons
    ] as React.ElementType;

    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg shadow-2xl border-2 border-blue-400 transform -rotate-2 scale-105">
        <div className="p-1.5 bg-blue-50 rounded-md">
          {IconComponent && (
            <IconComponent className="w-4 h-4 text-blue-600" />
          )}
        </div>
        <span className="text-sm font-semibold text-gray-700">{def.name}</span>
        <div className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
          Dragging
        </div>
      </div>
    );
  };

  // Custom drop animation for smoother experience
  const dropAnimation = {
    duration: 200,
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      collisionDetection={pointerWithin}
    >
      <div className="h-screen flex flex-col bg-background">
        <Toolbar />

        {/* Main Content Area - Using Flexbox */}
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

      <DragOverlay dropAnimation={dropAnimation}>
        {isDragging && renderDragOverlay()}
      </DragOverlay>
    </DndContext>
  );
}
