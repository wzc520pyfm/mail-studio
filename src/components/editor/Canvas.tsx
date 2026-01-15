'use client';

import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditorStore } from '@/stores/editor';
import { useUIStore } from '@/stores/ui';
import { EditorNode, MJMLComponentType } from '@/types/editor';
import { componentDefinitions } from '@/lib/mjml/schema';
import { cn } from '@/lib/utils';
import { Trash2, Copy, GripVertical, ChevronRight } from 'lucide-react';
import { useMemo, useCallback, useState } from 'react';

export function Canvas() {
  const document = useEditorStore((s) => s.document);
  const selectedId = useEditorStore((s) => s.selectedId);
  const findNode = useEditorStore((s) => s.findNode);

  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    if (!selectedId) return [];
    const path: EditorNode[] = [];
    
    const findPath = (node: EditorNode, target: string): boolean => {
      if (node.id === target) {
        path.push(node);
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          if (findPath(child, target)) {
            path.unshift(node);
            return true;
          }
        }
      }
      return false;
    };
    
    findPath(document, selectedId);
    return path;
  }, [document, selectedId]);

  return (
    <div className="h-full bg-muted/50 flex flex-col">
      {/* Breadcrumb */}
      {breadcrumbPath.length > 0 && (
        <div className="px-4 py-2 bg-background border-b border-border flex items-center gap-1 text-sm overflow-x-auto">
          <BreadcrumbItem node={document} isLast={breadcrumbPath.length === 1} />
          {breadcrumbPath.slice(1).map((node, index) => (
            <div key={node.id} className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <BreadcrumbItem node={node} isLast={index === breadcrumbPath.length - 2} />
            </div>
          ))}
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full flex items-start justify-center p-8">
          <div
            className="bg-white shadow-lg rounded-lg overflow-hidden"
            style={{ width: '600px', minHeight: '400px' }}
          >
            <CanvasBody node={document} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BreadcrumbItem({ node, isLast }: { node: EditorNode; isLast: boolean }) {
  const setSelectedId = useEditorStore((s) => s.setSelectedId);
  const def = componentDefinitions[node.type];

  return (
    <button
      onClick={() => setSelectedId(node.id)}
      className={cn(
        'px-2 py-0.5 rounded text-xs font-medium transition-colors',
        isLast
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      )}
    >
      {def?.name || node.type}
    </button>
  );
}

function CanvasBody({ node }: { node: EditorNode }) {
  const bgColor = node.props['background-color'] as string || '#f4f4f4';

  return (
    <div
      className="min-h-[400px]"
      style={{ backgroundColor: bgColor }}
    >
      <DroppableContainer nodeId={node.id} acceptTypes={['mj-section', 'mj-wrapper', 'mj-hero']}>
        <SortableContext
          items={node.children?.map((c) => c.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {node.children?.map((child, index) => (
            <CanvasNode key={child.id} node={child} index={index} parentId={node.id} />
          ))}
        </SortableContext>
        {(!node.children || node.children.length === 0) && (
          <EmptyDropZone nodeId={node.id} message="Drop a Section here to start" />
        )}
      </DroppableContainer>
    </div>
  );
}

function CanvasNode({
  node,
  index,
  parentId,
}: {
  node: EditorNode;
  index: number;
  parentId: string;
}) {
  const { selectedId, setSelectedId, hoveredId, setHoveredId, removeNode, duplicateNode } =
    useEditorStore();
  const isSelected = selectedId === node.id;
  const isHovered = hoveredId === node.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: {
      type: 'existing-node',
      nodeId: node.id,
      parentId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedId(node.id);
    },
    [node.id, setSelectedId]
  );

  const handleMouseEnter = useCallback(() => {
    setHoveredId(node.id);
  }, [node.id, setHoveredId]);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, [setHoveredId]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeNode(node.id);
    },
    [node.id, removeNode]
  );

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      duplicateNode(node.id);
    },
    [node.id, duplicateNode]
  );

  const renderContent = () => {
    switch (node.type) {
      case 'mj-section':
        return <SectionNode node={node} />;
      case 'mj-column':
        return <ColumnNode node={node} />;
      case 'mj-text':
        return <TextNode node={node} />;
      case 'mj-image':
        return <ImageNode node={node} />;
      case 'mj-button':
        return <ButtonNode node={node} />;
      case 'mj-divider':
        return <DividerNode node={node} />;
      case 'mj-spacer':
        return <SpacerNode node={node} />;
      default:
        return <GenericNode node={node} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group transition-all duration-150',
        isSelected && 'ring-2 ring-blue-500 ring-offset-1',
        isHovered && !isSelected && 'ring-1 ring-blue-300',
        isDragging && 'z-50'
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Component Label */}
      {(isSelected || isHovered) && (
        <div className="absolute -top-6 left-0 z-10 flex items-center gap-1">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-1 rounded bg-blue-500 text-white cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-3 h-3" />
          </button>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500 text-white">
            {componentDefinitions[node.type]?.name || node.type}
          </span>
        </div>
      )}

      {/* Actions */}
      {isSelected && (
        <div className="absolute -top-6 right-0 z-10 flex items-center gap-1">
          <button
            onClick={handleDuplicate}
            className="p-1 rounded bg-white border shadow-sm hover:bg-gray-50 transition-colors"
            title="Duplicate"
          >
            <Copy className="w-3 h-3 text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded bg-white border shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        </div>
      )}

      {renderContent()}
    </div>
  );
}

function SectionNode({ node }: { node: EditorNode }) {
  const bgColor = node.props['background-color'] as string;
  const padding = node.props['padding'] as string || '20px 0';

  return (
    <DroppableContainer nodeId={node.id} acceptTypes={['mj-column']}>
      <div
        className="flex flex-wrap"
        style={{
          backgroundColor: bgColor,
          padding,
        }}
      >
        <SortableContext
          items={node.children?.map((c) => c.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {node.children?.map((child, index) => (
            <CanvasNode key={child.id} node={child} index={index} parentId={node.id} />
          ))}
        </SortableContext>
        {(!node.children || node.children.length === 0) && (
          <EmptyDropZone nodeId={node.id} message="Drop a Column here" small />
        )}
      </div>
    </DroppableContainer>
  );
}

function ColumnNode({ node }: { node: EditorNode }) {
  const width = node.props['width'] as string || '100%';
  const bgColor = node.props['background-color'] as string;
  const padding = node.props['padding'] as string || '10px';

  // Calculate flex basis
  const flexBasis = width.includes('%') ? width : 'auto';

  return (
    <DroppableContainer
      nodeId={node.id}
      acceptTypes={['mj-text', 'mj-image', 'mj-button', 'mj-divider', 'mj-spacer', 'mj-social']}
    >
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
            <CanvasNode key={child.id} node={child} index={index} parentId={node.id} />
          ))}
        </SortableContext>
        {(!node.children || node.children.length === 0) && (
          <EmptyDropZone nodeId={node.id} message="Drop content here" small />
        )}
      </div>
    </DroppableContainer>
  );
}

function TextNode({ node }: { node: EditorNode }) {
  const { updateNodeContent, selectedId } = useEditorStore();
  const isSelected = selectedId === node.id;
  const [isEditing, setIsEditing] = useState(false);

  const style = useMemo(
    () => ({
      color: node.props['color'] as string,
      fontSize: node.props['font-size'] as string,
      fontWeight: node.props['font-weight'] as string,
      fontFamily: node.props['font-family'] as string,
      lineHeight: node.props['line-height'] as string,
      textAlign: node.props['align'] as 'left' | 'center' | 'right',
      padding: node.props['padding'] as string,
    }),
    [node.props]
  );

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      setIsEditing(false);
      updateNodeContent(node.id, e.currentTarget.innerHTML);
    },
    [node.id, updateNodeContent]
  );

  return (
    <div
      contentEditable={isEditing}
      suppressContentEditableWarning
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      className={cn(
        'outline-none min-h-[1em] transition-all',
        isEditing && 'cursor-text bg-blue-50/50 ring-1 ring-blue-200',
        !isEditing && isSelected && 'cursor-pointer'
      )}
      style={style}
      dangerouslySetInnerHTML={{ __html: node.content || '' }}
    />
  );
}

function ImageNode({ node }: { node: EditorNode }) {
  const src = node.props['src'] as string;
  const alt = node.props['alt'] as string || '';
  const padding = node.props['padding'] as string;
  const borderRadius = node.props['border-radius'] as string;
  const align = node.props['align'] as string || 'center';

  return (
    <div
      style={{
        padding,
        textAlign: align as 'left' | 'center' | 'right',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius,
          display: 'inline-block',
        }}
      />
    </div>
  );
}

function ButtonNode({ node }: { node: EditorNode }) {
  const { updateNodeContent, selectedId } = useEditorStore();
  const isSelected = selectedId === node.id;
  const [isEditing, setIsEditing] = useState(false);

  const containerStyle = useMemo(
    () => ({
      padding: node.props['padding'] as string,
      textAlign: (node.props['align'] as 'left' | 'center' | 'right') || 'center',
    }),
    [node.props]
  );

  const buttonStyle = useMemo(
    () => ({
      backgroundColor: node.props['background-color'] as string || '#2563eb',
      color: node.props['color'] as string || '#ffffff',
      fontSize: node.props['font-size'] as string || '16px',
      fontWeight: node.props['font-weight'] as string,
      borderRadius: node.props['border-radius'] as string || '6px',
      padding: '15px 30px',
      display: 'inline-block',
      textDecoration: 'none',
      cursor: 'pointer',
    }),
    [node.props]
  );

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLSpanElement>) => {
      setIsEditing(false);
      updateNodeContent(node.id, e.currentTarget.textContent || '');
    },
    [node.id, updateNodeContent]
  );

  return (
    <div style={containerStyle}>
      <span
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
        className={cn(
          'outline-none',
          isEditing && 'ring-2 ring-blue-300',
          !isEditing && isSelected && 'cursor-pointer'
        )}
        style={buttonStyle}
      >
        {node.content || 'Button'}
      </span>
    </div>
  );
}

function DividerNode({ node }: { node: EditorNode }) {
  const style = useMemo(
    () => ({
      padding: node.props['padding'] as string || '10px 25px',
    }),
    [node.props]
  );

  const hrStyle = useMemo(
    () => ({
      borderColor: node.props['border-color'] as string || '#e2e8f0',
      borderWidth: node.props['border-width'] as string || '1px',
      borderStyle: (node.props['border-style'] as string) || 'solid',
      width: node.props['width'] as string || '100%',
      margin: '0 auto',
    }),
    [node.props]
  );

  return (
    <div style={style}>
      <hr style={hrStyle} />
    </div>
  );
}

function SpacerNode({ node }: { node: EditorNode }) {
  const height = node.props['height'] as string || '30px';

  return (
    <div
      className="bg-muted/30 border border-dashed border-muted-foreground/20 flex items-center justify-center"
      style={{ height }}
    >
      <span className="text-xs text-muted-foreground">Spacer ({height})</span>
    </div>
  );
}

function GenericNode({ node }: { node: EditorNode }) {
  return (
    <div className="p-4 bg-muted/50 border border-dashed border-muted-foreground/30 rounded">
      <span className="text-sm text-muted-foreground">{node.type}</span>
    </div>
  );
}

function DroppableContainer({
  nodeId,
  acceptTypes,
  children,
}: {
  nodeId: string;
  acceptTypes: MJMLComponentType[];
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `drop-${nodeId}`,
    data: {
      nodeId,
      acceptTypes,
      index: 0,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-colors duration-150 min-h-[20px]',
        isOver && 'bg-blue-50/50 ring-2 ring-blue-300 ring-inset'
      )}
    >
      {children}
    </div>
  );
}

function EmptyDropZone({
  nodeId,
  message,
  small = false,
}: {
  nodeId: string;
  message: string;
  small?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `empty-${nodeId}`,
    data: {
      nodeId,
      index: 0,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-150',
        small ? 'p-4 border-muted-foreground/20' : 'p-8 border-muted-foreground/30',
        isOver && 'border-blue-400 bg-blue-50 scale-[1.02]'
      )}
    >
      <span className={cn('text-muted-foreground', small ? 'text-xs' : 'text-sm')}>
        {message}
      </span>
    </div>
  );
}
