/**
 * Shared types for Edit Mode components
 */

import type { EditorNode } from "@/types/editor";

export interface DragHandleProps {
  [key: string]: unknown;
}

export interface EditBlockProps {
  node: EditorNode;
  parentId: string;
  dragHandleProps?: DragHandleProps;
  isDragging?: boolean;
  hasColoredParent?: boolean;
}

export interface EditableComponentProps {
  node: EditorNode;
}

export interface ContainerProps {
  node: EditorNode;
  dragHandleProps?: DragHandleProps;
  isDragging?: boolean;
}

export interface ColumnContainerProps {
  node: EditorNode;
  parentId: string;
  dragHandleProps?: DragHandleProps;
  isDragging?: boolean;
}
