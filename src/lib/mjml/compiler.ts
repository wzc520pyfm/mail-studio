import mjml2html from 'mjml-browser';
import { EditorNode } from '@/types/editor';

// Convert EditorNode tree to MJML string
export function nodeToMjml(node: EditorNode, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const { type, props, children, content } = node;

  // Build attributes string
  const attrs = Object.entries(props)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  const openTag = attrs ? `<${type} ${attrs}>` : `<${type}>`;
  const closeTag = `</${type}>`;

  // Handle self-closing tags for components without children or content
  if (!children?.length && !content) {
    if (['mj-divider', 'mj-spacer', 'mj-image'].includes(type)) {
      return `${spaces}${attrs ? `<${type} ${attrs} />` : `<${type} />`}`;
    }
  }

  // Build children MJML
  const childrenMjml = children
    ?.map((child) => nodeToMjml(child, indent + 1))
    .join('\n');

  // Combine parts
  if (content && !children?.length) {
    return `${spaces}${openTag}${content}${closeTag}`;
  }

  if (childrenMjml) {
    return `${spaces}${openTag}\n${childrenMjml}\n${spaces}${closeTag}`;
  }

  return `${spaces}${openTag}${closeTag}`;
}

// Generate full MJML document from editor document
export function generateMjml(document: EditorNode): string {
  const bodyContent = nodeToMjml(document, 1);
  
  return `<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Arial, sans-serif" />
      <mj-text font-size="16px" line-height="1.5" color="#333333" />
    </mj-attributes>
    <mj-style>
      .link-nostyle { color: inherit; text-decoration: none; }
    </mj-style>
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
export function compileDocument(document: EditorNode): { html: string; mjml: string; errors: string[] } {
  const mjml = generateMjml(document);
  const { html, errors } = compileMjml(mjml);
  return { html, mjml, errors };
}

// Parse MJML string back to EditorNode (simplified parser)
export function parseMjmlToNode(mjmlString: string): EditorNode | null {
  // This is a simplified parser - in production, you'd want a more robust solution
  // For now, we'll just create a basic structure
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
  const textNodes = Array.from(element.childNodes).filter(
    (n) => n.nodeType === Node.TEXT_NODE
  );
  if (textNodes.length > 0) {
    content = textNodes.map((n) => n.textContent?.trim()).filter(Boolean).join('');
  }
  
  // Parse children
  const childElements = Array.from(element.children).filter((el) =>
    el.tagName.toLowerCase().startsWith('mj-')
  );
  
  const children = childElements.length > 0
    ? childElements.map(parseElement)
    : undefined;
  
  return {
    id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    props,
    content,
    children,
  };
}
