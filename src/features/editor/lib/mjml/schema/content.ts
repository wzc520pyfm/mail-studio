/**
 * Content component definitions (mj-text, mj-image, mj-divider, mj-spacer, mj-table, mj-raw)
 */

import type { ComponentDefinition } from '@/features/editor/types';

// Font family options used across multiple components
export const fontFamilyOptions = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

export const contentComponents: Record<string, ComponentDefinition> = {
  'mj-text': {
    type: 'mj-text',
    name: 'Text',
    icon: 'Type',
    category: 'content',
    canHaveChildren: false,
    defaultProps: {
      padding: '10px 25px',
      'font-size': '16px',
      'line-height': '1.5',
      color: '#333333',
    },
    defaultContent: 'This is a text block. Click to edit.',
    propsSchema: [
      { key: 'color', label: 'Text Color', type: 'color', defaultValue: '#333333' },
      { key: 'font-size', label: 'Font Size', type: 'size', defaultValue: '16px' },
      {
        key: 'font-weight',
        label: 'Font Weight',
        type: 'select',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'bold', label: 'Bold' },
          { value: '300', label: 'Light' },
          { value: '500', label: 'Medium' },
          { value: '600', label: 'Semi Bold' },
          { value: '700', label: 'Bold' },
        ],
      },
      {
        key: 'font-style',
        label: 'Font Style',
        type: 'select',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'italic', label: 'Italic' },
        ],
      },
      { key: 'font-family', label: 'Font Family', type: 'select', options: fontFamilyOptions },
      { key: 'line-height', label: 'Line Height', type: 'text', defaultValue: '1.5' },
      { key: 'letter-spacing', label: 'Letter Spacing', type: 'size' },
      {
        key: 'text-decoration',
        label: 'Text Decoration',
        type: 'select',
        options: [
          { value: 'none', label: 'None' },
          { value: 'underline', label: 'Underline' },
          { value: 'line-through', label: 'Line Through' },
        ],
      },
      {
        key: 'text-transform',
        label: 'Text Transform',
        type: 'select',
        options: [
          { value: 'none', label: 'None' },
          { value: 'uppercase', label: 'Uppercase' },
          { value: 'lowercase', label: 'Lowercase' },
          { value: 'capitalize', label: 'Capitalize' },
        ],
      },
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '10px 25px' },
      { key: 'container-background-color', label: 'Container Background', type: 'color' },
    ],
  },

  'mj-image': {
    type: 'mj-image',
    name: 'Image',
    icon: 'Image',
    category: 'content',
    canHaveChildren: false,
    defaultProps: {
      src: 'https://placehold.co/600x300/e2e8f0/64748b?text=Image',
      alt: 'Image description',
      padding: '10px 25px',
      width: '100%',
    },
    propsSchema: [
      { key: 'src', label: 'Image URL', type: 'url', placeholder: 'https://example.com/image.jpg' },
      { key: 'alt', label: 'Alt Text', type: 'text', placeholder: 'Image description' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'href', label: 'Link URL', type: 'url', placeholder: 'https://example.com' },
      {
        key: 'target',
        label: 'Link Target',
        type: 'select',
        options: [
          { value: '_self', label: 'Same Window' },
          { value: '_blank', label: 'New Window' },
        ],
      },
      { key: 'width', label: 'Width', type: 'size', defaultValue: '100%' },
      { key: 'height', label: 'Height', type: 'size', placeholder: 'auto' },
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '10px 25px' },
      { key: 'border', label: 'Border', type: 'text', placeholder: '1px solid #000' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      {
        key: 'fluid-on-mobile',
        label: 'Fluid on Mobile',
        type: 'select',
        options: [
          { value: 'true', label: 'Yes' },
          { value: '', label: 'No' },
        ],
      },
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
      padding: '10px 25px',
    },
    propsSchema: [
      { key: 'border-color', label: 'Color', type: 'color', defaultValue: '#e2e8f0' },
      { key: 'border-width', label: 'Width', type: 'size', defaultValue: '1px' },
      {
        key: 'border-style',
        label: 'Style',
        type: 'select',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
          { value: 'double', label: 'Double' },
        ],
      },
      { key: 'width', label: 'Line Width', type: 'size', defaultValue: '100%' },
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '10px 25px' },
      { key: 'container-background-color', label: 'Container Background', type: 'color' },
    ],
  },

  'mj-spacer': {
    type: 'mj-spacer',
    name: 'Spacer',
    icon: 'Space',
    category: 'content',
    canHaveChildren: false,
    defaultProps: {
      height: '30px',
    },
    propsSchema: [
      { key: 'height', label: 'Height', type: 'size', defaultValue: '30px' },
      { key: 'container-background-color', label: 'Container Background', type: 'color' },
      { key: 'padding', label: 'Padding', type: 'size' },
      { key: 'padding-top', label: 'Padding Top', type: 'size' },
      { key: 'padding-bottom', label: 'Padding Bottom', type: 'size' },
      { key: 'padding-left', label: 'Padding Left', type: 'size' },
      { key: 'padding-right', label: 'Padding Right', type: 'size' },
    ],
  },

  'mj-table': {
    type: 'mj-table',
    name: 'Table',
    icon: 'Table',
    category: 'content',
    canHaveChildren: false,
    defaultProps: {
      padding: '10px 25px',
      width: '100%',
    },
    defaultContent: `<tr>
  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Header 1</th>
  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Header 2</th>
</tr>
<tr>
  <td style="padding: 8px;">Cell 1</td>
  <td style="padding: 8px;">Cell 2</td>
</tr>`,
    propsSchema: [
      { key: 'color', label: 'Text Color', type: 'color' },
      {
        key: 'font-family',
        label: 'Font Family',
        type: 'select',
        options: fontFamilyOptions.slice(0, 4),
      },
      { key: 'font-size', label: 'Font Size', type: 'size' },
      { key: 'line-height', label: 'Line Height', type: 'text' },
      { key: 'width', label: 'Width', type: 'size', defaultValue: '100%' },
      { key: 'padding', label: 'Padding', type: 'size' },
      { key: 'cellpadding', label: 'Cell Padding', type: 'number' },
      { key: 'cellspacing', label: 'Cell Spacing', type: 'number' },
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'border', label: 'Border', type: 'text', placeholder: '1px solid #000' },
      { key: 'container-background-color', label: 'Container Background', type: 'color' },
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
