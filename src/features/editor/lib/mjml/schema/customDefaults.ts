/**
 * Custom Default Values Configuration
 *
 * These defaults override MJML's default values when creating new components.
 * Priority order (highest to lowest):
 * 1. User-set props (from properties panel)
 * 2. Custom defaults (defined here)
 * 3. MJML defaults (fallback values in components)
 *
 * Example usage:
 * - To make all new buttons have a blue background:
 *   "mj-button": { "background-color": "#2563eb" }
 * - To make all new text use a specific font:
 *   "mj-text": { "font-family": "Helvetica, Arial, sans-serif" }
 */

import type { MJMLComponentType } from "@/features/editor/types";

// Custom default values that override MJML defaults
export const customDefaults: Partial<Record<MJMLComponentType, Record<string, unknown>>> = {
  // Example configurations (uncomment and modify as needed):

  // "mj-text": {
  // },

  "mj-button": {
    "background-color": "#000000",
    color: "#ffffff",
    "font-weight": "500",
    "border-radius": "50px",
  },

  "mj-section": {
    "background-color": "#ffffff",
  },

  // "mj-column": {
  // },

  "mj-divider": {
    "border-color": "#e2e8f0",
    "border-width": "1px",
    "border-style": "solid",
    width: "100%",
  },

  "mj-spacer": {
    height: "30px",
  },

  // "mj-image": {
  // },
};

// Helper to get custom defaults for a component type
export function getCustomDefaults(type: MJMLComponentType): Record<string, unknown> {
  return customDefaults[type] || {};
}

// Helper to merge custom defaults with MJML defaults
// Custom defaults take precedence over MJML defaults
export function mergeWithCustomDefaults(
  type: MJMLComponentType,
  mjmlDefaults: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...mjmlDefaults,
    ...getCustomDefaults(type),
  };
}

/**
 * Get a prop value with proper fallback priority:
 * 1. User-set prop value (from node.props)
 * 2. Custom default value (from customDefaults)
 * 3. MJML default value (fallback)
 *
 * @param type - The MJML component type
 * @param props - The node's props object
 * @param propKey - The property key to look up
 * @param mjmlDefault - The MJML default value (fallback)
 * @returns The resolved prop value
 *
 * @example
 * const bgColor = getPropWithDefaults("mj-button", node.props, "background-color", "#414141");
 */
export function getPropWithDefaults<T>(
  type: MJMLComponentType,
  props: Record<string, unknown>,
  propKey: string,
  mjmlDefault: T
): T {
  // Priority 1: User-set prop value
  if (props[propKey] !== undefined && props[propKey] !== null && props[propKey] !== "") {
    return props[propKey] as T;
  }

  // Priority 2: Custom default value
  const custom = customDefaults[type];
  if (custom && custom[propKey] !== undefined) {
    return custom[propKey] as T;
  }

  // Priority 3: MJML default value
  return mjmlDefault;
}
