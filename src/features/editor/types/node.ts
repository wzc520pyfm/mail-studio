/**
 * Core node types for the editor
 */

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
  content?: string;
}

// Default child node definition (without id, recursive)
export interface DefaultChildNode {
  type: MJMLComponentType;
  props: Record<string, string | number | undefined>;
  content?: string;
  children?: DefaultChildNode[];
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
