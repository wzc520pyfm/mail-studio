/**
 * MJML Schema - Component definitions and utilities
 */

import type {
  MJMLComponentType,
  EditorNode,
  DefaultChildNode,
  ComponentDefinition,
  ComponentCategoryGroup,
} from "@/features/editor/types";

import { layoutComponents } from "./layout";
import { contentComponents } from "./content";
import { interactiveComponents } from "./interactive";
import { socialComponents, predefinedSocialPlatforms, defaultSocialElements } from "./social";

// Re-export social utilities
export { predefinedSocialPlatforms, defaultSocialElements };

// Merge all component definitions
export const componentDefinitions: Record<MJMLComponentType, ComponentDefinition> = {
  ...layoutComponents,
  ...contentComponents,
  ...interactiveComponents,
  ...socialComponents,
} as Record<MJMLComponentType, ComponentDefinition>;

// Get component categories for sidebar
export const componentCategories: ComponentCategoryGroup[] = [
  {
    id: "layout",
    name: "Layout",
    components: ["mj-section", "mj-column", "mj-group", "mj-wrapper", "mj-hero"],
  },
  {
    id: "content",
    name: "Content",
    components: ["mj-text", "mj-image", "mj-table", "mj-divider", "mj-spacer", "mj-raw"],
  },
  {
    id: "interactive",
    name: "Interactive",
    components: ["mj-button", "mj-navbar", "mj-accordion", "mj-carousel"],
  },
  {
    id: "social",
    name: "Social",
    components: ["mj-social"],
  },
];

// Generate unique ID
export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to create a node from a default child definition (for default children)
function createNodeFromDefinition(def: DefaultChildNode): EditorNode {
  const componentDef = componentDefinitions[def.type];
  return {
    id: generateId(),
    type: def.type,
    props: { ...componentDef?.defaultProps, ...def.props },
    content: def.content ?? componentDef?.defaultContent,
    children: def.children
      ? def.children.map(createNodeFromDefinition)
      : componentDef?.canHaveChildren
        ? []
        : undefined,
  };
}

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

// Get allowed children types for a component
export function getAllowedChildren(type: MJMLComponentType): MJMLComponentType[] {
  return componentDefinitions[type]?.allowedChildren || [];
}

// Check if a component can contain another component
export function canContain(parentType: MJMLComponentType, childType: MJMLComponentType): boolean {
  const parentDef = componentDefinitions[parentType];
  if (!parentDef?.allowedChildren) return false;
  return parentDef.allowedChildren.includes(childType);
}

// Get component definition
export function getComponentDefinition(type: MJMLComponentType): ComponentDefinition | undefined {
  return componentDefinitions[type];
}
