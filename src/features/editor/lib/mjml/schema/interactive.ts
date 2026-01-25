/**
 * Interactive component definitions (mj-button, mj-navbar, mj-accordion, mj-carousel)
 */

import type { ComponentDefinition } from "@/features/editor/types";

// Shared font family options
const fontFamilyOptions = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Verdana, sans-serif", label: "Verdana" },
];

export const interactiveComponents: Record<string, ComponentDefinition> = {
  "mj-button": {
    type: "mj-button",
    name: "Button",
    icon: "MousePointerClick",
    category: "interactive",
    canHaveChildren: false,
    defaultProps: {
      "background-color": "#414141",
      color: "#ffffff",
      "font-size": "13px",
      "font-weight": "normal",
      "inner-padding": "10px 25px",
      padding: "10px 25px",
      "border-radius": "3px",
    },
    defaultContent: "Click me",
    propsSchema: [
      { key: "href", label: "Link URL", type: "url", placeholder: "https://example.com" },
      {
        key: "target",
        label: "Link Target",
        type: "select",
        options: [
          { value: "_self", label: "Same Window" },
          { value: "_blank", label: "New Window" },
        ],
      },
      { key: "background-color", label: "Background", type: "color", defaultValue: "#414141" },
      { key: "color", label: "Text Color", type: "color", defaultValue: "#ffffff" },
      { key: "font-size", label: "Font Size", type: "size", defaultValue: "13px" },
      {
        key: "font-weight",
        label: "Font Weight",
        type: "select",
        options: [
          { value: "normal", label: "Normal" },
          { value: "bold", label: "Bold" },
        ],
      },
      { key: "font-family", label: "Font Family", type: "select", options: fontFamilyOptions },
      { key: "border", label: "Border", type: "text", placeholder: "1px solid #000" },
      { key: "border-radius", label: "Border Radius", type: "size", defaultValue: "3px" },
      { key: "inner-padding", label: "Inner Padding", type: "size", defaultValue: "10px 25px" },
      { key: "padding", label: "Outer Padding", type: "size" },
      { key: "align", label: "Alignment", type: "alignment" },
      { key: "width", label: "Width", type: "size", placeholder: "auto or px" },
      { key: "height", label: "Height", type: "size" },
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
      { key: "text-align", label: "Text Align", type: "alignment" },
      {
        key: "text-decoration",
        label: "Text Decoration",
        type: "select",
        options: [
          { value: "none", label: "None" },
          { value: "underline", label: "Underline" },
        ],
      },
      {
        key: "text-transform",
        label: "Text Transform",
        type: "select",
        options: [
          { value: "none", label: "None" },
          { value: "uppercase", label: "Uppercase" },
          { value: "capitalize", label: "Capitalize" },
        ],
      },
    ],
  },

  "mj-navbar": {
    type: "mj-navbar",
    name: "Navbar",
    icon: "Menu",
    category: "interactive",
    canHaveChildren: true,
    allowedChildren: ["mj-navbar-link"],
    defaultProps: {
      hamburger: "hamburger",
      "ico-color": "#000000",
      "ico-font-size": "30px",
    },
    defaultChildren: [
      { type: "mj-navbar-link", props: { href: "#", color: "#000000" }, content: "Home" },
      { type: "mj-navbar-link", props: { href: "#", color: "#000000" }, content: "About" },
      { type: "mj-navbar-link", props: { href: "#", color: "#000000" }, content: "Contact" },
    ],
    propsSchema: [
      { key: "base-url", label: "Base URL", type: "url", placeholder: "https://example.com" },
      {
        key: "hamburger",
        label: "Hamburger Mode",
        type: "select",
        options: [
          { value: "hamburger", label: "Show Hamburger" },
          { value: "", label: "No Hamburger" },
        ],
      },
      { key: "align", label: "Alignment", type: "alignment" },
      { key: "ico-align", label: "Icon Alignment", type: "alignment" },
      { key: "ico-color", label: "Icon Color", type: "color" },
      { key: "ico-font-size", label: "Icon Size", type: "size" },
      { key: "ico-padding", label: "Icon Padding", type: "size" },
      { key: "ico-padding-top", label: "Icon Padding Top", type: "size" },
      { key: "ico-padding-bottom", label: "Icon Padding Bottom", type: "size" },
      { key: "ico-padding-left", label: "Icon Padding Left", type: "size" },
      { key: "ico-padding-right", label: "Icon Padding Right", type: "size" },
    ],
  },

  "mj-navbar-link": {
    type: "mj-navbar-link",
    name: "Navbar Link",
    icon: "Link",
    category: "interactive",
    canHaveChildren: false,
    allowedParents: ["mj-navbar"],
    defaultProps: {
      href: "#",
      color: "#000000",
      "font-size": "13px",
      padding: "15px 10px",
    },
    defaultContent: "Link",
    propsSchema: [
      { key: "href", label: "Link URL", type: "url", placeholder: "https://example.com" },
      {
        key: "target",
        label: "Link Target",
        type: "select",
        options: [
          { value: "_self", label: "Same Window" },
          { value: "_blank", label: "New Window" },
        ],
      },
      { key: "color", label: "Text Color", type: "color" },
      { key: "font-family", label: "Font Family", type: "select", options: fontFamilyOptions },
      { key: "font-size", label: "Font Size", type: "size" },
      {
        key: "font-weight",
        label: "Font Weight",
        type: "select",
        options: [
          { value: "normal", label: "Normal" },
          { value: "bold", label: "Bold" },
        ],
      },
      {
        key: "text-decoration",
        label: "Text Decoration",
        type: "select",
        options: [
          { value: "none", label: "None" },
          { value: "underline", label: "Underline" },
        ],
      },
      {
        key: "text-transform",
        label: "Text Transform",
        type: "select",
        options: [
          { value: "none", label: "None" },
          { value: "uppercase", label: "Uppercase" },
          { value: "capitalize", label: "Capitalize" },
        ],
      },
      { key: "padding", label: "Padding", type: "size" },
      { key: "padding-top", label: "Padding Top", type: "size" },
      { key: "padding-bottom", label: "Padding Bottom", type: "size" },
      { key: "padding-left", label: "Padding Left", type: "size" },
      { key: "padding-right", label: "Padding Right", type: "size" },
    ],
  },

  "mj-accordion": {
    type: "mj-accordion",
    name: "Accordion",
    icon: "ChevronDown",
    category: "interactive",
    canHaveChildren: true,
    allowedChildren: ["mj-accordion-element"],
    defaultProps: {
      border: "2px solid black",
      padding: "10px 25px",
    },
    defaultChildren: [
      {
        type: "mj-accordion-element",
        props: {},
        children: [
          {
            type: "mj-accordion-title",
            props: { padding: "16px" },
            content: "Accordion Title 1",
          },
          {
            type: "mj-accordion-text",
            props: { padding: "16px" },
            content: "This is the content of the first accordion item.",
          },
        ],
      },
      {
        type: "mj-accordion-element",
        props: {},
        children: [
          {
            type: "mj-accordion-title",
            props: { padding: "16px" },
            content: "Accordion Title 2",
          },
          {
            type: "mj-accordion-text",
            props: { padding: "16px" },
            content: "This is the content of the second accordion item.",
          },
        ],
      },
    ],
    propsSchema: [
      { key: "border", label: "Border", type: "text", placeholder: "1px solid #000" },
      { key: "font-family", label: "Font Family", type: "select", options: fontFamilyOptions },
      { key: "icon-align", label: "Icon Alignment", type: "alignment" },
      { key: "icon-height", label: "Icon Height", type: "size" },
      { key: "icon-width", label: "Icon Width", type: "size" },
      {
        key: "icon-position",
        label: "Icon Position",
        type: "select",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      { key: "icon-wrapped-url", label: "Wrapped Icon URL", type: "url" },
      { key: "icon-unwrapped-url", label: "Unwrapped Icon URL", type: "url" },
      { key: "padding", label: "Padding", type: "size" },
      { key: "padding-top", label: "Padding Top", type: "size" },
      { key: "padding-bottom", label: "Padding Bottom", type: "size" },
      { key: "padding-left", label: "Padding Left", type: "size" },
      { key: "padding-right", label: "Padding Right", type: "size" },
    ],
  },

  "mj-accordion-element": {
    type: "mj-accordion-element",
    name: "Accordion Element",
    icon: "ChevronRight",
    category: "interactive",
    canHaveChildren: true,
    allowedChildren: ["mj-accordion-title", "mj-accordion-text"],
    allowedParents: ["mj-accordion"],
    defaultProps: {},
    propsSchema: [
      { key: "background-color", label: "Background", type: "color" },
      { key: "font-family", label: "Font Family", type: "select", options: fontFamilyOptions },
      { key: "icon-align", label: "Icon Alignment", type: "alignment" },
      { key: "icon-height", label: "Icon Height", type: "size" },
      { key: "icon-width", label: "Icon Width", type: "size" },
      {
        key: "icon-position",
        label: "Icon Position",
        type: "select",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      { key: "icon-wrapped-url", label: "Wrapped Icon URL", type: "url" },
      { key: "icon-unwrapped-url", label: "Unwrapped Icon URL", type: "url" },
    ],
  },

  "mj-accordion-title": {
    type: "mj-accordion-title",
    name: "Accordion Title",
    icon: "Heading",
    category: "interactive",
    canHaveChildren: false,
    allowedParents: ["mj-accordion-element"],
    defaultProps: {
      padding: "16px",
      "font-size": "13px",
    },
    defaultContent: "Accordion Title",
    propsSchema: [
      { key: "background-color", label: "Background", type: "color" },
      { key: "color", label: "Text Color", type: "color" },
      { key: "font-family", label: "Font Family", type: "select", options: fontFamilyOptions },
      { key: "font-size", label: "Font Size", type: "size" },
      { key: "padding", label: "Padding", type: "size" },
      { key: "padding-top", label: "Padding Top", type: "size" },
      { key: "padding-bottom", label: "Padding Bottom", type: "size" },
      { key: "padding-left", label: "Padding Left", type: "size" },
      { key: "padding-right", label: "Padding Right", type: "size" },
    ],
  },

  "mj-accordion-text": {
    type: "mj-accordion-text",
    name: "Accordion Text",
    icon: "Text",
    category: "interactive",
    canHaveChildren: false,
    allowedParents: ["mj-accordion-element"],
    defaultProps: {
      padding: "16px",
      "font-size": "13px",
    },
    defaultContent: "Accordion content goes here.",
    propsSchema: [
      { key: "background-color", label: "Background", type: "color" },
      { key: "color", label: "Text Color", type: "color" },
      { key: "font-family", label: "Font Family", type: "select", options: fontFamilyOptions },
      { key: "font-size", label: "Font Size", type: "size" },
      { key: "line-height", label: "Line Height", type: "text" },
      { key: "padding", label: "Padding", type: "size" },
      { key: "padding-top", label: "Padding Top", type: "size" },
      { key: "padding-bottom", label: "Padding Bottom", type: "size" },
      { key: "padding-left", label: "Padding Left", type: "size" },
      { key: "padding-right", label: "Padding Right", type: "size" },
    ],
  },

  "mj-carousel": {
    type: "mj-carousel",
    name: "Carousel",
    icon: "GalleryHorizontal",
    category: "interactive",
    canHaveChildren: true,
    allowedChildren: ["mj-carousel-image"],
    defaultProps: {
      align: "center",
      "border-radius": "6px",
      "icon-width": "44px",
    },
    defaultChildren: [
      {
        type: "mj-carousel-image",
        props: { src: "https://placehold.co/600x300/3b82f6/ffffff?text=Slide+1", alt: "Slide 1" },
      },
      {
        type: "mj-carousel-image",
        props: { src: "https://placehold.co/600x300/10b981/ffffff?text=Slide+2", alt: "Slide 2" },
      },
      {
        type: "mj-carousel-image",
        props: { src: "https://placehold.co/600x300/f59e0b/ffffff?text=Slide+3", alt: "Slide 3" },
      },
    ],
    propsSchema: [
      { key: "align", label: "Alignment", type: "alignment" },
      { key: "background-color", label: "Background", type: "color" },
      { key: "border-radius", label: "Border Radius", type: "size" },
      { key: "icon-width", label: "Icon Width", type: "size" },
      { key: "left-icon", label: "Left Icon URL", type: "url" },
      { key: "right-icon", label: "Right Icon URL", type: "url" },
      {
        key: "thumbnails",
        label: "Show Thumbnails",
        type: "select",
        options: [
          { value: "visible", label: "Visible" },
          { value: "hidden", label: "Hidden" },
        ],
      },
      { key: "tb-border", label: "Thumbnail Border", type: "text" },
      { key: "tb-border-radius", label: "Thumbnail Border Radius", type: "size" },
      { key: "tb-hover-border-color", label: "Thumbnail Hover Border", type: "color" },
      { key: "tb-selected-border-color", label: "Thumbnail Selected Border", type: "color" },
      { key: "tb-width", label: "Thumbnail Width", type: "size" },
    ],
  },

  "mj-carousel-image": {
    type: "mj-carousel-image",
    name: "Carousel Image",
    icon: "ImagePlus",
    category: "interactive",
    canHaveChildren: false,
    allowedParents: ["mj-carousel"],
    defaultProps: {
      src: "https://placehold.co/600x300/e2e8f0/64748b?text=Slide",
      alt: "Carousel slide",
    },
    propsSchema: [
      { key: "src", label: "Image URL", type: "url", placeholder: "https://example.com/image.jpg" },
      { key: "alt", label: "Alt Text", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "href", label: "Link URL", type: "url" },
      {
        key: "target",
        label: "Link Target",
        type: "select",
        options: [
          { value: "_self", label: "Same Window" },
          { value: "_blank", label: "New Window" },
        ],
      },
      { key: "thumbnails-src", label: "Thumbnail URL", type: "url" },
      { key: "border-radius", label: "Border Radius", type: "size" },
    ],
  },
};
