/**
 * Component definition types
 */

import type { MJMLComponentType, DefaultChildNode } from './node';

// Component category
export type ComponentCategory = 'layout' | 'content' | 'interactive' | 'social';

// Property Schema - defines editable properties
export interface PropSchema {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'color'
    | 'select'
    | 'size'
    | 'alignment'
    | 'url'
    | 'textarea'
    | 'social-elements'
    | 'navbar-links'
    | 'accordion-elements'
    | 'carousel-images';
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string | number;
}

// Component Definition - metadata for each MJML component
export interface ComponentDefinition {
  type: MJMLComponentType;
  name: string;
  icon: string;
  category: ComponentCategory;
  canHaveChildren: boolean;
  allowedChildren?: MJMLComponentType[];
  allowedParents?: MJMLComponentType[];
  defaultProps: Record<string, string | number>;
  defaultContent?: string;
  defaultChildren?: DefaultChildNode[];
  propsSchema: PropSchema[];
}

// Component category with its components
export interface ComponentCategoryGroup {
  id: string;
  name: string;
  components: MJMLComponentType[];
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

// Predefined social platform
export interface SocialPlatform {
  name: string;
  label: string;
  color: string;
}
