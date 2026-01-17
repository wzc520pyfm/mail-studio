/**
 * Text node renderer for the canvas
 */

'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { useEditorStore } from '@/features/editor/stores';
import type { EditorNode } from '@/features/editor/types';
import { cn } from '@/lib/utils';

interface TextNodeProps {
  node: EditorNode;
}

export const TextNode = memo(function TextNode({ node }: TextNodeProps) {
  const updateNodeContent = useEditorStore((s) => s.updateNodeContent);
  const selectedId = useEditorStore((s) => s.selectedId);
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
});
