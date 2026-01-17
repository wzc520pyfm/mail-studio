/**
 * Editor Types - Re-export from features/editor for backward compatibility
 * @deprecated Import from '@/features/editor' instead
 */

export type {
  MJMLComponentType,
  EditorNode,
  DefaultChildNode,
  FontDefinition,
  HeadSettings,
  Template,
  ComponentCategory,
  PropSchema,
  ComponentDefinition,
  ComponentCategoryGroup,
  SocialElement,
  NavbarLink,
  AccordionElement,
  CarouselImage,
  SocialPlatform,
  EditorMode,
  PreviewMode,
  SidebarTab,
  DragState,
  DragItem,
} from '@/features/editor/types';

// Legacy interfaces for compatibility
export interface EditorState {
  document: import('@/features/editor/types').EditorNode;
  selectedId: string | null;
  hoveredId: string | null;
  isDragging: boolean;
}

export interface UIState {
  leftPanelWidth: number;
  rightPanelWidth: number;
  previewMode: 'desktop' | 'mobile';
  showCode: boolean;
  activeTab: 'components' | 'templates';
}
