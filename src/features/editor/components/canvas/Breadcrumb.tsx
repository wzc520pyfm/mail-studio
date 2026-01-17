/**
 * Breadcrumb navigation for the canvas
 */

'use client';

import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useEditorStore } from '@/features/editor/stores';
import { useBreadcrumb } from '@/features/editor/hooks';
import { componentDefinitions } from '@/features/editor/lib/mjml/schema';
import type { EditorNode } from '@/features/editor/types';
import { cn } from '@/lib/utils';

interface BreadcrumbItemProps {
  node: EditorNode;
  isLast: boolean;
}

const BreadcrumbItem = memo(function BreadcrumbItem({ node, isLast }: BreadcrumbItemProps) {
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
});

export const Breadcrumb = memo(function Breadcrumb() {
  const document = useEditorStore((s) => s.document);
  const breadcrumbPath = useBreadcrumb();

  if (breadcrumbPath.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2 bg-background border-b border-border flex items-center gap-1 text-sm overflow-x-auto">
      <BreadcrumbItem node={document} isLast={breadcrumbPath.length === 1} />
      {breadcrumbPath.slice(1).map((node, index) => (
        <div key={node.id} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <BreadcrumbItem node={node} isLast={index === breadcrumbPath.length - 2} />
        </div>
      ))}
    </div>
  );
});
