/**
 * Social component definitions (mj-social, mj-social-element)
 */

import type { ComponentDefinition, SocialPlatform, SocialElement } from '@/features/editor/types';

// Font family options
const fontFamilyOptions = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
];

// Predefined social platforms for mj-social-element
export const predefinedSocialPlatforms: SocialPlatform[] = [
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

// Social platform options for select field
const socialPlatformOptions = predefinedSocialPlatforms.map((p) => ({
  value: p.name,
  label: p.label,
}));

export const socialComponents: Record<string, ComponentDefinition> = {
  'mj-social': {
    type: 'mj-social',
    name: 'Social',
    icon: 'Share2',
    category: 'social',
    canHaveChildren: true,
    allowedChildren: ['mj-social-element'],
    defaultProps: {
      mode: 'horizontal',
      padding: '10px 25px',
      'icon-size': '20px',
    },
    defaultChildren: [
      { type: 'mj-social-element', props: { name: 'facebook', href: 'https://facebook.com' } },
      { type: 'mj-social-element', props: { name: 'twitter', href: 'https://twitter.com' } },
      { type: 'mj-social-element', props: { name: 'linkedin', href: 'https://linkedin.com' } },
    ],
    propsSchema: [
      {
        key: 'mode',
        label: 'Mode',
        type: 'select',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
        ],
      },
      { key: 'align', label: 'Alignment', type: 'alignment' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      { key: 'color', label: 'Text Color', type: 'color' },
      { key: 'font-family', label: 'Font Family', type: 'select', options: fontFamilyOptions },
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
      {
        key: 'text-decoration',
        label: 'Text Decoration',
        type: 'select',
        options: [
          { value: 'none', label: 'None' },
          { value: 'underline', label: 'Underline' },
        ],
      },
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
      name: 'facebook',
      href: '#',
    },
    propsSchema: [
      { key: 'name', label: 'Platform', type: 'select', options: socialPlatformOptions },
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
      { key: 'src', label: 'Custom Icon URL', type: 'url', placeholder: 'Custom icon (optional)' },
      { key: 'alt', label: 'Alt Text', type: 'text' },
      { key: 'background-color', label: 'Background', type: 'color' },
      { key: 'border-radius', label: 'Border Radius', type: 'size' },
      { key: 'color', label: 'Text Color', type: 'color' },
      { key: 'font-family', label: 'Font Family', type: 'select', options: fontFamilyOptions },
      { key: 'font-size', label: 'Font Size', type: 'size' },
      { key: 'icon-size', label: 'Icon Size', type: 'size' },
      { key: 'icon-height', label: 'Icon Height', type: 'size' },
      { key: 'padding', label: 'Padding', type: 'size' },
      { key: 'text-padding', label: 'Text Padding', type: 'size' },
    ],
  },
};
