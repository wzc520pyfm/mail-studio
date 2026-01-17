/**
 * Column node renderer with droppable children
 */

'use client';

import { memo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { EditorNode, MJMLComponentType } from '@/features/editor/types';
import { DroppableContainer } from './DroppableContainer';
import { EmptyDropZone } from './EmptyDropZone';
import { CanvasNode } from './CanvasNode';

interface ColumnNodeProps {
  node: EditorNode;
}

const columnAcceptTypes: MJMLComponentType[] = [
  'mj-text',
  'mj-image',
  'mj-button',
  'mj-divider',
  'mj-spacer',
  'mj-social',
  'mj-navbar',
  'mj-accordion',
  'mj-carousel',
  'mj-table',
  'mj-raw',
];

export const ColumnNode = memo(function ColumnNode({ node }: ColumnNodeProps) {
  const width = (node.props['width'] as string) || '100%';
  const bgColor = node.props['background-color'] as string;
  const padding = (node.props['padding'] as string) || '10px';

  // Calculate flex basis
  const flexBasis = width.includes('%') ? width : 'auto';

  return (
    <DroppableContainer nodeId={node.id} acceptTypes={columnAcceptTypes}>
      <div
        className="min-h-[60px]"
        style={{
          flex: `1 1 ${flexBasis}`,
          maxWidth: width,
          backgroundColor: bgColor,
          padding,
        }}
      >
        <SortableContext
          items={node.children?.map((c) => c.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {node.children?.map((child, index) => (
            <CanvasNode
              key={child.id}
              node={child}
              index={index}
              parentId={node.id}
              parentAcceptTypes={columnAcceptTypes}
            />
          ))}
        </SortableContext>
        {(!node.children || node.children.length === 0) && (
          <EmptyDropZone
            nodeId={node.id}
            message="Drop content here"
            small
            acceptTypes={columnAcceptTypes}
          />
        )}
      </div>
    </DroppableContainer>
  );
});
