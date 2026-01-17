/**
 * Canvas body - root document renderer
 */

'use client';

import { memo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { EditorNode, MJMLComponentType } from '@/features/editor/types';
import { DroppableContainer } from './DroppableContainer';
import { EmptyDropZone } from './EmptyDropZone';
import { CanvasNode } from './CanvasNode';

interface CanvasBodyProps {
  node: EditorNode;
}

const bodyAcceptTypes: MJMLComponentType[] = ['mj-section', 'mj-wrapper', 'mj-hero'];

export const CanvasBody = memo(function CanvasBody({ node }: CanvasBodyProps) {
  const bgColor = (node.props['background-color'] as string) || '#f4f4f4';

  return (
    <div className="min-h-[400px]" style={{ backgroundColor: bgColor }}>
      <DroppableContainer nodeId={node.id} acceptTypes={bodyAcceptTypes}>
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
              parentAcceptTypes={bodyAcceptTypes}
            />
          ))}
        </SortableContext>
        {(!node.children || node.children.length === 0) && (
          <EmptyDropZone
            nodeId={node.id}
            message="Drop a Section here to start"
            acceptTypes={bodyAcceptTypes}
          />
        )}
      </DroppableContainer>
    </div>
  );
});
