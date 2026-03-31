/**
 * Email Layout definitions
 *
 * Each layout defines a structural frame with fixed (locked) regions
 * and named content slots. Users can switch between layouts while
 * preserving their content in the slots.
 */

import type { EmailLayout } from "@/features/editor/types";

// ============ Layout: Sunrise ============
const sunrise: EmailLayout = {
  id: "sunrise",
  name: "Sunrise",
  category: "business",
  bodyProps: {
    "background-color": "#fef5ef",
    width: "600px",
  },
  regions: [
    {
      type: "fixed",
      node: {
        id: "layout-header",
        type: "mj-section",
        props: {
          "background-color": "#fef5ef",
          padding: "28px 32px",
        },
        locked: true,
        children: [
          {
            id: "layout-header-col",
            type: "mj-column",
            props: {},
            children: [
              {
                id: "layout-header-brand",
                type: "mj-text",
                props: {
                  "font-size": "22px",
                  "font-weight": "800",
                  align: "center",
                  color: "#b5502e",
                  "letter-spacing": "3px",
                },
                content: "STARTER",
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
            padding: "40px 32px",
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
                    "font-size": "15px",
                    color: "#1a1a1a",
                    "line-height": "1.7",
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
          "background-color": "#fef5ef",
          padding: "24px 32px",
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
                  color: "#8c7162",
                  "line-height": "1.7",
                },
                content:
                  '<a href="#" style="color: #b5502e; text-decoration: underline;">Unsubscribe</a> &nbsp;\u00b7&nbsp; <a href="#" style="color: #b5502e; text-decoration: underline;">Privacy</a> &nbsp;\u00b7&nbsp; <a href="#" style="color: #b5502e; text-decoration: underline;">View Online</a>',
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

// ============ Layout: Luxe Dark ============
const luxeDark: EmailLayout = {
  id: "luxe-dark",
  name: "Luxe Dark",
  category: "marketing",
  bodyProps: {
    "background-color": "#13111a",
    width: "600px",
  },
  regions: [
    {
      type: "fixed",
      node: {
        id: "layout-header",
        type: "mj-section",
        props: {
          "background-color": "#1c1928",
          padding: "28px 32px 24px",
        },
        locked: true,
        children: [
          {
            id: "layout-header-col-logo",
            type: "mj-column",
            props: { width: "50%" },
            children: [
              {
                id: "layout-header-logo",
                type: "mj-text",
                props: {
                  "font-size": "22px",
                  "font-weight": "700",
                  align: "left",
                  color: "#e2b96f",
                  "letter-spacing": "3px",
                  "font-family": "Georgia, serif",
                },
                content: "LUXE",
              },
            ],
          },
          {
            id: "layout-header-col-tagline",
            type: "mj-column",
            props: { width: "50%" },
            children: [
              {
                id: "layout-header-tagline",
                type: "mj-text",
                props: {
                  "font-size": "11px",
                  align: "right",
                  color: "#6b6580",
                  "padding-top": "8px",
                  "text-transform": "uppercase",
                  "letter-spacing": "2px",
                },
                content: "Premium Collection",
              },
            ],
          },
        ],
      },
    },
    {
      type: "fixed",
      node: {
        id: "layout-header-accent",
        type: "mj-section",
        props: {
          "background-color": "#1c1928",
          padding: "0 32px",
        },
        locked: true,
        children: [
          {
            id: "layout-header-accent-col",
            type: "mj-column",
            props: {},
            children: [
              {
                id: "layout-header-accent-line",
                type: "mj-divider",
                props: {
                  "border-color": "#e2b96f",
                  "border-width": "2px",
                  padding: "0",
                  width: "60px",
                },
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
            "background-color": "#1c1928",
            padding: "36px 32px 20px",
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
                    "font-size": "26px",
                    "font-weight": "700",
                    align: "center",
                    color: "#f1eff6",
                    "line-height": "1.3",
                    "font-family": "Georgia, serif",
                  },
                  content: "Your headline goes here",
                },
                {
                  id: "default-hero-sub",
                  type: "mj-text",
                  props: {
                    "font-size": "14px",
                    align: "center",
                    color: "#8b839e",
                    "line-height": "1.6",
                    "padding-top": "8px",
                  },
                  content: "A short subtitle to accompany your headline",
                },
              ],
            },
          ],
        },
      ],
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
            "background-color": "#241f32",
            padding: "32px 32px",
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
                    "font-size": "15px",
                    color: "#c4bdd4",
                    "line-height": "1.7",
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
        id: "layout-footer-accent",
        type: "mj-section",
        props: {
          "background-color": "#16131e",
          padding: "0 32px",
        },
        locked: true,
        children: [
          {
            id: "layout-footer-accent-col",
            type: "mj-column",
            props: {},
            children: [
              {
                id: "layout-footer-accent-line",
                type: "mj-divider",
                props: {
                  "border-color": "#2d2840",
                  "border-width": "1px",
                  padding: "0",
                },
              },
            ],
          },
        ],
      },
    },
    {
      type: "fixed",
      node: {
        id: "layout-footer",
        type: "mj-section",
        props: {
          "background-color": "#16131e",
          padding: "20px 32px 28px",
        },
        locked: true,
        children: [
          {
            id: "layout-footer-col",
            type: "mj-column",
            props: {},
            children: [
              {
                id: "layout-footer-brand",
                type: "mj-text",
                props: {
                  "font-size": "14px",
                  "font-weight": "600",
                  align: "center",
                  color: "#e2b96f",
                  "letter-spacing": "2px",
                  "padding-bottom": "8px",
                  "font-family": "Georgia, serif",
                },
                content: "LUXE",
              },
              {
                id: "layout-footer-text",
                type: "mj-text",
                props: {
                  "font-size": "11px",
                  align: "center",
                  color: "#5a5370",
                  "line-height": "1.7",
                },
                content:
                  '<a href="#" style="color: #b8b0cc; text-decoration: none;">Unsubscribe</a> &nbsp;·&nbsp; <a href="#" style="color: #b8b0cc; text-decoration: none;">Preferences</a> &nbsp;·&nbsp; <a href="#" style="color: #b8b0cc; text-decoration: none;">View Online</a>',
              },
            ],
          },
        ],
      },
    },
  ],
};

// ============ Exports ============
export const emailLayouts: EmailLayout[] = [sunrise, modernMinimal, luxeDark];

export function getLayoutById(id: string): EmailLayout | undefined {
  return emailLayouts.find((l) => l.id === id);
}
