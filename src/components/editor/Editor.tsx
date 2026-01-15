'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from '@dnd-kit/core';
import { useState, useCallback } from 'react';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { Properties } from './Properties';
import { Preview } from '../preview/Preview';
import { CodeEditor } from './CodeEditor';
import { useEditorStore } from '@/stores/editor';
import { useUIStore } from '@/stores/ui';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { MJMLComponentType } from '@/types/editor';
import { componentDefinitions } from '@/lib/mjml/schema';
import * as Icons from 'lucide-react';

export function Editor() {
  const { addNode, moveNode, setSelectedId } = useEditorStore();
  const { showCode, showPreview, setIsDragging, isDragging } = useUIStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<MJMLComponentType | null>(null);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setIsDragging(true);
    setActiveId(active.id as string);
    
    // Check if it's a new component drag
    if (active.data.current?.type === 'new-component') {
      setActiveType(active.data.current.componentType);
    } else {
      setActiveType(null);
    }
  }, [setIsDragging]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    // Handle new component drop
    if (activeData.type === 'new-component') {
      const componentType = activeData.componentType as MJMLComponentType;
      const targetId = overData.nodeId as string;
      const index = overData.index as number | undefined;
      
      addNode(targetId, componentType, index);
    }
    // Handle existing node move
    else if (activeData.type === 'existing-node') {
      const nodeId = activeData.nodeId as string;
      const targetId = overData.nodeId as string;
      const index = overData.index as number ?? 0;
      
      if (nodeId !== targetId) {
        moveNode(nodeId, targetId, index);
      }
    }
  }, [addNode, moveNode, setIsDragging]);

  const handleDragCancel = useCallback(() => {
    setIsDragging(false);
    setActiveId(null);
    setActiveType(null);
  }, [setIsDragging]);

  // Render drag overlay
  const renderDragOverlay = () => {
    if (!activeType) return null;
    
    const def = componentDefinitions[activeType];
    const IconComponent = Icons[def.icon as keyof typeof Icons] as React.ElementType;
    
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-lg border border-border">
        {IconComponent && <IconComponent className="w-4 h-4 text-muted-foreground" />}
        <span className="text-sm font-medium">{def.name}</span>
      </div>
    );
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
          {/* Left Panel - Sidebar */}
          <div className="w-[280px] min-w-[280px] flex-shrink-0 border-r border-border">
            <Sidebar />
          </div>

          {/* Center Panel - Canvas / Code / Preview */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {showCode ? (
              <CodeEditor />
            ) : showPreview ? (
              <Preview />
            ) : (
              <Canvas />
            )}
          </div>

          {/* Right Panel - Properties */}
          <div className="w-[300px] min-w-[300px] flex-shrink-0 border-l border-border">
            <Properties />
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {isDragging && renderDragOverlay()}
      </DragOverlay>
    </DndContext>
  );
}
