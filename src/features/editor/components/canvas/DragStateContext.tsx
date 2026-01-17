/**
 * Context for sharing drag state across canvas components
 */

'use client';

import { createContext } from 'react';
import type { DragState } from '@/features/editor/types';

export const DragStateContext = createContext<DragState>({
  isDragging: false,
  activeId: null,
  overId: null,
  overPosition: null,
});
