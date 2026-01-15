// MJML Component Types
export type MJMLComponentType =
  | 'mj-body'
  | 'mj-section'
  | 'mj-column'
  | 'mj-text'
  | 'mj-image'
  | 'mj-button'
  | 'mj-divider'
  | 'mj-spacer'
  | 'mj-social'
  | 'mj-hero'
  | 'mj-wrapper'
  | 'mj-raw';

// Editor Node - represents a single MJML component in the editor
export interface EditorNode {
  id: string;
  type: MJMLComponentType;
  props: Record<string, string | number | undefined>;
  children?: EditorNode[];
  content?: string; // For text content
}

// Editor State
export interface EditorState {
  document: EditorNode;
  selectedId: string | null;
  hoveredId: string | null;
  isDragging: boolean;
}

// UI State
export interface UIState {
  leftPanelWidth: number;
  rightPanelWidth: number;
  previewMode: 'desktop' | 'mobile';
  showCode: boolean;
  activeTab: 'components' | 'templates';
}

// Component Definition - metadata for each MJML component
export interface ComponentDefinition {
  type: MJMLComponentType;
  name: string;
  icon: string;
  category: 'layout' | 'content' | 'interactive';
  canHaveChildren: boolean;
  allowedChildren?: MJMLComponentType[];
  defaultProps: Record<string, string | number>;
  defaultContent?: string;
  propsSchema: PropSchema[];
}

// Property Schema - defines editable properties
export interface PropSchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'size' | 'alignment' | 'url';
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string | number;
}

// Template
export interface Template {
  id: string;
  name: string;
  category: 'marketing' | 'notification' | 'newsletter' | 'welcome';
  thumbnail?: string;
  document: EditorNode;
}

// Drag Item
export interface DragItem {
  type: 'new-component' | 'existing-node';
  componentType?: MJMLComponentType;
  nodeId?: string;
}
