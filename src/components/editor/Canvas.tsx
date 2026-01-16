'use client';

import { useDroppable, useDndMonitor, DragOverEvent } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '@/stores/editor';
import { useUIStore } from '@/stores/ui';
import { EditorNode, MJMLComponentType } from '@/types/editor';
import { componentDefinitions } from '@/lib/mjml/schema';
import { cn } from '@/lib/utils';
import { Trash2, Copy, GripVertical, ChevronRight, Plus } from 'lucide-react';
import { useMemo, useCallback, useState, createContext, useContext } from 'react';

// Context for drag state
interface DragState {
  isDragging: boolean;
  activeId: string | null;
  overId: string | null;
  overPosition: 'before' | 'after' | 'inside' | null;
}

const DragStateContext = createContext<DragState>({
  isDragging: false,
  activeId: null,
  overId: null,
  overPosition: null,
});

export function Canvas() {
  const document = useEditorStore((s) => s.document);
  const selectedId = useEditorStore((s) => s.selectedId);
  const isDragging = useUIStore((s) => s.isDragging);
  
  // Track drag over state for showing indicators
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    activeId: null,
    overId: null,
    overPosition: null,
  });

  // Monitor drag events
  useDndMonitor({
    onDragStart(event) {
      setDragState({
        isDragging: true,
        activeId: event.active.id as string,
        overId: null,
        overPosition: null,
      });
    },
    onDragOver(event: DragOverEvent) {
      if (event.over) {
        const overRect = event.over.rect;
        const activeRect = event.active.rect.current.translated;
        
        let position: 'before' | 'after' | 'inside' = 'inside';
        
        if (overRect && activeRect) {
          const overCenter = overRect.top + overRect.height / 2;
          const activeCenter = activeRect.top + activeRect.height / 2;
          
          // Determine position based on mouse position relative to element center
          if (activeCenter < overRect.top + overRect.height * 0.3) {
            position = 'before';
          } else if (activeCenter > overRect.top + overRect.height * 0.7) {
            position = 'after';
          }
        }
        
        setDragState(prev => ({
          ...prev,
          overId: event.over?.id as string,
          overPosition: position,
        }));
      } else {
        setDragState(prev => ({
          ...prev,
          overId: null,
          overPosition: null,
        }));
      }
    },
    onDragEnd() {
      setDragState({
        isDragging: false,
        activeId: null,
        overId: null,
        overPosition: null,
      });
    },
    onDragCancel() {
      setDragState({
        isDragging: false,
        activeId: null,
        overId: null,
        overPosition: null,
      });
    },
  });

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
    <DragStateContext.Provider value={dragState}>
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
              className={cn(
                "bg-white shadow-lg rounded-lg overflow-hidden transition-shadow duration-200",
                isDragging && "shadow-xl ring-2 ring-blue-100"
              )}
              style={{ width: '600px', minHeight: '400px' }}
            >
              <CanvasBody node={document} />
            </div>
          </div>
        </div>

        {/* Drag hint */}
        {isDragging && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900 text-white text-sm rounded-full shadow-lg z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
            Release to drop the component
          </div>
        )}
      </div>
    </DragStateContext.Provider>
  );
}

function BreadcrumbItem({ node, isLast }: { node: EditorNode; isLast: boolean }) {
  const setSelectedId = useEditorStore((s) => s.setSelectedId);
  const def = componentDefinitions[node.type];

  return (
    <button
      onClick={() => setSelectedId(node.id)}
      className={cn(
        'px-2 py-0.5 rounded text-xs font-medium transition-colors whitespace-nowrap',
        isLast
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      )}
    >
      {def?.name || node.type}
    </button>
  );
}

// Drop indicator line component
function DropIndicatorLine({ position }: { position: 'before' | 'after' }) {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-50 pointer-events-none",
        position === 'before' ? '-top-0.5' : '-bottom-0.5'
      )}
    >
      <div className="relative">
        <div className="h-0.5 bg-blue-500 rounded-full" />
        <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
        <div className="absolute -right-1 -top-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
      </div>
    </div>
  );
}

function CanvasBody({ node }: { node: EditorNode }) {
  const bgColor = node.props['background-color'] as string || '#f4f4f4';

  const bodyAcceptTypes: MJMLComponentType[] = ['mj-section', 'mj-wrapper', 'mj-hero'];
  
  return (
    <div
      className="min-h-[400px]"
      style={{ backgroundColor: bgColor }}
    >
      <DroppableContainer nodeId={node.id} acceptTypes={bodyAcceptTypes}>
        <SortableContext
          items={node.children?.map((c) => c.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {node.children?.map((child, index) => (
            <CanvasNode key={child.id} node={child} index={index} parentId={node.id} parentAcceptTypes={bodyAcceptTypes} />
          ))}
        </SortableContext>
        {(!node.children || node.children.length === 0) && (
          <EmptyDropZone nodeId={node.id} message="Drop a Section here to start" acceptTypes={bodyAcceptTypes} />
        )}
      </DroppableContainer>
    </div>
  );
}

function CanvasNode({
  node,
  index,
  parentId,
  parentAcceptTypes,
}: {
  node: EditorNode;
  index: number;
  parentId: string;
  parentAcceptTypes?: MJMLComponentType[];
}) {
  const { selectedId, setSelectedId, hoveredId, setHoveredId, removeNode, duplicateNode } =
    useEditorStore();
  const dragState = useContext(DragStateContext);
  const isSelected = selectedId === node.id;
  const isHovered = hoveredId === node.id && !dragState.isDragging;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: node.id,
    data: {
      type: 'existing-node',
      nodeId: node.id,
      nodeType: node.type, // Include node type for validation
      parentId,
      parentAcceptTypes, // Include parent's accept types for validation
      index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedId(node.id);
    },
    [node.id, setSelectedId]
  );

  const handleMouseEnter = useCallback(() => {
    if (!dragState.isDragging) {
      setHoveredId(node.id);
    }
  }, [node.id, setHoveredId, dragState.isDragging]);

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

  // Determine if we should show drop indicators
  const showDropBefore = isOver && dragState.overPosition === 'before';
  const showDropAfter = isOver && dragState.overPosition === 'after';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group transition-all duration-150',
        // Selection states - only show when not dragging
        !isDragging && isSelected && 'ring-2 ring-blue-500 ring-offset-2 rounded-sm',
        !isDragging && isHovered && !isSelected && 'ring-2 ring-blue-300/50 rounded-sm',
        // Dragging states
        isDragging && 'opacity-40 scale-[0.98] ring-2 ring-blue-400 ring-dashed rounded-sm z-50',
        // When being dragged over
        isOver && !isDragging && 'ring-2 ring-blue-400 ring-offset-1 bg-blue-50/30 rounded-sm',
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Drop indicator - before */}
      {showDropBefore && <DropIndicatorLine position="before" />}

      {/* Component Label - shown on hover or selection, hidden during drag of this element */}
      {(isSelected || isHovered) && !isDragging && (
        <div className="absolute -top-7 left-0 z-20 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1 duration-150">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className={cn(
              "p-1.5 rounded-md bg-blue-500 text-white shadow-md",
              "cursor-grab active:cursor-grabbing",
              "hover:bg-blue-600 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-300"
            )}
            title="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-blue-500 text-white shadow-md">
            {componentDefinitions[node.type]?.name || node.type}
          </span>
        </div>
      )}

      {/* Actions - only shown when selected and not dragging */}
      {isSelected && !isDragging && (
        <div className="absolute -top-7 right-0 z-20 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1 duration-150">
          <button
            onClick={handleDuplicate}
            className={cn(
              "p-1.5 rounded-md bg-white border border-gray-200 shadow-md",
              "hover:bg-gray-50 hover:border-gray-300 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-blue-300"
            )}
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              "p-1.5 rounded-md bg-white border border-gray-200 shadow-md",
              "hover:bg-red-50 hover:border-red-300 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-red-300"
            )}
            title="Delete (Del)"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className={cn(isDragging && 'pointer-events-none')}>
        {renderContent()}
      </div>

      {/* Drop indicator - after */}
      {showDropAfter && <DropIndicatorLine position="after" />}
    </div>
  );
}

function SectionNode({ node }: { node: EditorNode }) {
  const bgColor = node.props['background-color'] as string;
  const padding = node.props['padding'] as string || '20px 0';
  const sectionAcceptTypes: MJMLComponentType[] = ['mj-column'];

  return (
    <DroppableContainer nodeId={node.id} acceptTypes={sectionAcceptTypes}>
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
            <CanvasNode key={child.id} node={child} index={index} parentId={node.id} parentAcceptTypes={sectionAcceptTypes} />
          ))}
        </SortableContext>
        {(!node.children || node.children.length === 0) && (
          <EmptyDropZone nodeId={node.id} message="Drop a Column here" small acceptTypes={sectionAcceptTypes} />
        )}
      </div>
    </DroppableContainer>
  );
}

function ColumnNode({ node }: { node: EditorNode }) {
  const width = node.props['width'] as string || '100%';
  const bgColor = node.props['background-color'] as string;
  const padding = node.props['padding'] as string || '10px';
  const columnAcceptTypes: MJMLComponentType[] = ['mj-text', 'mj-image', 'mj-button', 'mj-divider', 'mj-spacer', 'mj-social', 'mj-navbar', 'mj-accordion', 'mj-carousel', 'mj-table', 'mj-raw'];

  // Calculate flex basis
  const flexBasis = width.includes('%') ? width : 'auto';

  return (
    <DroppableContainer
      nodeId={node.id}
      acceptTypes={columnAcceptTypes}
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
            <CanvasNode key={child.id} node={child} index={index} parentId={node.id} parentAcceptTypes={columnAcceptTypes} />
          ))}
        </SortableContext>
        {(!node.children || node.children.length === 0) && (
          <EmptyDropZone nodeId={node.id} message="Drop content here" small acceptTypes={columnAcceptTypes} />
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
  const dragState = useContext(DragStateContext);
  const { isOver, setNodeRef, active } = useDroppable({
    id: `drop-${nodeId}`,
    data: {
      nodeId,
      acceptTypes,
      index: 0,
    },
  });

  // Check if the dragged type is acceptable
  // Handle both new components (componentType) and existing nodes (nodeType)
  const activeData = active?.data.current;
  const activeType = (activeData?.componentType || activeData?.nodeType) as MJMLComponentType | undefined;
  const isAcceptable = !activeType || acceptTypes.includes(activeType);
  
  // Show visual feedback during drag
  const showAcceptableHighlight = dragState.isDragging && isAcceptable;
  const showNotAcceptableHighlight = dragState.isDragging && activeType && !isAcceptable;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-all duration-200 min-h-[20px] relative',
        // Highlight when dragging over and acceptable
        isOver && isAcceptable && 'bg-blue-50/60 ring-2 ring-blue-400 ring-inset rounded-sm',
        // Show warning when not acceptable (even just hovering)
        isOver && !isAcceptable && 'bg-red-50/60 ring-2 ring-red-300 ring-inset rounded-sm',
        // Subtle highlight when dragging compatible items but not over this container
        showAcceptableHighlight && !isOver && 'bg-blue-50/20',
        // Dim appearance when dragging incompatible items
        showNotAcceptableHighlight && !isOver && 'opacity-50'
      )}
    >
      {children}
      
      {/* Drop zone overlay when dragging over and acceptable */}
      {isOver && isAcceptable && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-full shadow-lg animate-in zoom-in-90 duration-150">
            Drop here
          </div>
        </div>
      )}
      
      {/* Warning overlay when not acceptable */}
      {isOver && !isAcceptable && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-full shadow-lg animate-in zoom-in-90 duration-150">
            Cannot drop here
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyDropZone({
  nodeId,
  message,
  small = false,
  acceptTypes,
}: {
  nodeId: string;
  message: string;
  small?: boolean;
  acceptTypes?: MJMLComponentType[];
}) {
  const dragState = useContext(DragStateContext);
  const { isOver, setNodeRef, active } = useDroppable({
    id: `empty-${nodeId}`,
    data: {
      nodeId,
      acceptTypes,
      index: 0,
    },
  });

  // Check if the dragged type is acceptable
  const activeData = active?.data.current;
  const activeType = (activeData?.componentType || activeData?.nodeType) as MJMLComponentType | undefined;
  const isAcceptable = !acceptTypes || !activeType || acceptTypes.includes(activeType);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-200',
        small ? 'p-4 min-h-[60px]' : 'p-8 min-h-[120px]',
        // Default state
        !dragState.isDragging && 'border-gray-300 bg-gray-50/50',
        // Dragging acceptable type (ready to receive)
        dragState.isDragging && isAcceptable && !isOver && 'border-blue-300 bg-blue-50/30 animate-pulse',
        // Dragging non-acceptable type
        dragState.isDragging && !isAcceptable && !isOver && 'border-gray-300 bg-gray-100/50 opacity-50',
        // Hovering over with acceptable type
        isOver && isAcceptable && 'border-blue-500 bg-blue-100/50 scale-[1.02] shadow-inner',
        // Hovering over with non-acceptable type
        isOver && !isAcceptable && 'border-red-400 bg-red-100/50'
      )}
    >
      {dragState.isDragging ? (
        isAcceptable ? (
          <>
            <Plus className={cn('text-blue-500 mb-1', small ? 'w-5 h-5' : 'w-8 h-8')} />
            <span className={cn('text-blue-600 font-medium', small ? 'text-xs' : 'text-sm')}>
              {isOver ? 'Release to drop' : message}
            </span>
          </>
        ) : (
          <span className={cn('text-gray-400', small ? 'text-xs' : 'text-sm')}>
            {isOver ? 'Cannot drop here' : message}
          </span>
        )
      ) : (
        <span className={cn('text-gray-400', small ? 'text-xs' : 'text-sm')}>
          {message}
        </span>
      )}
    </div>
  );
}
