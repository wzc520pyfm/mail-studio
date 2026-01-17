/**
 * Button node renderer for the canvas
 */

'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { useEditorStore } from '@/features/editor/stores';
import type { EditorNode } from '@/features/editor/types';
import { cn } from '@/lib/utils';

interface ButtonNodeProps {
  node: EditorNode;
}

export const ButtonNode = memo(function ButtonNode({ node }: ButtonNodeProps) {
  const updateNodeContent = useEditorStore((s) => s.updateNodeContent);
  const selectedId = useEditorStore((s) => s.selectedId);
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
      backgroundColor: (node.props['background-color'] as string) || '#2563eb',
      color: (node.props['color'] as string) || '#ffffff',
      fontSize: (node.props['font-size'] as string) || '16px',
      fontWeight: node.props['font-weight'] as string,
      borderRadius: (node.props['border-radius'] as string) || '6px',
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
});
