/**
 * Centralized type exports for the editor feature
 */

// Node types
export type {
  MJMLComponentType,
  EditorNode,
  DefaultChildNode,
  FontDefinition,
  HeadSettings,
  Template,
} from "./node";

// Component types
export type {
  ComponentCategory,
  PropSchema,
  ComponentDefinition,
  ComponentCategoryGroup,
  SocialElement,
  NavbarLink,
  AccordionElement,
  CarouselImage,
  SocialPlatform,
} from "./component";

// Layout types
export type { LayoutRegion, LayoutFixedRegion, LayoutSlotRegion, EmailLayout } from "./layout";

// UI types
export type { EditorMode, PreviewMode, SidebarTab, DragItem } from "./ui";
