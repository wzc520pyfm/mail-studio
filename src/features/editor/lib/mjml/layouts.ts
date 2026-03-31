/**
 * Email Layout definitions
 *
 * Each layout defines a structural frame with fixed (locked) regions
 * and named content slots. Users can switch between layouts while
 * preserving their content in the slots.
 */

import type { EmailLayout } from "@/features/editor/types";

// ============ Layout: Corporate Blue ============
const corporateBlue: EmailLayout = {
  id: "corporate-blue",
  name: "Corporate Blue",
  category: "business",
  bodyProps: {
    "background-color": "#f0f4f8",
    width: "600px",
  },
  regions: [
    {
      type: "fixed",
      node: {
        id: "layout-header",
        type: "mj-section",
        props: {
          "background-color": "#1e3a5f",
          padding: "24px 20px",
        },
        locked: true,
        children: [
          {
            id: "layout-header-col",
            type: "mj-column",
            props: {},
            children: [
              {
                id: "layout-header-logo",
                type: "mj-text",
                props: {
                  "font-size": "22px",
                  "font-weight": "bold",
                  align: "center",
                  color: "#ffffff",
                },
                content: "ACME Corp",
              },
              {
                id: "layout-header-nav",
                type: "mj-navbar",
                props: {
                  hamburger: "hamburger",
                  align: "center",
                },
                children: [
                  {
                    id: "layout-nav-1",
                    type: "mj-navbar-link",
                    props: {
                      href: "#",
                      color: "#cbd5e1",
                      "font-size": "13px",
                      "text-transform": "uppercase",
                      padding: "0 14px",
                    },
                    content: "Products",
                  },
                  {
                    id: "layout-nav-2",
                    type: "mj-navbar-link",
                    props: {
                      href: "#",
                      color: "#cbd5e1",
                      "font-size": "13px",
                      "text-transform": "uppercase",
                      padding: "0 14px",
                    },
                    content: "About",
                  },
                  {
                    id: "layout-nav-3",
                    type: "mj-navbar-link",
                    props: {
                      href: "#",
                      color: "#cbd5e1",
                      "font-size": "13px",
                      "text-transform": "uppercase",
                      padding: "0 14px",
                    },
                    content: "Contact",
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "slot",
      slotId: "main",
      name: "Main Content",
      defaultChildren: [
        {
          id: "default-main",
          type: "mj-section",
          props: {
            "background-color": "#ffffff",
            padding: "30px 20px",
          },
          children: [
            {
              id: "default-main-col",
              type: "mj-column",
              props: {},
              children: [
                {
                  id: "default-main-text",
                  type: "mj-text",
                  props: {
                    "font-size": "16px",
                    color: "#374151",
                    "line-height": "1.6",
                  },
                  content: "Start writing your email content here...",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "fixed",
      node: {
        id: "layout-footer",
        type: "mj-section",
        props: {
          "background-color": "#1e3a5f",
          padding: "20px",
        },
        locked: true,
        children: [
          {
            id: "layout-footer-col",
            type: "mj-column",
            props: {},
            children: [
              {
                id: "layout-footer-text",
                type: "mj-text",
                props: {
                  "font-size": "12px",
                  align: "center",
                  color: "#94a3b8",
                },
                content:
                  '© 2025 ACME Corp · <a href="#" style="color: #94a3b8;">Unsubscribe</a> · <a href="#" style="color: #94a3b8;">Privacy Policy</a>',
              },
            ],
          },
        ],
      },
    },
  ],
};

// ============ Layout: Modern Minimal ============
const modernMinimal: EmailLayout = {
  id: "modern-minimal",
  name: "Modern Minimal",
  category: "creative",
  bodyProps: {
    "background-color": "#ffffff",
    width: "600px",
  },
  regions: [
    {
      type: "fixed",
      node: {
        id: "layout-header",
        type: "mj-section",
        props: {
          "background-color": "#ffffff",
          padding: "32px 20px 16px",
          "border-bottom": "2px solid #000000",
        },
        locked: true,
        children: [
          {
            id: "layout-header-col",
            type: "mj-column",
            props: {},
            children: [
              {
                id: "layout-header-logo",
                type: "mj-text",
                props: {
                  "font-size": "28px",
                  "font-weight": "bold",
                  align: "left",
                  color: "#000000",
                  "letter-spacing": "2px",
                },
                content: "STUDIO",
              },
            ],
          },
        ],
      },
    },
    {
      type: "slot",
      slotId: "main",
      name: "Main Content",
      defaultChildren: [
        {
          id: "default-main",
          type: "mj-section",
          props: {
            "background-color": "#ffffff",
            padding: "40px 20px",
          },
          children: [
            {
              id: "default-main-col",
              type: "mj-column",
              props: {},
              children: [
                {
                  id: "default-main-text",
                  type: "mj-text",
                  props: {
                    "font-size": "16px",
                    color: "#333333",
                    "line-height": "1.8",
                  },
                  content: "Start writing your email content here...",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "fixed",
      node: {
        id: "layout-footer",
        type: "mj-section",
        props: {
          "background-color": "#ffffff",
          padding: "16px 20px 32px",
          "border-top": "1px solid #e5e7eb",
        },
        locked: true,
        children: [
          {
            id: "layout-footer-col",
            type: "mj-column",
            props: {},
            children: [
              {
                id: "layout-footer-text",
                type: "mj-text",
                props: {
                  "font-size": "11px",
                  align: "center",
                  color: "#9ca3af",
                  "line-height": "1.6",
                },
                content:
                  'You received this email because you subscribed to our list.<br/><a href="#" style="color: #9ca3af;">Unsubscribe</a>',
              },
            ],
          },
        ],
      },
    },
  ],
};

// ============ Layout: Bold Red ============
const boldRed: EmailLayout = {
  id: "bold-red",
  name: "Bold Red",
  category: "marketing",
  bodyProps: {
    "background-color": "#1a1a1a",
    width: "600px",
  },
  regions: [
    {
      type: "fixed",
      node: {
        id: "layout-header",
        type: "mj-section",
        props: {
          "background-color": "#dc2626",
          padding: "28px 20px",
        },
        locked: true,
        children: [
          {
            id: "layout-header-col",
            type: "mj-column",
            props: {},
            children: [
              {
                id: "layout-header-logo",
                type: "mj-text",
                props: {
                  "font-size": "26px",
                  "font-weight": "bold",
                  align: "center",
                  color: "#ffffff",
                  "text-transform": "uppercase",
                  "letter-spacing": "4px",
                },
                content: "BRAND",
              },
            ],
          },
        ],
      },
    },
    {
      type: "slot",
      slotId: "hero",
      name: "Hero Area",
      defaultChildren: [
        {
          id: "default-hero",
          type: "mj-section",
          props: {
            "background-color": "#2a2a2a",
            padding: "40px 20px",
          },
          children: [
            {
              id: "default-hero-col",
              type: "mj-column",
              props: {},
              children: [
                {
                  id: "default-hero-text",
                  type: "mj-text",
                  props: {
                    "font-size": "28px",
                    "font-weight": "bold",
                    align: "center",
                    color: "#ffffff",
                  },
                  content: "Your headline goes here",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "fixed",
      node: {
        id: "layout-divider",
        type: "mj-section",
        props: {
          "background-color": "#dc2626",
          padding: "0",
        },
        locked: true,
        children: [
          {
            id: "layout-divider-col",
            type: "mj-column",
            props: {},
            children: [
              {
                id: "layout-divider-spacer",
                type: "mj-spacer",
                props: { height: "4px" },
              },
            ],
          },
        ],
      },
    },
    {
      type: "slot",
      slotId: "main",
      name: "Main Content",
      defaultChildren: [
        {
          id: "default-main",
          type: "mj-section",
          props: {
            "background-color": "#2a2a2a",
            padding: "30px 20px",
          },
          children: [
            {
              id: "default-main-col",
              type: "mj-column",
              props: {},
              children: [
                {
                  id: "default-main-text",
                  type: "mj-text",
                  props: {
                    "font-size": "16px",
                    color: "#d1d5db",
                    "line-height": "1.6",
                  },
                  content: "Write your main content here...",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "fixed",
      node: {
        id: "layout-footer",
        type: "mj-section",
        props: {
          "background-color": "#111111",
          padding: "20px",
        },
        locked: true,
        children: [
          {
            id: "layout-footer-col",
            type: "mj-column",
            props: {},
            children: [
              {
                id: "layout-footer-text",
                type: "mj-text",
                props: {
                  "font-size": "11px",
                  align: "center",
                  color: "#6b7280",
                },
                content:
                  'BRAND Inc. · <a href="#" style="color: #6b7280;">Unsubscribe</a> · <a href="#" style="color: #6b7280;">Preferences</a>',
              },
            ],
          },
        ],
      },
    },
  ],
};

// ============ Exports ============
export const emailLayouts: EmailLayout[] = [corporateBlue, modernMinimal, boldRed];

export function getLayoutById(id: string): EmailLayout | undefined {
  return emailLayouts.find((l) => l.id === id);
}
