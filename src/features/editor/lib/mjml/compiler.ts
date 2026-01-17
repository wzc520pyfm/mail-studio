/**
 * MJML Compiler - Convert EditorNode to MJML and compile to HTML
 */

import mjml2html from 'mjml-browser';
import type { EditorNode, HeadSettings } from '@/features/editor/types';
import { componentDefinitions } from '@/features/editor/lib/mjml/schema';

// Self-closing MJML tags (components that don't have children or text content)
const SELF_CLOSING_TAGS = ['mj-divider', 'mj-spacer', 'mj-image', 'mj-carousel-image'];

// Tags that should use content as HTML (not text)
const HTML_CONTENT_TAGS = ['mj-table', 'mj-raw'];

// Escape HTML attribute values
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Escape HTML content
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Convert EditorNode tree to MJML string
export function nodeToMjml(node: EditorNode, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const { type, props, children, content } = node;

  // Get component definition to check if it can have children
  const componentDef = componentDefinitions[type];
  const canHaveChildren = componentDef?.canHaveChildren ?? false;

  // Build attributes string
  const attrs = Object.entries(props)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}="${escapeAttr(String(value))}"`)
    .join(' ');

  const openTag = attrs ? `<${type} ${attrs}>` : `<${type}>`;
  const closeTag = `</${type}>`;

  // Only consider children if the component type allows children
  const validChildren = canHaveChildren ? children : undefined;

  // Handle self-closing tags for components without children or content
  if (!validChildren?.length && !content) {
    if (SELF_CLOSING_TAGS.includes(type)) {
      return `${spaces}${attrs ? `<${type} ${attrs} />` : `<${type} />`}`;
    }
  }

  // Build children MJML (only for components that can have children)
  const childrenMjml = validChildren?.map((child) => nodeToMjml(child, indent + 1)).join('\n');

  // Combine parts
  if (content && !validChildren?.length) {
    // For HTML content tags, preserve the content as-is (with proper indentation)
    if (HTML_CONTENT_TAGS.includes(type)) {
      const indentedContent = content
        .split('\n')
        .map((line) => `${spaces}  ${line}`)
        .join('\n');
      return `${spaces}${openTag}\n${indentedContent}\n${spaces}${closeTag}`;
    }
    return `${spaces}${openTag}${content}${closeTag}`;
  }

  if (childrenMjml) {
    return `${spaces}${openTag}\n${childrenMjml}\n${spaces}${closeTag}`;
  }

  return `${spaces}${openTag}${closeTag}`;
}

// Generate head content from HeadSettings
function generateHeadContent(headSettings?: HeadSettings): string {
  const parts: string[] = [];

  // mj-title
  if (headSettings?.title) {
    parts.push(`    <mj-title>${escapeHtml(headSettings.title)}</mj-title>`);
  }

  // mj-preview
  if (headSettings?.preview) {
    parts.push(`    <mj-preview>${escapeHtml(headSettings.preview)}</mj-preview>`);
  }

  // mj-font (custom fonts)
  if (headSettings?.fonts && headSettings.fonts.length > 0) {
    for (const font of headSettings.fonts) {
      parts.push(
        `    <mj-font name="${escapeAttr(font.name)}" href="${escapeAttr(font.href)}" />`
      );
    }
  }

  // mj-breakpoint
  if (headSettings?.breakpoint) {
    parts.push(`    <mj-breakpoint width="${escapeAttr(headSettings.breakpoint)}" />`);
  }

  // Default attributes
  parts.push(`    <mj-attributes>
      <mj-all font-family="Arial, sans-serif" />
      <mj-text font-size="16px" line-height="1.5" color="#333333" />
    </mj-attributes>`);

  // mj-style (custom styles + defaults)
  const defaultStyles = '.link-nostyle { color: inherit; text-decoration: none; }';
  const customStyles = headSettings?.styles ? headSettings.styles : '';
  const allStyles = [defaultStyles, customStyles].filter(Boolean).join('\n      ');

  parts.push(`    <mj-style>
      ${allStyles}
    </mj-style>`);

  return parts.join('\n');
}

// Generate full MJML document from editor document
export function generateMjml(document: EditorNode, headSettings?: HeadSettings): string {
  const bodyContent = nodeToMjml(document, 1);
  const headContent = generateHeadContent(headSettings);

  return `<mjml>
  <mj-head>
${headContent}
  </mj-head>
${bodyContent}
</mjml>`;
}

// Compile MJML to HTML
export function compileMjml(mjmlString: string): { html: string; errors: string[] } {
  try {
    const result = mjml2html(mjmlString, {
      validationLevel: 'soft',
      minify: false,
    });

    return {
      html: result.html,
      errors: result.errors?.map((e) => e.formattedMessage) || [],
    };
  } catch (error) {
    return {
      html: '',
      errors: [(error as Error).message],
    };
  }
}

// Compile EditorNode document to HTML
export function compileDocument(
  document: EditorNode,
  headSettings?: HeadSettings
): { html: string; mjml: string; errors: string[] } {
  const mjml = generateMjml(document, headSettings);
  const { html, errors } = compileMjml(mjml);
  return { html, mjml, errors };
}

// Parse MJML string back to EditorNode (simplified parser)
export function parseMjmlToNode(mjmlString: string): EditorNode | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(mjmlString, 'text/xml');

    const mjmlElement = doc.querySelector('mjml');
    if (!mjmlElement) return null;

    const bodyElement = mjmlElement.querySelector('mj-body');
    if (!bodyElement) return null;

    return parseElement(bodyElement);
  } catch {
    return null;
  }
}

function parseElement(element: Element): EditorNode {
  const type = element.tagName.toLowerCase() as EditorNode['type'];
  const props: Record<string, string> = {};

  // Extract attributes
  for (const attr of Array.from(element.attributes)) {
    props[attr.name] = attr.value;
  }

  // Get text content (direct text nodes only)
  let content: string | undefined;
  const textNodes = Array.from(element.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE);
  if (textNodes.length > 0) {
    content = textNodes
      .map((n) => n.textContent?.trim())
      .filter(Boolean)
      .join('');
  }

  // Parse children
  const childElements = Array.from(element.children).filter((el) =>
    el.tagName.toLowerCase().startsWith('mj-')
  );

  const children = childElements.length > 0 ? childElements.map(parseElement) : undefined;

  return {
    id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    props,
    content,
    children,
  };
}
