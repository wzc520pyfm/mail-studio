/**
 * UI state types
 */

// Editor view modes
export type EditorMode = "canvas" | "edit" | "preview" | "code";

// Preview device modes
export type PreviewMode = "desktop" | "mobile";

// Sidebar tabs
export type SidebarTab = "components" | "templates";

// Drag state for canvas
export interface DragState {
  isDragging: boolean;
  activeId: string | null;
  overId: string | null;
  overPosition: "before" | "after" | "inside" | null;
}

// Drag item type
export interface DragItem {
  type: "new-component" | "existing-node";
  componentType?: string;
  nodeId?: string;
  nodeType?: string;
  parentId?: string;
  parentAcceptTypes?: string[];
  index?: number;
}
