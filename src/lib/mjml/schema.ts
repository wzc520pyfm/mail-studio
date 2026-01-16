import { ComponentDefinition, MJMLComponentType, SocialElement, DefaultChildNode } from '@/types/editor';

// Predefined social platforms for mj-social-element
export const predefinedSocialPlatforms: { name: string; label: string; color: string }[] = [
  { name: 'facebook', label: 'Facebook', color: '#3b5998' },
  { name: 'twitter', label: 'Twitter/X', color: '#000000' },
  { name: 'linkedin', label: 'LinkedIn', color: '#0077b5' },
  { name: 'instagram', label: 'Instagram', color: '#e4405f' },
  { name: 'youtube', label: 'YouTube', color: '#ff0000' },
  { name: 'github', label: 'GitHub', color: '#333333' },
  { name: 'pinterest', label: 'Pinterest', color: '#bd081c' },
  { name: 'snapchat', label: 'Snapchat', color: '#fffc00' },
  { name: 'tiktok', label: 'TikTok', color: '#000000' },
  { name: 'whatsapp', label: 'WhatsApp', color: '#25d366' },
  { name: 'telegram', label: 'Telegram', color: '#0088cc' },
  { name: 'discord', label: 'Discord', color: '#5865f2' },
  { name: 'web', label: 'Website', color: '#4a4a4a' },
];

// Default social elements for new mj-social components
export const defaultSocialElements: SocialElement[] = [
  { name: 'facebook', href: 'https://facebook.com' },
  { name: 'twitter', href: 'https://twitter.com' },
  { name: 'linkedin', href: 'https://linkedin.com' },
];

// Component definitions with metadata and property schemas
export const componentDefinitions: Record<MJMLComponentType, ComponentDefinition> = {
  // ==================== LAYOUT COMPONENTS ====================
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
    allowedChildren: ['mj-column', 'mj-group'],
    defaultProps: {
      'padding': '20px 0',
      'background-color': '#ffffff',
    },
    propsSchema: [
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'background-url', label: 'Background Image', type: 'url' },
      { key: 'background-repeat', label: 'Background Repeat', type: 'select', options: [
        { value: 'repeat', label: 'Repeat' },
        { value: 'no-repeat', label: 'No Repeat' },
      ]},
      { key: 'background-size', label: 'Background Size', type: 'select', options: [
        { value: 'auto', label: 'Auto' },
        { value: 'cover', label: 'Cover' },
        { value: 'contain', label: 'Contain' },
      ]},
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '20px' },
      { key: 'padding-top', label: 'Padding Top', type: 'size' },
      { key: 'padding-bottom', label: 'Padding Bottom', type: 'size' },
      { key: 'padding-left', label: 'Padding Left', type: 'size' },
      { key: 'padding-right', label: 'Padding Right', type: 'size' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      { key: 'direction', label: 'Direction', type: 'select', options: [
        { value: 'ltr', label: 'Left to Right' },
        { value: 'rtl', label: 'Right to Left' },
      ]},
      { key: 'full-width', label: 'Full Width', type: 'select', options: [
        { value: 'full-width', label: 'Full Width' },
        { value: '', label: 'Normal' },
      ]},
      { key: 'text-align', label: 'Text Align', type: 'alignment' },
    ],
  },
  'mj-column': {
    type: 'mj-column',
    name: 'Column',
    icon: 'Columns3',
    category: 'layout',
    canHaveChildren: true,
    allowedChildren: ['mj-text', 'mj-image', 'mj-button', 'mj-divider', 'mj-spacer', 'mj-social', 'mj-navbar', 'mj-accordion', 'mj-carousel', 'mj-table', 'mj-raw'],
    defaultProps: {
      'padding': '10px',
    },
    propsSchema: [
      { key: 'width', label: 'Width', type: 'size', placeholder: 'e.g., 50%, 300px' },
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '10px' },
      { key: 'padding-top', label: 'Padding Top', type: 'size' },
      { key: 'padding-bottom', label: 'Padding Bottom', type: 'size' },
      { key: 'padding-left', label: 'Padding Left', type: 'size' },
      { key: 'padding-right', label: 'Padding Right', type: 'size' },
      { key: 'border', label: 'Border', type: 'text', placeholder: '1px solid #000' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      { key: 'vertical-align', label: 'Vertical Align', type: 'select', options: [
        { value: 'top', label: 'Top' },
        { value: 'middle', label: 'Middle' },
        { value: 'bottom', label: 'Bottom' },
      ]},
    ],
  },
  'mj-group': {
    type: 'mj-group',
    name: 'Group',
    icon: 'Group',
    category: 'layout',
    canHaveChildren: true,
    allowedChildren: ['mj-column'],
    allowedParents: ['mj-section'],
    defaultProps: {
      'direction': 'ltr',
    },
    propsSchema: [
      { key: 'width', label: 'Width', type: 'size', placeholder: 'e.g., 100%, 600px' },
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'direction', label: 'Direction', type: 'select', options: [
        { value: 'ltr', label: 'Left to Right' },
        { value: 'rtl', label: 'Right to Left' },
      ]},
      { key: 'vertical-align', label: 'Vertical Align', type: 'select', options: [
        { value: 'top', label: 'Top' },
        { value: 'middle', label: 'Middle' },
        { value: 'bottom', label: 'Bottom' },
      ]},
    ],
  },
  'mj-wrapper': {
    type: 'mj-wrapper',
    name: 'Wrapper',
    icon: 'Square',
    category: 'layout',
    canHaveChildren: true,
    allowedChildren: ['mj-section', 'mj-hero'],
    defaultProps: {
      'padding': '20px 0',
      'background-color': '#f8fafc',
    },
    propsSchema: [
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'background-url', label: 'Background Image', type: 'url' },
      { key: 'background-repeat', label: 'Background Repeat', type: 'select', options: [
        { value: 'repeat', label: 'Repeat' },
        { value: 'no-repeat', label: 'No Repeat' },
      ]},
      { key: 'background-size', label: 'Background Size', type: 'select', options: [
        { value: 'auto', label: 'Auto' },
        { value: 'cover', label: 'Cover' },
        { value: 'contain', label: 'Contain' },
      ]},
      { key: 'padding', label: 'Padding', type: 'size' },
      { key: 'padding-top', label: 'Padding Top', type: 'size' },
      { key: 'padding-bottom', label: 'Padding Bottom', type: 'size' },
      { key: 'padding-left', label: 'Padding Left', type: 'size' },
      { key: 'padding-right', label: 'Padding Right', type: 'size' },
      { key: 'border', label: 'Border', type: 'text', placeholder: '1px solid #000' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      { key: 'full-width', label: 'Full Width', type: 'select', options: [
        { value: 'full-width', label: 'Full Width' },
        { value: '', label: 'Normal' },
      ]},
      { key: 'text-align', label: 'Text Align', type: 'alignment' },
    ],
  },
  'mj-hero': {
    type: 'mj-hero',
    name: 'Hero',
    icon: 'LayoutTemplate',
    category: 'layout',
    canHaveChildren: true,
    allowedChildren: ['mj-text', 'mj-image', 'mj-button', 'mj-divider', 'mj-spacer'],
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
      { key: 'width', label: 'Width', type: 'size', defaultValue: '600px' },
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'background-url', label: 'Background Image', type: 'url' },
      { key: 'background-width', label: 'Background Width', type: 'size' },
      { key: 'background-height', label: 'Background Height', type: 'size' },
      { key: 'background-position', label: 'Background Position', type: 'text', placeholder: 'center center' },
      { key: 'vertical-align', label: 'Vertical Align', type: 'select', options: [
        { value: 'top', label: 'Top' },
        { value: 'middle', label: 'Middle' },
        { value: 'bottom', label: 'Bottom' },
      ]},
      { key: 'padding', label: 'Padding', type: 'size' },
      { key: 'padding-top', label: 'Padding Top', type: 'size' },
      { key: 'padding-bottom', label: 'Padding Bottom', type: 'size' },
      { key: 'padding-left', label: 'Padding Left', type: 'size' },
      { key: 'padding-right', label: 'Padding Right', type: 'size' },
    ],
  },

  // ==================== CONTENT COMPONENTS ====================
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
      { key: 'font-style', label: 'Font Style', type: 'select', options: [
        { value: 'normal', label: 'Normal' },
        { value: 'italic', label: 'Italic' },
      ]},
      { key: 'font-family', label: 'Font Family', type: 'select', options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
        { value: 'Times New Roman, serif', label: 'Times New Roman' },
        { value: 'Courier New, monospace', label: 'Courier New' },
      ]},
      { key: 'line-height', label: 'Line Height', type: 'text', defaultValue: '1.5' },
      { key: 'letter-spacing', label: 'Letter Spacing', type: 'size' },
      { key: 'text-decoration', label: 'Text Decoration', type: 'select', options: [
        { value: 'none', label: 'None' },
        { value: 'underline', label: 'Underline' },
        { value: 'line-through', label: 'Line Through' },
      ]},
      { key: 'text-transform', label: 'Text Transform', type: 'select', options: [
        { value: 'none', label: 'None' },
        { value: 'uppercase', label: 'Uppercase' },
        { value: 'lowercase', label: 'Lowercase' },
        { value: 'capitalize', label: 'Capitalize' },
      ]},
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
      'src': 'https://placehold.co/600x300/e2e8f0/64748b?text=Image',
      'alt': 'Image description',
      'padding': '10px 25px',
      'width': '100%',
    },
    propsSchema: [
      { key: 'src', label: 'Image URL', type: 'url', placeholder: 'https://example.com/image.jpg' },
      { key: 'alt', label: 'Alt Text', type: 'text', placeholder: 'Image description' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'href', label: 'Link URL', type: 'url', placeholder: 'https://example.com' },
      { key: 'target', label: 'Link Target', type: 'select', options: [
        { value: '_self', label: 'Same Window' },
        { value: '_blank', label: 'New Window' },
      ]},
      { key: 'width', label: 'Width', type: 'size', defaultValue: '100%' },
      { key: 'height', label: 'Height', type: 'size', placeholder: 'auto' },
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '10px 25px' },
      { key: 'border', label: 'Border', type: 'text', placeholder: '1px solid #000' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      { key: 'fluid-on-mobile', label: 'Fluid on Mobile', type: 'select', options: [
        { value: 'true', label: 'Yes' },
        { value: '', label: 'No' },
      ]},
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
        { value: 'double', label: 'Double' },
      ]},
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
      'height': '30px',
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
      'padding': '10px 25px',
      'width': '100%',
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
      { key: 'font-family', label: 'Font Family', type: 'select', options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
      ]},
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

  // ==================== INTERACTIVE COMPONENTS ====================
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
      { key: 'target', label: 'Link Target', type: 'select', options: [
        { value: '_self', label: 'Same Window' },
        { value: '_blank', label: 'New Window' },
      ]},
      { key: 'background-color', label: 'Background', type: 'color', defaultValue: '#2563eb' },
      { key: 'color', label: 'Text Color', type: 'color', defaultValue: '#ffffff' },
      { key: 'font-size', label: 'Font Size', type: 'size', defaultValue: '16px' },
      { key: 'font-weight', label: 'Font Weight', type: 'select', options: [
        { value: 'normal', label: 'Normal' },
        { value: 'bold', label: 'Bold' },
      ]},
      { key: 'font-family', label: 'Font Family', type: 'select', options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
      ]},
      { key: 'border', label: 'Border', type: 'text', placeholder: '1px solid #000' },
      { key: 'border-radius', label: 'Border Radius', type: 'size', defaultValue: '6px' },
      { key: 'inner-padding', label: 'Inner Padding', type: 'size', defaultValue: '15px 30px' },
      { key: 'padding', label: 'Outer Padding', type: 'size' },
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'width', label: 'Width', type: 'size', placeholder: 'auto or px' },
      { key: 'height', label: 'Height', type: 'size' },
      { key: 'vertical-align', label: 'Vertical Align', type: 'select', options: [
        { value: 'top', label: 'Top' },
        { value: 'middle', label: 'Middle' },
        { value: 'bottom', label: 'Bottom' },
      ]},
      { key: 'text-align', label: 'Text Align', type: 'alignment' },
      { key: 'text-decoration', label: 'Text Decoration', type: 'select', options: [
        { value: 'none', label: 'None' },
        { value: 'underline', label: 'Underline' },
      ]},
      { key: 'text-transform', label: 'Text Transform', type: 'select', options: [
        { value: 'none', label: 'None' },
        { value: 'uppercase', label: 'Uppercase' },
        { value: 'capitalize', label: 'Capitalize' },
      ]},
    ],
  },
  'mj-navbar': {
    type: 'mj-navbar',
    name: 'Navbar',
    icon: 'Menu',
    category: 'interactive',
    canHaveChildren: true,
    allowedChildren: ['mj-navbar-link'],
    defaultProps: {
      'hamburger': 'hamburger',
      'ico-color': '#000000',
      'ico-font-size': '30px',
    },
    defaultChildren: [
      { type: 'mj-navbar-link', props: { href: '#', color: '#333333' }, content: 'Home' },
      { type: 'mj-navbar-link', props: { href: '#', color: '#333333' }, content: 'About' },
      { type: 'mj-navbar-link', props: { href: '#', color: '#333333' }, content: 'Contact' },
    ],
    propsSchema: [
      { key: 'base-url', label: 'Base URL', type: 'url', placeholder: 'https://example.com' },
      { key: 'hamburger', label: 'Hamburger Mode', type: 'select', options: [
        { value: 'hamburger', label: 'Show Hamburger' },
        { value: '', label: 'No Hamburger' },
      ]},
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'ico-align', label: 'Icon Alignment', type: 'alignment' },
      { key: 'ico-color', label: 'Icon Color', type: 'color' },
      { key: 'ico-font-size', label: 'Icon Size', type: 'size' },
      { key: 'ico-padding', label: 'Icon Padding', type: 'size' },
      { key: 'ico-padding-top', label: 'Icon Padding Top', type: 'size' },
      { key: 'ico-padding-bottom', label: 'Icon Padding Bottom', type: 'size' },
      { key: 'ico-padding-left', label: 'Icon Padding Left', type: 'size' },
      { key: 'ico-padding-right', label: 'Icon Padding Right', type: 'size' },
    ],
  },
  'mj-navbar-link': {
    type: 'mj-navbar-link',
    name: 'Navbar Link',
    icon: 'Link',
    category: 'interactive',
    canHaveChildren: false,
    allowedParents: ['mj-navbar'],
    defaultProps: {
      'href': '#',
      'color': '#333333',
      'font-size': '14px',
      'padding': '15px 10px',
    },
    defaultContent: 'Link',
    propsSchema: [
      { key: 'href', label: 'Link URL', type: 'url', placeholder: 'https://example.com' },
      { key: 'target', label: 'Link Target', type: 'select', options: [
        { value: '_self', label: 'Same Window' },
        { value: '_blank', label: 'New Window' },
      ]},
      { key: 'color', label: 'Text Color', type: 'color' },
      { key: 'font-family', label: 'Font Family', type: 'select', options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
      ]},
      { key: 'font-size', label: 'Font Size', type: 'size' },
      { key: 'font-weight', label: 'Font Weight', type: 'select', options: [
        { value: 'normal', label: 'Normal' },
        { value: 'bold', label: 'Bold' },
      ]},
      { key: 'text-decoration', label: 'Text Decoration', type: 'select', options: [
        { value: 'none', label: 'None' },
        { value: 'underline', label: 'Underline' },
      ]},
      { key: 'text-transform', label: 'Text Transform', type: 'select', options: [
        { value: 'none', label: 'None' },
        { value: 'uppercase', label: 'Uppercase' },
        { value: 'capitalize', label: 'Capitalize' },
      ]},
      { key: 'padding', label: 'Padding', type: 'size' },
      { key: 'padding-top', label: 'Padding Top', type: 'size' },
      { key: 'padding-bottom', label: 'Padding Bottom', type: 'size' },
      { key: 'padding-left', label: 'Padding Left', type: 'size' },
      { key: 'padding-right', label: 'Padding Right', type: 'size' },
    ],
  },
  'mj-accordion': {
    type: 'mj-accordion',
    name: 'Accordion',
    icon: 'ChevronDown',
    category: 'interactive',
    canHaveChildren: true,
    allowedChildren: ['mj-accordion-element'],
    defaultProps: {
      'border': '1px solid #e2e8f0',
      'padding': '10px 25px',
    },
    defaultChildren: [
      {
        type: 'mj-accordion-element',
        props: {},
        children: [
          { type: 'mj-accordion-title', props: { 'background-color': '#f8fafc', padding: '15px' }, content: 'Accordion Title 1' },
          { type: 'mj-accordion-text', props: { 'background-color': '#ffffff', padding: '15px' }, content: 'This is the content of the first accordion item.' },
        ],
      },
      {
        type: 'mj-accordion-element',
        props: {},
        children: [
          { type: 'mj-accordion-title', props: { 'background-color': '#f8fafc', padding: '15px' }, content: 'Accordion Title 2' },
          { type: 'mj-accordion-text', props: { 'background-color': '#ffffff', padding: '15px' }, content: 'This is the content of the second accordion item.' },
        ],
      },
    ],
    propsSchema: [
      { key: 'border', label: 'Border', type: 'text', placeholder: '1px solid #000' },
      { key: 'font-family', label: 'Font Family', type: 'select', options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
      ]},
      { key: 'icon-align', label: 'Icon Alignment', type: 'alignment' },
      { key: 'icon-height', label: 'Icon Height', type: 'size' },
      { key: 'icon-width', label: 'Icon Width', type: 'size' },
      { key: 'icon-position', label: 'Icon Position', type: 'select', options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ]},
      { key: 'icon-wrapped-url', label: 'Wrapped Icon URL', type: 'url' },
      { key: 'icon-unwrapped-url', label: 'Unwrapped Icon URL', type: 'url' },
      { key: 'padding', label: 'Padding', type: 'size' },
      { key: 'padding-top', label: 'Padding Top', type: 'size' },
      { key: 'padding-bottom', label: 'Padding Bottom', type: 'size' },
      { key: 'padding-left', label: 'Padding Left', type: 'size' },
      { key: 'padding-right', label: 'Padding Right', type: 'size' },
    ],
  },
  'mj-accordion-element': {
    type: 'mj-accordion-element',
    name: 'Accordion Element',
    icon: 'ChevronRight',
    category: 'interactive',
    canHaveChildren: true,
    allowedChildren: ['mj-accordion-title', 'mj-accordion-text'],
    allowedParents: ['mj-accordion'],
    defaultProps: {},
    propsSchema: [
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'font-family', label: 'Font Family', type: 'select', options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
      ]},
      { key: 'icon-align', label: 'Icon Alignment', type: 'alignment' },
      { key: 'icon-height', label: 'Icon Height', type: 'size' },
      { key: 'icon-width', label: 'Icon Width', type: 'size' },
      { key: 'icon-position', label: 'Icon Position', type: 'select', options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ]},
      { key: 'icon-wrapped-url', label: 'Wrapped Icon URL', type: 'url' },
      { key: 'icon-unwrapped-url', label: 'Unwrapped Icon URL', type: 'url' },
    ],
  },
  'mj-accordion-title': {
    type: 'mj-accordion-title',
    name: 'Accordion Title',
    icon: 'Heading',
    category: 'interactive',
    canHaveChildren: false,
    allowedParents: ['mj-accordion-element'],
    defaultProps: {
      'background-color': '#f8fafc',
      'padding': '15px',
      'color': '#333333',
      'font-size': '16px',
    },
    defaultContent: 'Accordion Title',
    propsSchema: [
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'color', label: 'Text Color', type: 'color' },
      { key: 'font-family', label: 'Font Family', type: 'select', options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
      ]},
      { key: 'font-size', label: 'Font Size', type: 'size' },
      { key: 'padding', label: 'Padding', type: 'size' },
      { key: 'padding-top', label: 'Padding Top', type: 'size' },
      { key: 'padding-bottom', label: 'Padding Bottom', type: 'size' },
      { key: 'padding-left', label: 'Padding Left', type: 'size' },
      { key: 'padding-right', label: 'Padding Right', type: 'size' },
    ],
  },
  'mj-accordion-text': {
    type: 'mj-accordion-text',
    name: 'Accordion Text',
    icon: 'Text',
    category: 'interactive',
    canHaveChildren: false,
    allowedParents: ['mj-accordion-element'],
    defaultProps: {
      'background-color': '#ffffff',
      'padding': '15px',
      'color': '#333333',
      'font-size': '14px',
    },
    defaultContent: 'Accordion content goes here.',
    propsSchema: [
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'color', label: 'Text Color', type: 'color' },
      { key: 'font-family', label: 'Font Family', type: 'select', options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
      ]},
      { key: 'font-size', label: 'Font Size', type: 'size' },
      { key: 'line-height', label: 'Line Height', type: 'text' },
      { key: 'padding', label: 'Padding', type: 'size' },
      { key: 'padding-top', label: 'Padding Top', type: 'size' },
      { key: 'padding-bottom', label: 'Padding Bottom', type: 'size' },
      { key: 'padding-left', label: 'Padding Left', type: 'size' },
      { key: 'padding-right', label: 'Padding Right', type: 'size' },
    ],
  },
  'mj-carousel': {
    type: 'mj-carousel',
    name: 'Carousel',
    icon: 'GalleryHorizontal',
    category: 'interactive',
    canHaveChildren: true,
    allowedChildren: ['mj-carousel-image'],
    defaultProps: {
      'align': 'center',
      'border-radius': '0px',
      'icon-width': '44px',
    },
    defaultChildren: [
      { type: 'mj-carousel-image', props: { src: 'https://placehold.co/600x300/3b82f6/ffffff?text=Slide+1', alt: 'Slide 1' } },
      { type: 'mj-carousel-image', props: { src: 'https://placehold.co/600x300/10b981/ffffff?text=Slide+2', alt: 'Slide 2' } },
      { type: 'mj-carousel-image', props: { src: 'https://placehold.co/600x300/f59e0b/ffffff?text=Slide+3', alt: 'Slide 3' } },
    ],
    propsSchema: [
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      { key: 'icon-width', label: 'Icon Width', type: 'size' },
      { key: 'left-icon', label: 'Left Icon URL', type: 'url' },
      { key: 'right-icon', label: 'Right Icon URL', type: 'url' },
      { key: 'thumbnails', label: 'Show Thumbnails', type: 'select', options: [
        { value: 'visible', label: 'Visible' },
        { value: 'hidden', label: 'Hidden' },
      ]},
      { key: 'tb-border', label: 'Thumbnail Border', type: 'text' },
      { key: 'tb-border-radius', label: 'Thumbnail Border Radius', type: 'size' },
      { key: 'tb-hover-border-color', label: 'Thumbnail Hover Border', type: 'color' },
      { key: 'tb-selected-border-color', label: 'Thumbnail Selected Border', type: 'color' },
      { key: 'tb-width', label: 'Thumbnail Width', type: 'size' },
    ],
  },
  'mj-carousel-image': {
    type: 'mj-carousel-image',
    name: 'Carousel Image',
    icon: 'ImagePlus',
    category: 'interactive',
    canHaveChildren: false,
    allowedParents: ['mj-carousel'],
    defaultProps: {
      'src': 'https://placehold.co/600x300/e2e8f0/64748b?text=Slide',
      'alt': 'Carousel slide',
    },
    propsSchema: [
      { key: 'src', label: 'Image URL', type: 'url', placeholder: 'https://example.com/image.jpg' },
      { key: 'alt', label: 'Alt Text', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'href', label: 'Link URL', type: 'url' },
      { key: 'target', label: 'Link Target', type: 'select', options: [
        { value: '_self', label: 'Same Window' },
        { value: '_blank', label: 'New Window' },
      ]},
      { key: 'thumbnails-src', label: 'Thumbnail URL', type: 'url' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
    ],
  },

  // ==================== SOCIAL COMPONENTS ====================
  'mj-social': {
    type: 'mj-social',
    name: 'Social',
    icon: 'Share2',
    category: 'social',
    canHaveChildren: true,
    allowedChildren: ['mj-social-element'],
    defaultProps: {
      'mode': 'horizontal',
      'padding': '10px 25px',
      'icon-size': '20px',
    },
    defaultChildren: [
      { type: 'mj-social-element', props: { name: 'facebook', href: 'https://facebook.com' } },
      { type: 'mj-social-element', props: { name: 'twitter', href: 'https://twitter.com' } },
      { type: 'mj-social-element', props: { name: 'linkedin', href: 'https://linkedin.com' } },
    ],
    propsSchema: [
      { key: 'mode', label: 'Mode', type: 'select', options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ]},
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      { key: 'color', label: 'Text Color', type: 'color' },
      { key: 'font-family', label: 'Font Family', type: 'select', options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
      ]},
      { key: 'font-size', label: 'Font Size', type: 'size' },
      { key: 'icon-size', label: 'Icon Size', type: 'size' },
      { key: 'icon-height', label: 'Icon Height', type: 'size' },
      { key: 'icon-padding', label: 'Icon Padding', type: 'size' },
      { key: 'inner-padding', label: 'Inner Padding', type: 'size' },
      { key: 'line-height', label: 'Line Height', type: 'text' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: '10px 25px' },
      { key: 'padding-top', label: 'Padding Top', type: 'size' },
      { key: 'padding-bottom', label: 'Padding Bottom', type: 'size' },
      { key: 'padding-left', label: 'Padding Left', type: 'size' },
      { key: 'padding-right', label: 'Padding Right', type: 'size' },
      { key: 'text-padding', label: 'Text Padding', type: 'size' },
      { key: 'text-decoration', label: 'Text Decoration', type: 'select', options: [
        { value: 'none', label: 'None' },
        { value: 'underline', label: 'Underline' },
      ]},
    ],
  },
  'mj-social-element': {
    type: 'mj-social-element',
    name: 'Social Link',
    icon: 'ExternalLink',
    category: 'social',
    canHaveChildren: false,
    allowedParents: ['mj-social'],
    defaultProps: {
      'name': 'facebook',
      'href': '#',
    },
    propsSchema: [
      { key: 'name', label: 'Platform', type: 'select', options: [
        { value: 'facebook', label: 'Facebook' },
        { value: 'twitter', label: 'Twitter/X' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'youtube', label: 'YouTube' },
        { value: 'github', label: 'GitHub' },
        { value: 'pinterest', label: 'Pinterest' },
        { value: 'snapchat', label: 'Snapchat' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'telegram', label: 'Telegram' },
        { value: 'discord', label: 'Discord' },
        { value: 'web', label: 'Website' },
      ]},
      { key: 'href', label: 'Link URL', type: 'url', placeholder: 'https://example.com' },
      { key: 'target', label: 'Link Target', type: 'select', options: [
        { value: '_self', label: 'Same Window' },
        { value: '_blank', label: 'New Window' },
      ]},
      { key: 'src', label: 'Custom Icon URL', type: 'url', placeholder: 'Custom icon (optional)' },
      { key: 'alt', label: 'Alt Text', type: 'text' },
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      { key: 'color', label: 'Text Color', type: 'color' },
      { key: 'font-family', label: 'Font Family', type: 'select', options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
      ]},
      { key: 'font-size', label: 'Font Size', type: 'size' },
      { key: 'icon-size', label: 'Icon Size', type: 'size' },
      { key: 'icon-height', label: 'Icon Height', type: 'size' },
      { key: 'padding', label: 'Padding', type: 'size' },
      { key: 'text-padding', label: 'Text Padding', type: 'size' },
    ],
  },
};

// Get component categories for sidebar
export const componentCategories = [
  {
    id: 'layout',
    name: 'Layout',
    components: ['mj-section', 'mj-column', 'mj-group', 'mj-wrapper', 'mj-hero'] as MJMLComponentType[],
  },
  {
    id: 'content',
    name: 'Content',
    components: ['mj-text', 'mj-image', 'mj-table', 'mj-divider', 'mj-spacer', 'mj-raw'] as MJMLComponentType[],
  },
  {
    id: 'interactive',
    name: 'Interactive',
    components: ['mj-button', 'mj-navbar', 'mj-accordion', 'mj-carousel'] as MJMLComponentType[],
  },
  {
    id: 'social',
    name: 'Social',
    components: ['mj-social'] as MJMLComponentType[],
  },
];

// Helper to create a new node with defaults, including default children
export function createNode(type: MJMLComponentType, overrides?: Partial<EditorNode>): EditorNode {
  const def = componentDefinitions[type];
  
  // Create default children if defined
  let children: EditorNode[] | undefined;
  if (def.canHaveChildren) {
    if (def.defaultChildren && def.defaultChildren.length > 0) {
      children = def.defaultChildren.map((childDef) => createNodeFromDefinition(childDef));
    } else {
      children = [];
    }
  }
  
  return {
    id: generateId(),
    type,
    props: { ...def.defaultProps },
    content: def.defaultContent,
    children,
    ...overrides,
  };
}

// Helper to create a node from a default child definition (for default children)
function createNodeFromDefinition(def: DefaultChildNode): EditorNode {
  const componentDef = componentDefinitions[def.type];
  return {
    id: generateId(),
    type: def.type,
    props: { ...componentDef?.defaultProps, ...def.props },
    content: def.content ?? componentDef?.defaultContent,
    children: def.children ? def.children.map(createNodeFromDefinition) : (componentDef?.canHaveChildren ? [] : undefined),
  };
}

// Generate unique ID
export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Import EditorNode type
import { EditorNode } from '@/types/editor';
