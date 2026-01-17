/**
 * Drop indicator line component
 */

'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface DropIndicatorLineProps {
  position: 'before' | 'after';
}

export const DropIndicatorLine = memo(function DropIndicatorLine({
  position,
}: DropIndicatorLineProps) {
  return (
    <div
      className={cn(
        'absolute left-0 right-0 z-50 pointer-events-none',
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
});
