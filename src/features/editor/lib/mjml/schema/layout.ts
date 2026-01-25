/**
 * Layout component definitions (mj-body, mj-section, mj-column, mj-group, mj-wrapper, mj-hero)
 */

import type { ComponentDefinition } from "@/features/editor/types";

export const layoutComponents: Record<string, ComponentDefinition> = {
  "mj-body": {
    type: "mj-body",
    name: "Body",
    icon: "FileText",
    category: "layout",
    canHaveChildren: true,
    allowedChildren: ["mj-section", "mj-wrapper", "mj-hero", "mj-raw"],
    defaultProps: {
      "background-color": "#f4f4f4",
      width: "600px",
    },
    propsSchema: [
      { key: "background-color", label: "Background", type: "color" },
      { key: "width", label: "Width", type: "size", defaultValue: "600px" },
    ],
  },

  "mj-section": {
    type: "mj-section",
    name: "Section",
    icon: "Rows3",
    category: "layout",
    canHaveChildren: true,
    allowedChildren: ["mj-column", "mj-group"],
    defaultProps: {
      padding: "20px 0",
    },
    propsSchema: [
      { key: "background-color", label: "Background", type: "color" },
      { key: "background-url", label: "Background Image", type: "url" },
      {
        key: "background-repeat",
        label: "Background Repeat",
        type: "select",
        options: [
          { value: "repeat", label: "Repeat" },
          { value: "no-repeat", label: "No Repeat" },
        ],
      },
      {
        key: "background-size",
        label: "Background Size",
        type: "select",
        options: [
          { value: "auto", label: "Auto" },
          { value: "cover", label: "Cover" },
          { value: "contain", label: "Contain" },
        ],
      },
      { key: "padding", label: "Padding", type: "size", defaultValue: "20px" },
      { key: "padding-top", label: "Padding Top", type: "size" },
      { key: "padding-bottom", label: "Padding Bottom", type: "size" },
      { key: "padding-left", label: "Padding Left", type: "size" },
      { key: "padding-right", label: "Padding Right", type: "size" },
      { key: "border-radius", label: "Border Radius", type: "size" },
      {
        key: "direction",
        label: "Direction",
        type: "select",
        options: [
          { value: "ltr", label: "Left to Right" },
          { value: "rtl", label: "Right to Left" },
        ],
      },
      {
        key: "full-width",
        label: "Full Width",
        type: "select",
        options: [
          { value: "full-width", label: "Full Width" },
          { value: "", label: "Normal" },
        ],
      },
      { key: "text-align", label: "Text Align", type: "alignment" },
    ],
  },

  "mj-column": {
    type: "mj-column",
    name: "Column",
    icon: "Columns3",
    category: "layout",
    canHaveChildren: true,
    allowedChildren: [
      "mj-text",
      "mj-image",
      "mj-button",
      "mj-divider",
      "mj-spacer",
      "mj-social",
      "mj-navbar",
      "mj-accordion",
      "mj-carousel",
      "mj-table",
      "mj-raw",
    ],
    defaultProps: {},
    propsSchema: [
      { key: "width", label: "Width", type: "size", placeholder: "e.g., 50%, 300px" },
      { key: "background-color", label: "Background", type: "color" },
      { key: "padding", label: "Padding", type: "size" },
      { key: "padding-top", label: "Padding Top", type: "size" },
      { key: "padding-bottom", label: "Padding Bottom", type: "size" },
      { key: "padding-left", label: "Padding Left", type: "size" },
      { key: "padding-right", label: "Padding Right", type: "size" },
      { key: "border", label: "Border", type: "text", placeholder: "1px solid #000" },
      { key: "border-radius", label: "Border Radius", type: "size" },
      {
        key: "vertical-align",
        label: "Vertical Align",
        type: "select",
        options: [
          { value: "top", label: "Top" },
          { value: "middle", label: "Middle" },
          { value: "bottom", label: "Bottom" },
        ],
      },
    ],
  },

  "mj-group": {
    type: "mj-group",
    name: "Group",
    icon: "Group",
    category: "layout",
    canHaveChildren: true,
    allowedChildren: ["mj-column"],
    allowedParents: ["mj-section"],
    defaultProps: {
      direction: "ltr",
    },
    propsSchema: [
      { key: "width", label: "Width", type: "size", placeholder: "e.g., 100%, 600px" },
      { key: "background-color", label: "Background", type: "color" },
      {
        key: "direction",
        label: "Direction",
        type: "select",
        options: [
          { value: "ltr", label: "Left to Right" },
          { value: "rtl", label: "Right to Left" },
        ],
      },
      {
        key: "vertical-align",
        label: "Vertical Align",
        type: "select",
        options: [
          { value: "top", label: "Top" },
          { value: "middle", label: "Middle" },
          { value: "bottom", label: "Bottom" },
        ],
      },
    ],
  },

  "mj-wrapper": {
    type: "mj-wrapper",
    name: "Wrapper",
    icon: "Square",
    category: "layout",
    canHaveChildren: true,
    allowedChildren: ["mj-section", "mj-hero"],
    defaultProps: {
      padding: "20px 0",
    },
    propsSchema: [
      { key: "background-color", label: "Background", type: "color" },
      { key: "background-url", label: "Background Image", type: "url" },
      {
        key: "background-repeat",
        label: "Background Repeat",
        type: "select",
        options: [
          { value: "repeat", label: "Repeat" },
          { value: "no-repeat", label: "No Repeat" },
        ],
      },
      {
        key: "background-size",
        label: "Background Size",
        type: "select",
        options: [
          { value: "auto", label: "Auto" },
          { value: "cover", label: "Cover" },
          { value: "contain", label: "Contain" },
        ],
      },
      { key: "padding", label: "Padding", type: "size" },
      { key: "padding-top", label: "Padding Top", type: "size" },
      { key: "padding-bottom", label: "Padding Bottom", type: "size" },
      { key: "padding-left", label: "Padding Left", type: "size" },
      { key: "padding-right", label: "Padding Right", type: "size" },
      { key: "border", label: "Border", type: "text", placeholder: "1px solid #000" },
      { key: "border-radius", label: "Border Radius", type: "size" },
      {
        key: "full-width",
        label: "Full Width",
        type: "select",
        options: [
          { value: "full-width", label: "Full Width" },
          { value: "", label: "Normal" },
        ],
      },
      { key: "text-align", label: "Text Align", type: "alignment" },
    ],
  },

  "mj-hero": {
    type: "mj-hero",
    name: "Hero",
    icon: "LayoutTemplate",
    category: "layout",
    canHaveChildren: true,
    allowedChildren: ["mj-text", "mj-image", "mj-button", "mj-divider", "mj-spacer"],
    defaultProps: {
      mode: "fluid-height",
      "background-color": "#ffffff",
      padding: "0px",
    },
    propsSchema: [
      {
        key: "mode",
        label: "Mode",
        type: "select",
        options: [
          { value: "fixed-height", label: "Fixed Height" },
          { value: "fluid-height", label: "Fluid Height" },
        ],
      },
      { key: "height", label: "Height", type: "size", defaultValue: "0px" },
      { key: "width", label: "Width", type: "size", defaultValue: "600px" },
      { key: "background-color", label: "Background", type: "color" },
      { key: "background-url", label: "Background Image", type: "url" },
      { key: "background-width", label: "Background Width", type: "size" },
      { key: "background-height", label: "Background Height", type: "size" },
      {
        key: "background-position",
        label: "Background Position",
        type: "text",
        placeholder: "center center",
      },
      {
        key: "vertical-align",
        label: "Vertical Align",
        type: "select",
        options: [
          { value: "top", label: "Top" },
          { value: "middle", label: "Middle" },
          { value: "bottom", label: "Bottom" },
        ],
      },
      { key: "padding", label: "Padding", type: "size" },
      { key: "padding-top", label: "Padding Top", type: "size" },
      { key: "padding-bottom", label: "Padding Bottom", type: "size" },
      { key: "padding-left", label: "Padding Left", type: "size" },
      { key: "padding-right", label: "Padding Right", type: "size" },
    ],
  },
};
