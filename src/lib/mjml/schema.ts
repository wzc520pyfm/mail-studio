import { ComponentDefinition, MJMLComponentType } from '@/types/editor';

// Component definitions with metadata and property schemas
export const componentDefinitions: Record<MJMLComponentType, ComponentDefinition> = {
  'mj-body': {
    type: 'mj-body',
    name: 'Body',
    icon: 'FileText',
    category: 'layout',
    canHaveChildren: true,
    allowedChildren: ['mj-section', 'mj-wrapper', 'mj-hero', 'mj-raw'],
    defaultProps: {
      'background-color': '#f4f4f4',
      width: '600px',
    },
    propsSchema: [
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'width', label: 'Width', type: 'size', defaultValue: '600px' },
    ],
  },
  'mj-section': {
    type: 'mj-section',
    name: 'Section',
    icon: 'Rows3',
    category: 'layout',
    canHaveChildren: true,
    allowedChildren: ['mj-column'],
    defaultProps: {
      'padding': '20px 0',
      'background-color': '#ffffff',
    },
    propsSchema: [
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '20px' },
      { key: 'padding-top', label: 'Padding Top', type: 'size' },
      { key: 'padding-bottom', label: 'Padding Bottom', type: 'size' },
      { key: 'padding-left', label: 'Padding Left', type: 'size' },
      { key: 'padding-right', label: 'Padding Right', type: 'size' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      { key: 'full-width', label: 'Full Width', type: 'select', options: [
        { value: 'full-width', label: 'Full Width' },
        { value: '', label: 'Normal' },
      ]},
    ],
  },
  'mj-column': {
    type: 'mj-column',
    name: 'Column',
    icon: 'Columns3',
    category: 'layout',
    canHaveChildren: true,
    allowedChildren: ['mj-text', 'mj-image', 'mj-button', 'mj-divider', 'mj-spacer', 'mj-social', 'mj-raw'],
    defaultProps: {
      'padding': '10px',
    },
    propsSchema: [
      { key: 'width', label: 'Width', type: 'size', placeholder: 'e.g., 50%, 300px' },
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '10px' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      { key: 'vertical-align', label: 'Vertical Align', type: 'select', options: [
        { value: 'top', label: 'Top' },
        { value: 'middle', label: 'Middle' },
        { value: 'bottom', label: 'Bottom' },
      ]},
    ],
  },
  'mj-text': {
    type: 'mj-text',
    name: 'Text',
    icon: 'Type',
    category: 'content',
    canHaveChildren: false,
    defaultProps: {
      'padding': '10px 25px',
      'font-size': '16px',
      'line-height': '1.5',
      'color': '#333333',
    },
    defaultContent: 'This is a text block. Click to edit.',
    propsSchema: [
      { key: 'color', label: 'Text Color', type: 'color', defaultValue: '#333333' },
      { key: 'font-size', label: 'Font Size', type: 'size', defaultValue: '16px' },
      { key: 'font-weight', label: 'Font Weight', type: 'select', options: [
        { value: 'normal', label: 'Normal' },
        { value: 'bold', label: 'Bold' },
        { value: '300', label: 'Light' },
        { value: '500', label: 'Medium' },
        { value: '600', label: 'Semi Bold' },
        { value: '700', label: 'Bold' },
      ]},
      { key: 'font-family', label: 'Font Family', type: 'select', options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
        { value: 'Times New Roman, serif', label: 'Times New Roman' },
      ]},
      { key: 'line-height', label: 'Line Height', type: 'text', defaultValue: '1.5' },
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '10px 25px' },
    ],
  },
  'mj-image': {
    type: 'mj-image',
    name: 'Image',
    icon: 'Image',
    category: 'content',
    canHaveChildren: false,
    defaultProps: {
      'src': 'https://placehold.co/600x300/e2e8f0/64748b?text=Image',
      'alt': 'Image description',
      'padding': '10px 25px',
      'width': '100%',
    },
    propsSchema: [
      { key: 'src', label: 'Image URL', type: 'url', placeholder: 'https://example.com/image.jpg' },
      { key: 'alt', label: 'Alt Text', type: 'text', placeholder: 'Image description' },
      { key: 'href', label: 'Link URL', type: 'url', placeholder: 'https://example.com' },
      { key: 'width', label: 'Width', type: 'size', defaultValue: '100%' },
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '10px 25px' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
    ],
  },
  'mj-button': {
    type: 'mj-button',
    name: 'Button',
    icon: 'MousePointerClick',
    category: 'interactive',
    canHaveChildren: false,
    defaultProps: {
      'href': '#',
      'background-color': '#2563eb',
      'color': '#ffffff',
      'font-size': '16px',
      'padding': '15px 30px',
      'border-radius': '6px',
    },
    defaultContent: 'Click me',
    propsSchema: [
      { key: 'href', label: 'Link URL', type: 'url', placeholder: 'https://example.com' },
      { key: 'background-color', label: 'Background', type: 'color', defaultValue: '#2563eb' },
      { key: 'color', label: 'Text Color', type: 'color', defaultValue: '#ffffff' },
      { key: 'font-size', label: 'Font Size', type: 'size', defaultValue: '16px' },
      { key: 'font-weight', label: 'Font Weight', type: 'select', options: [
        { value: 'normal', label: 'Normal' },
        { value: 'bold', label: 'Bold' },
      ]},
      { key: 'border-radius', label: 'Border Radius', type: 'size', defaultValue: '6px' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '15px 30px' },
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'width', label: 'Width', type: 'size', placeholder: 'auto or px' },
    ],
  },
  'mj-divider': {
    type: 'mj-divider',
    name: 'Divider',
    icon: 'Minus',
    category: 'content',
    canHaveChildren: false,
    defaultProps: {
      'border-color': '#e2e8f0',
      'border-width': '1px',
      'border-style': 'solid',
      'padding': '10px 25px',
    },
    propsSchema: [
      { key: 'border-color', label: 'Color', type: 'color', defaultValue: '#e2e8f0' },
      { key: 'border-width', label: 'Width', type: 'size', defaultValue: '1px' },
      { key: 'border-style', label: 'Style', type: 'select', options: [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' },
      ]},
      { key: 'width', label: 'Line Width', type: 'size', defaultValue: '100%' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '10px 25px' },
    ],
  },
  'mj-spacer': {
    type: 'mj-spacer',
    name: 'Spacer',
    icon: 'Space',
    category: 'content',
    canHaveChildren: false,
    defaultProps: {
      'height': '30px',
    },
    propsSchema: [
      { key: 'height', label: 'Height', type: 'size', defaultValue: '30px' },
    ],
  },
  'mj-social': {
    type: 'mj-social',
    name: 'Social',
    icon: 'Share2',
    category: 'interactive',
    canHaveChildren: false,
    defaultProps: {
      'mode': 'horizontal',
      'padding': '10px 25px',
    },
    propsSchema: [
      { key: 'mode', label: 'Mode', type: 'select', options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ]},
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '10px 25px' },
    ],
  },
  'mj-hero': {
    type: 'mj-hero',
    name: 'Hero',
    icon: 'LayoutTemplate',
    category: 'layout',
    canHaveChildren: true,
    allowedChildren: ['mj-text', 'mj-image', 'mj-button'],
    defaultProps: {
      'mode': 'fixed-height',
      'height': '400px',
      'background-color': '#1e293b',
      'padding': '40px',
    },
    propsSchema: [
      { key: 'mode', label: 'Mode', type: 'select', options: [
        { value: 'fixed-height', label: 'Fixed Height' },
        { value: 'fluid-height', label: 'Fluid Height' },
      ]},
      { key: 'height', label: 'Height', type: 'size', defaultValue: '400px' },
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'background-url', label: 'Background Image', type: 'url' },
      { key: 'vertical-align', label: 'Vertical Align', type: 'select', options: [
        { value: 'top', label: 'Top' },
        { value: 'middle', label: 'Middle' },
        { value: 'bottom', label: 'Bottom' },
      ]},
      { key: 'padding', label: 'Padding', type: 'size' },
    ],
  },
  'mj-wrapper': {
    type: 'mj-wrapper',
    name: 'Wrapper',
    icon: 'Square',
    category: 'layout',
    canHaveChildren: true,
    allowedChildren: ['mj-section'],
    defaultProps: {
      'padding': '20px 0',
      'background-color': '#f8fafc',
    },
    propsSchema: [
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'padding', label: 'Padding', type: 'size' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
    ],
  },
  'mj-raw': {
    type: 'mj-raw',
    name: 'Raw HTML',
    icon: 'Code',
    category: 'content',
    canHaveChildren: false,
    defaultProps: {},
    defaultContent: '<!-- Custom HTML here -->',
    propsSchema: [],
  },
};

// Get component categories for sidebar
export const componentCategories = [
  {
    id: 'layout',
    name: 'Layout',
    components: ['mj-section', 'mj-column', 'mj-wrapper'] as MJMLComponentType[],
  },
  {
    id: 'content',
    name: 'Content',
    components: ['mj-text', 'mj-image', 'mj-divider', 'mj-spacer'] as MJMLComponentType[],
  },
  {
    id: 'interactive',
    name: 'Interactive',
    components: ['mj-button', 'mj-social'] as MJMLComponentType[],
  },
];

// Helper to create a new node with defaults
export function createNode(type: MJMLComponentType, overrides?: Partial<EditorNode>): EditorNode {
  const def = componentDefinitions[type];
  return {
    id: generateId(),
    type,
    props: { ...def.defaultProps },
    content: def.defaultContent,
    children: def.canHaveChildren ? [] : undefined,
    ...overrides,
  };
}

// Generate unique ID
export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Import EditorNode type
import { EditorNode } from '@/types/editor';
