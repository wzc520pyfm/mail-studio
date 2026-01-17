/**
 * Draggable component item in the sidebar
 */

'use client';

import { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
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
} from 'lucide-react';
import { componentDefinitions } from '@/features/editor/lib/mjml/schema';
import type { MJMLComponentType } from '@/features/editor/types';
import { cn } from '@/lib/utils';

// Icon mapping - avoiding barrel imports for better performance
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

interface DraggableComponentProps {
  type: MJMLComponentType;
}

export const DraggableComponent = memo(function DraggableComponent({
  type,
}: DraggableComponentProps) {
  const def = componentDefinitions[type];
  const IconComponent = iconMap[def.icon];

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: {
      type: 'new-component',
      componentType: type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg border bg-background',
        'cursor-grab active:cursor-grabbing transition-all duration-200',
        'hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm',
        'min-h-[70px]',
        'focus:outline-none focus:ring-2 focus:ring-blue-400/50',
        // Normal state
        !isDragging && 'border-border',
        // Dragging state
        isDragging && 'opacity-30 scale-95 border-dashed border-blue-400 bg-blue-50/30'
      )}
    >
      {IconComponent && (
        <IconComponent
          className={cn(
            'w-5 h-5 flex-shrink-0 transition-colors',
            isDragging ? 'text-blue-400' : 'text-muted-foreground'
          )}
        />
      )}
      <span
        className={cn(
          'text-xs font-medium text-center leading-tight transition-colors',
          isDragging && 'text-blue-400'
        )}
      >
        {def.name}
      </span>
    </div>
  );
});
