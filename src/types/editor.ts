// MJML Component Types
export type MJMLComponentType =
  // Layout components
  | 'mj-body'
  | 'mj-section'
  | 'mj-column'
  | 'mj-group'
  | 'mj-wrapper'
  | 'mj-hero'
  // Content components
  | 'mj-text'
  | 'mj-image'
  | 'mj-divider'
  | 'mj-spacer'
  | 'mj-table'
  | 'mj-raw'
  // Interactive components
  | 'mj-button'
  | 'mj-navbar'
  | 'mj-navbar-link'
  | 'mj-accordion'
  | 'mj-accordion-element'
  | 'mj-accordion-title'
  | 'mj-accordion-text'
  | 'mj-carousel'
  | 'mj-carousel-image'
  // Social components
  | 'mj-social'
  | 'mj-social-element';

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

// Default child node definition (without id, recursive)
export interface DefaultChildNode {
  type: MJMLComponentType;
  props: Record<string, string | number | undefined>;
  content?: string;
  children?: DefaultChildNode[];
}

// Component Definition - metadata for each MJML component
export interface ComponentDefinition {
  type: MJMLComponentType;
  name: string;
  icon: string;
  category: 'layout' | 'content' | 'interactive' | 'social';
  canHaveChildren: boolean;
  allowedChildren?: MJMLComponentType[];
  allowedParents?: MJMLComponentType[];
  defaultProps: Record<string, string | number>;
  defaultContent?: string;
  defaultChildren?: DefaultChildNode[];
  propsSchema: PropSchema[];
}

// Property Schema - defines editable properties
export interface PropSchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'size' | 'alignment' | 'url' | 'textarea' | 'social-elements' | 'navbar-links' | 'accordion-elements' | 'carousel-images';
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string | number;
}

// Social Element for mj-social-element
export interface SocialElement {
  name: string;
  href: string;
  src?: string;
  'background-color'?: string;
  'border-radius'?: string;
  'icon-size'?: string;
  padding?: string;
}

// Navbar Link for mj-navbar-link
export interface NavbarLink {
  content: string;
  href: string;
  color?: string;
  'font-family'?: string;
  'font-size'?: string;
  padding?: string;
}

// Accordion Element for mj-accordion-element
export interface AccordionElement {
  title: string;
  content: string;
  'icon-wrapped-url'?: string;
  'icon-unwrapped-url'?: string;
  'background-color'?: string;
}

// Carousel Image for mj-carousel-image
export interface CarouselImage {
  src: string;
  alt?: string;
  href?: string;
  title?: string;
  'thumbnails-src'?: string;
}

// Font definition for mj-font
export interface FontDefinition {
  name: string;
  href: string;
}

// Head Settings for mj-head components
export interface HeadSettings {
  title?: string;
  preview?: string;
  fonts?: FontDefinition[];
  styles?: string;
  breakpoint?: string;
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
