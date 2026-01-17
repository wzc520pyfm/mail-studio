/**
 * Image node renderer for the canvas
 */

'use client';

import { memo } from 'react';
import type { EditorNode } from '@/features/editor/types';

interface ImageNodeProps {
  node: EditorNode;
}

export const ImageNode = memo(function ImageNode({ node }: ImageNodeProps) {
  const src = node.props['src'] as string;
  const alt = (node.props['alt'] as string) || '';
  const padding = node.props['padding'] as string;
  const borderRadius = node.props['border-radius'] as string;
  const align = (node.props['align'] as string) || 'center';

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
});
