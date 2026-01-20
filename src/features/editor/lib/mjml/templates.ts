/**
 * Email templates
 */

import type { EditorNode, Template } from "@/features/editor/types";
import { generateId } from "./schema";

// Helper function to deep clone a document with new IDs
export function cloneDocumentWithNewIds(document: EditorNode): EditorNode {
  return {
    ...document,
    id: generateId(),
    props: { ...document.props },
    children: document.children?.map(cloneDocumentWithNewIds),
  };
}

// Empty document template
export const emptyDocument: EditorNode = {
  id: "root",
  type: "mj-body",
  props: {
    "background-color": "#f4f4f4",
    width: "600px",
  },
  children: [],
};

// Welcome email template
const welcomeTemplate: EditorNode = {
  id: "root",
  type: "mj-body",
  props: {
    "background-color": "#f4f4f4",
    width: "600px",
  },
  children: [
    {
      id: "section-1",
      type: "mj-section",
      props: {
        "background-color": "#ffffff",
        padding: "40px 20px",
      },
      children: [
        {
          id: "column-1",
          type: "mj-column",
          props: {},
          children: [
            {
              id: "text-1",
              type: "mj-text",
              props: {
                "font-size": "24px",
                "font-weight": "bold",
                align: "center",
                color: "#333333",
              },
              content: "Welcome to Our Platform!",
            },
            {
              id: "text-2",
              type: "mj-text",
              props: {
                "font-size": "16px",
                align: "center",
                color: "#666666",
                padding: "20px 0",
              },
              content:
                "We're excited to have you on board. Get started by exploring our features and customizing your experience.",
            },
            {
              id: "button-1",
              type: "mj-button",
              props: {
                "background-color": "#000000",
                color: "#ffffff",
                "font-weight": "500",
                "border-radius": "50px",
                href: "#",
              },
              content: "Get Started →",
            },
          ],
        },
      ],
    },
    {
      id: "section-2",
      type: "mj-section",
      props: {
        "background-color": "#ffffff",
        padding: "0",
      },
      children: [
        {
          id: "column-2",
          type: "mj-column",
          props: {
            padding: "0",
          },
          children: [
            {
              id: "text-3",
              type: "mj-text",
              props: {
                padding: "0px 25px",
                "font-size": "16px",
                "line-height": "1.5",
                color: "#333333",
                align: "right",
              },
              content: "Contact us:",
            },
          ],
        },
      ],
    },
    {
      id: "section-3",
      type: "mj-section",
      props: {
        "background-color": "#ffffff",
        padding: "0",
      },
      children: [
        {
          id: "column-3",
          type: "mj-column",
          props: {
            padding: "10px",
          },
          children: [
            {
              id: "social-1",
              type: "mj-social",
              props: {
                mode: "horizontal",
                padding: "0 12px",
                "icon-size": "20px",
                align: "right",
              },
              children: [
                {
                  id: "social-element-1",
                  type: "mj-social-element",
                  props: {
                    name: "github",
                    href: "https://github.com/wzc520pyfm/mail-studio",
                    target: "_blank",
                    alt: "Github",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Newsletter template
const newsletterTemplate: EditorNode = {
  id: "root",
  type: "mj-body",
  props: {
    "background-color": "#f4f4f4",
    width: "600px",
  },
  children: [
    {
      id: "section-header",
      type: "mj-section",
      props: {
        "background-color": "#1e293b",
        padding: "20px",
      },
      children: [
        {
          id: "column-header",
          type: "mj-column",
          props: {},
          children: [
            {
              id: "text-header",
              type: "mj-text",
              props: {
                "font-size": "24px",
                "font-weight": "bold",
                align: "center",
                color: "#ffffff",
              },
              content: "Weekly Newsletter",
            },
          ],
        },
      ],
    },
    {
      id: "section-content",
      type: "mj-section",
      props: {
        "background-color": "#ffffff",
        padding: "30px 20px",
      },
      children: [
        {
          id: "column-content",
          type: "mj-column",
          props: {},
          children: [
            {
              id: "image-1",
              type: "mj-image",
              props: {
                src: "https://placehold.co/560x300/e2e8f0/64748b?text=Featured+Article",
                alt: "Featured Article",
                "border-radius": "8px",
              },
            },
            {
              id: "text-title",
              type: "mj-text",
              props: {
                "font-size": "20px",
                "font-weight": "bold",
                color: "#333333",
                padding: "20px 0 10px",
              },
              content: "This Week's Featured Article",
            },
            {
              id: "text-content",
              type: "mj-text",
              props: {
                "font-size": "16px",
                color: "#666666",
                "line-height": "1.6",
              },
              content:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            },
            {
              id: "button-read",
              type: "mj-button",
              props: {
                "background-color": "#000000",
                color: "#ffffff",
                "font-weight": "500",
                "border-radius": "50px",
                href: "#",
                align: "left",
              },
              content: "Read More →",
            },
          ],
        },
      ],
    },
  ],
};

// Marketing email template
const marketingTemplate: EditorNode = {
  id: "root",
  type: "mj-body",
  props: {
    "background-color": "#f4f4f4",
    width: "600px",
  },
  children: [
    {
      id: "hero-section",
      type: "mj-section",
      props: {
        "background-color": "#4f46e5",
        padding: "60px 20px",
      },
      children: [
        {
          id: "hero-column",
          type: "mj-column",
          props: {},
          children: [
            {
              id: "hero-title",
              type: "mj-text",
              props: {
                "font-size": "32px",
                "font-weight": "bold",
                align: "center",
                color: "#ffffff",
              },
              content: "Special Offer!",
            },
            {
              id: "hero-subtitle",
              type: "mj-text",
              props: {
                "font-size": "18px",
                align: "center",
                color: "#e0e7ff",
                padding: "10px 0 30px",
              },
              content: "Get 50% off your first purchase",
            },
            {
              id: "hero-button",
              type: "mj-button",
              props: {
                "background-color": "#ffffff",
                color: "#000000",
                "border-radius": "50px",
                "font-weight": "500",
                href: "#",
              },
              content: "Shop Now →",
            },
          ],
        },
      ],
    },
    {
      id: "content-section",
      type: "mj-section",
      props: {
        "background-color": "#ffffff",
        padding: "40px 20px",
      },
      children: [
        {
          id: "content-column",
          type: "mj-column",
          props: {},
          children: [
            {
              id: "content-text",
              type: "mj-text",
              props: {
                "font-size": "16px",
                align: "center",
                color: "#666666",
              },
              content:
                "Use code <strong>SAVE50</strong> at checkout to redeem your discount. Offer valid until the end of the month.",
            },
          ],
        },
      ],
    },
  ],
};

// Notification template
const notificationTemplate: EditorNode = {
  id: "root",
  type: "mj-body",
  props: {
    "background-color": "#f4f4f4",
    width: "600px",
  },
  children: [
    {
      id: "section-1",
      type: "mj-section",
      props: {
        "background-color": "#ffffff",
        padding: "30px 20px",
      },
      children: [
        {
          id: "column-1",
          type: "mj-column",
          props: {},
          children: [
            {
              id: "text-1",
              type: "mj-text",
              props: {
                "font-size": "20px",
                "font-weight": "bold",
                color: "#333333",
              },
              content: "New Activity on Your Account",
            },
            {
              id: "divider-1",
              type: "mj-divider",
              props: {
                "border-color": "#e2e8f0",
                "border-width": "1px",
                padding: "15px 0",
              },
            },
            {
              id: "text-2",
              type: "mj-text",
              props: {
                "font-size": "16px",
                color: "#666666",
                "line-height": "1.6",
              },
              content:
                "We noticed a new login to your account from a new device. If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.",
            },
            {
              id: "button-1",
              type: "mj-button",
              props: {
                "background-color": "#000000",
                color: "#ffffff",
                "font-weight": "500",
                "border-radius": "50px",
                href: "#",
              },
              content: "Review Activity →",
            },
          ],
        },
      ],
    },
  ],
};

// Export templates
export const templates: Template[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    category: "welcome",
    document: welcomeTemplate,
  },
  {
    id: "newsletter",
    name: "Newsletter",
    category: "newsletter",
    document: newsletterTemplate,
  },
  {
    id: "marketing",
    name: "Marketing Promo",
    category: "marketing",
    document: marketingTemplate,
  },
  {
    id: "notification",
    name: "Account Notification",
    category: "notification",
    document: notificationTemplate,
  },
];
