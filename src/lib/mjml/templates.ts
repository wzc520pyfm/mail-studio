import { EditorNode, Template } from '@/types/editor';
import { generateId } from './schema';

// Default empty document
export const emptyDocument: EditorNode = {
  id: generateId(),
  type: 'mj-body',
  props: {
    'background-color': '#f4f4f4',
    width: '600px',
  },
  children: [
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#ffffff',
        padding: '40px 20px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '24px',
                'font-weight': 'bold',
                align: 'center',
                color: '#1e293b',
              },
              content: 'Welcome to Mail Studio',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                align: 'center',
                color: '#64748b',
                'padding-top': '10px',
              },
              content: 'Start building your email by dragging components from the left panel.',
            },
          ],
        },
      ],
    },
  ],
};

// Marketing Template
const marketingTemplate: EditorNode = {
  id: generateId(),
  type: 'mj-body',
  props: {
    'background-color': '#f8fafc',
    width: '600px',
  },
  children: [
    // Header
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#1e293b',
        padding: '20px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#ffffff',
                'font-size': '24px',
                'font-weight': 'bold',
                align: 'center',
              },
              content: 'Your Brand',
            },
          ],
        },
      ],
    },
    // Hero
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#ffffff',
        padding: '40px 20px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-image',
              props: {
                src: 'https://placehold.co/560x280/e2e8f0/64748b?text=Hero+Image',
                alt: 'Hero image',
                'border-radius': '8px',
              },
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '28px',
                'font-weight': 'bold',
                align: 'center',
                color: '#1e293b',
                'padding-top': '30px',
              },
              content: 'Introducing Our New Product',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                align: 'center',
                color: '#64748b',
                'padding-top': '15px',
                'padding-bottom': '25px',
              },
              content: 'Discover the features that make our product stand out from the competition. Built with care and attention to detail.',
            },
            {
              id: generateId(),
              type: 'mj-button',
              props: {
                href: '#',
                'background-color': '#2563eb',
                color: '#ffffff',
                'border-radius': '6px',
                'font-size': '16px',
                padding: '15px 30px',
              },
              content: 'Learn More',
            },
          ],
        },
      ],
    },
    // Features
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#f8fafc',
        padding: '30px 20px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: { width: '50%' },
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '18px',
                'font-weight': 'bold',
                color: '#1e293b',
              },
              content: 'Feature One',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#64748b',
                'padding-top': '10px',
              },
              content: 'A brief description of this amazing feature and why users will love it.',
            },
          ],
        },
        {
          id: generateId(),
          type: 'mj-column',
          props: { width: '50%' },
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '18px',
                'font-weight': 'bold',
                color: '#1e293b',
              },
              content: 'Feature Two',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#64748b',
                'padding-top': '10px',
              },
              content: 'Another compelling feature that adds value to your customers experience.',
            },
          ],
        },
      ],
    },
    // Footer
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#1e293b',
        padding: '30px 20px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#94a3b8',
                'font-size': '12px',
                align: 'center',
              },
              content: '© 2024 Your Brand. All rights reserved.',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#94a3b8',
                'font-size': '12px',
                align: 'center',
                'padding-top': '10px',
              },
              content: '<a href="#" style="color: #94a3b8;">Unsubscribe</a> | <a href="#" style="color: #94a3b8;">View in browser</a>',
            },
          ],
        },
      ],
    },
  ],
};

// Newsletter Template
const newsletterTemplate: EditorNode = {
  id: generateId(),
  type: 'mj-body',
  props: {
    'background-color': '#f4f4f4',
    width: '600px',
  },
  children: [
    // Header
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#ffffff',
        padding: '30px 20px 20px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '28px',
                'font-weight': 'bold',
                align: 'center',
                color: '#1e293b',
              },
              content: 'Weekly Newsletter',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                align: 'center',
                color: '#64748b',
                'font-size': '14px',
                'padding-top': '5px',
              },
              content: 'January 15, 2024 • Issue #42',
            },
          ],
        },
      ],
    },
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#ffffff',
        padding: '0 20px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-divider',
              props: {
                'border-color': '#e2e8f0',
                'border-width': '1px',
              },
            },
          ],
        },
      ],
    },
    // Featured Article
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#ffffff',
        padding: '20px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '12px',
                'text-transform': 'uppercase',
                color: '#2563eb',
                'font-weight': 'bold',
              },
              content: 'Featured',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '22px',
                'font-weight': 'bold',
                color: '#1e293b',
                'padding-top': '10px',
              },
              content: 'The Future of Email Design',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#64748b',
                'padding-top': '10px',
              },
              content: 'Explore the latest trends in email design and learn how to create engaging newsletters that your subscribers will love to read.',
            },
            {
              id: generateId(),
              type: 'mj-button',
              props: {
                href: '#',
                'background-color': '#1e293b',
                color: '#ffffff',
                'border-radius': '4px',
                'font-size': '14px',
                padding: '12px 24px',
                'padding-top': '20px',
              },
              content: 'Read Article →',
            },
          ],
        },
      ],
    },
    // More Articles
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#ffffff',
        padding: '10px 20px 30px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: { width: '50%' },
          children: [
            {
              id: generateId(),
              type: 'mj-image',
              props: {
                src: 'https://placehold.co/260x160/e2e8f0/64748b?text=Article',
                'border-radius': '4px',
              },
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '16px',
                'font-weight': 'bold',
                color: '#1e293b',
                'padding-top': '15px',
              },
              content: 'Design Tips & Tricks',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#64748b',
                'font-size': '14px',
                'padding-top': '5px',
              },
              content: 'Quick tips to improve your designs.',
            },
          ],
        },
        {
          id: generateId(),
          type: 'mj-column',
          props: { width: '50%' },
          children: [
            {
              id: generateId(),
              type: 'mj-image',
              props: {
                src: 'https://placehold.co/260x160/e2e8f0/64748b?text=Article',
                'border-radius': '4px',
              },
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '16px',
                'font-weight': 'bold',
                color: '#1e293b',
                'padding-top': '15px',
              },
              content: 'Industry Updates',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#64748b',
                'font-size': '14px',
                'padding-top': '5px',
              },
              content: 'Whats new in the email world.',
            },
          ],
        },
      ],
    },
    // Footer
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#f8fafc',
        padding: '30px 20px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#64748b',
                'font-size': '12px',
                align: 'center',
              },
              content: 'You received this email because you subscribed to our newsletter.',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#64748b',
                'font-size': '12px',
                align: 'center',
                'padding-top': '10px',
              },
              content: '<a href="#" style="color: #2563eb;">Unsubscribe</a> • <a href="#" style="color: #2563eb;">Preferences</a>',
            },
          ],
        },
      ],
    },
  ],
};

// Welcome Template
const welcomeTemplate: EditorNode = {
  id: generateId(),
  type: 'mj-body',
  props: {
    'background-color': '#f0f9ff',
    width: '600px',
  },
  children: [
    // Header
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#ffffff',
        padding: '40px 20px',
        'border-radius': '12px 12px 0 0',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '48px',
                align: 'center',
              },
              content: '👋',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '32px',
                'font-weight': 'bold',
                align: 'center',
                color: '#1e293b',
                'padding-top': '20px',
              },
              content: 'Welcome Aboard!',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                align: 'center',
                color: '#64748b',
                'font-size': '18px',
                'padding-top': '15px',
              },
              content: 'Were so excited to have you join us. Lets get you started!',
            },
          ],
        },
      ],
    },
    // Content
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#ffffff',
        padding: '0 20px 40px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-divider',
              props: {
                'border-color': '#e2e8f0',
                'border-width': '1px',
                padding: '0 40px 30px',
              },
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '18px',
                'font-weight': 'bold',
                color: '#1e293b',
              },
              content: 'Here are your next steps:',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#475569',
                'padding-top': '15px',
                'line-height': '1.8',
              },
              content: '1. Complete your profile setup<br/>2. Explore our features<br/>3. Connect with the community<br/>4. Start creating amazing things!',
            },
            {
              id: generateId(),
              type: 'mj-button',
              props: {
                href: '#',
                'background-color': '#0ea5e9',
                color: '#ffffff',
                'border-radius': '8px',
                'font-size': '16px',
                'font-weight': 'bold',
                padding: '15px 40px',
                'padding-top': '30px',
              },
              content: 'Get Started',
            },
          ],
        },
      ],
    },
    // Help Section
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#f8fafc',
        padding: '30px 20px',
        'border-radius': '0 0 12px 12px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '16px',
                'font-weight': 'bold',
                color: '#1e293b',
                align: 'center',
              },
              content: 'Need Help?',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#64748b',
                'font-size': '14px',
                align: 'center',
                'padding-top': '10px',
              },
              content: 'Our support team is here for you. <a href="#" style="color: #0ea5e9;">Contact us</a> anytime.',
            },
          ],
        },
      ],
    },
  ],
};

// Notification Template
const notificationTemplate: EditorNode = {
  id: generateId(),
  type: 'mj-body',
  props: {
    'background-color': '#f4f4f4',
    width: '600px',
  },
  children: [
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        'background-color': '#ffffff',
        padding: '40px 30px',
        'border-radius': '8px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '20px',
                'font-weight': 'bold',
                color: '#1e293b',
              },
              content: 'Your Order Has Been Shipped! 📦',
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                color: '#64748b',
                'padding-top': '15px',
              },
              content: 'Great news! Your order #12345 is on its way. You can track your package using the button below.',
            },
            {
              id: generateId(),
              type: 'mj-button',
              props: {
                href: '#',
                'background-color': '#10b981',
                color: '#ffffff',
                'border-radius': '6px',
                'font-size': '14px',
                padding: '12px 24px',
                'padding-top': '25px',
              },
              content: 'Track Package',
            },
            {
              id: generateId(),
              type: 'mj-divider',
              props: {
                'border-color': '#e2e8f0',
                'padding-top': '30px',
              },
            },
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '14px',
                color: '#94a3b8',
                'padding-top': '20px',
              },
              content: 'Estimated delivery: January 20-22, 2024<br/>Carrier: Express Shipping',
            },
          ],
        },
      ],
    },
    {
      id: generateId(),
      type: 'mj-section',
      props: {
        padding: '20px',
      },
      children: [
        {
          id: generateId(),
          type: 'mj-column',
          props: {},
          children: [
            {
              id: generateId(),
              type: 'mj-text',
              props: {
                'font-size': '12px',
                color: '#94a3b8',
                align: 'center',
              },
              content: 'Questions? Reply to this email or contact <a href="#" style="color: #64748b;">support</a>.',
            },
          ],
        },
      ],
    },
  ],
};

// Export all templates
export const templates: Template[] = [
  {
    id: 'blank',
    name: 'Blank',
    category: 'marketing',
    document: emptyDocument,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    category: 'marketing',
    document: marketingTemplate,
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    category: 'newsletter',
    document: newsletterTemplate,
  },
  {
    id: 'welcome',
    name: 'Welcome',
    category: 'welcome',
    document: welcomeTemplate,
  },
  {
    id: 'notification',
    name: 'Notification',
    category: 'notification',
    document: notificationTemplate,
  },
];

// Helper to clone a template document with fresh IDs
export function cloneDocumentWithNewIds(node: EditorNode): EditorNode {
  return {
    ...node,
    id: generateId(),
    children: node.children?.map(cloneDocumentWithNewIds),
  };
}
