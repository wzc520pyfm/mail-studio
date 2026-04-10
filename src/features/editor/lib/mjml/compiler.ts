/**
 * MJML Compiler - Convert EditorNode to MJML and compile to HTML
 */

import mjml2html from "mjml-browser";
import type { EditorNode, HeadSettings } from "@/features/editor/types";
import { componentDefinitions, generateId } from "@/features/editor/lib/mjml/schema";

// Self-closing MJML tags (components that don't have children or text content)
const SELF_CLOSING_TAGS = ["mj-divider", "mj-spacer", "mj-image", "mj-carousel-image"];

// Tags that should use content as HTML (not text)
const HTML_CONTENT_TAGS = ["mj-table", "mj-raw"];

// Escape HTML attribute values
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Escape HTML content
function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Clean TipTap-generated table HTML for email compatibility.
 * TipTap wraps cell content in <p> tags and adds redundant attributes
 * that cause rendering issues in email clients.
 */
function cleanTableContentForEmail(content: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = `<table><tbody>${content}</tbody></table>`;

  temp.querySelectorAll("td, th").forEach((cell) => {
    if (cell.getAttribute("colspan") === "1") cell.removeAttribute("colspan");
    if (cell.getAttribute("rowspan") === "1") cell.removeAttribute("rowspan");

    const paragraphs = Array.from(cell.querySelectorAll(":scope > p"));
    if (paragraphs.length > 0) {
      const contents = paragraphs
        .map((p) => p.innerHTML)
        .filter((c) => c && c.trim() && c !== "<br>" && c !== "<br/>");
      cell.innerHTML = contents.join("<br>");
    }

    const style = cell.getAttribute("style") || "";
    if (!style.includes("padding")) {
      (cell as HTMLElement).style.padding = "8px";
    }
  });

  temp.querySelectorAll("th").forEach((th) => {
    const style = th.getAttribute("style") || "";
    if (!style.includes("border-bottom")) {
      (th as HTMLElement).style.borderBottom = "1px solid #ddd";
    }
    if (!style.includes("text-align")) {
      (th as HTMLElement).style.textAlign = "left";
    }
  });

  const tbody = temp.querySelector("tbody");
  return tbody ? tbody.innerHTML : content;
}

// Convert EditorNode tree to MJML string
export function nodeToMjml(node: EditorNode, indent = 0): string {
  const spaces = "  ".repeat(indent);
  const { type, props, children, content, locked } = node;

  // Get component definition to check if it can have children
  const componentDef = componentDefinitions[type];
  const canHaveChildren = componentDef?.canHaveChildren ?? false;

  // Build attributes string (including locked attribute if present)
  const attrEntries = Object.entries(props)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}="${escapeAttr(String(value))}"`);

  // Add data-locked attribute for locked nodes
  if (locked) {
    attrEntries.push('data-locked="true"');
  }

  const attrs = attrEntries.join(" ");

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
  const childrenMjml = validChildren?.map((child) => nodeToMjml(child, indent + 1)).join("\n");

  // Combine parts
  if (content && !validChildren?.length) {
    // For HTML content tags, preserve the content as-is (with proper indentation)
    if (HTML_CONTENT_TAGS.includes(type)) {
      const processedContent = type === "mj-table" ? cleanTableContentForEmail(content) : content;
      const indentedContent = processedContent
        .split("\n")
        .map((line) => `${spaces}  ${line}`)
        .join("\n");
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
  const disableResponsive = headSettings?.disableResponsive ?? false;

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
      parts.push(`    <mj-font name="${escapeAttr(font.name)}" href="${escapeAttr(font.href)}" />`);
    }
  }

  // mj-breakpoint: force 1px when disableResponsive, otherwise use user setting
  if (disableResponsive) {
    parts.push(`    <mj-breakpoint width="1px" />`);
  } else if (headSettings?.breakpoint) {
    parts.push(`    <mj-breakpoint width="${escapeAttr(headSettings.breakpoint)}" />`);
  }

  // mj-attributes (use custom if provided, otherwise defaults)
  if (headSettings?.attributes) {
    const attrLines = headSettings.attributes
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const indented = attrLines.map((l) => `      ${l}`).join("\n");
    parts.push(`    <mj-attributes>\n${indented}\n    </mj-attributes>`);
  } else {
    parts.push(`    <mj-attributes>
      <mj-all font-family="Arial, sans-serif" />
      <mj-text font-size="16px" line-height="1.5" color="#333333" />
    </mj-attributes>`);
  }

  // mj-style (custom styles + defaults)
  const defaultStyles = ".link-nostyle { color: inherit; text-decoration: none; }";
  const customStyles = headSettings?.styles ? headSettings.styles : "";
  const allStyles = [defaultStyles, customStyles].filter(Boolean).join("\n      ");

  parts.push(`    <mj-style>
      ${allStyles}
    </mj-style>`);

  // When disableResponsive, inject viewport meta via mj-raw to enable scaling
  if (disableResponsive) {
    parts.push(
      `    <mj-raw>\n      <meta name="x-apple-disable-message-reformatting" />\n    </mj-raw>`
    );
  }

  return parts.join("\n");
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

// Remove data-locked attributes from MJML string before compilation
function removeLockedAttributes(mjmlString: string): string {
  // Remove data-locked="true" attribute from MJML tags
  return mjmlString.replace(/\s+data-locked="true"/g, "");
}

// Structured compilation error with line info
export interface MjmlCompileError {
  line: number;
  message: string;
  tagName: string;
  formattedMessage: string;
}

// Post-process compiled HTML to disable responsive behavior and enable scaling.
// 1. Replace viewport meta so real email clients scale the fixed-width layout.
// 2. Convert section wrapper divs from max-width (responsive) to fixed width.
// 3. Unwrap @media query rules into plain CSS so email clients that strip
//    @media blocks (e.g. Gmail) still preserve column widths.
function applyScaleModePostProcessing(html: string): string {
  // Replace the MJML default viewport meta with one that enables scaling
  html = html.replace(
    /<meta\s+name="viewport"[^>]*>/i,
    '<meta name="viewport" content="width=600, initial-scale=1" />'
  );

  // Convert section wrapper max-width to fixed width.
  // The pattern "margin:0px auto;max-width:XXpx" is unique to MJML section wrappers.
  html = html.replace(/margin:\s*0px auto;\s*max-width:\s*(\d+px)/g, "margin:0px auto;width:$1");

  // Unwrap MJML-generated @media queries: extract inner CSS rules and
  // place them as unconditional rules. This ensures column widths like
  // .mj-column-per-50 { width:50% !important } survive even when email
  // clients strip @media blocks.
  // MJML generates: @media only screen and (min-width:Xpx) { ...rules... }
  html = html.replace(
    /@media\s+only\s+screen\s+and\s+\(min-width:\s*\d+px\)\s*\{([\s\S]*?\})\s*\}/g,
    (_match, innerRules: string) => innerRules.trim()
  );

  // Remove the media attribute from conditional <style> tags.
  // MJML generates <style media="screen and (min-width:Xpx)"> for Firefox/Thunderbird.
  // We convert it to an unconditional <style> so the rules always apply.
  html = html.replace(/<style\s+media="screen and \(min-width:\s*\d+px\)">/g, "<style>");

  // Fix column inline widths: MJML sets inline width:100% as mobile fallback,
  // relying on @media rules for the actual percentage. Since email clients may
  // strip <style> blocks, we patch inline width to the real value extracted
  // from the class name (e.g. mj-column-per-50 → width:50%).
  html = html.replace(/<div\s[^>]*class="mj-column-per-[^"]*"[^>]*>/g, (tag) => {
    const classMatch = tag.match(/mj-column-per-(\d+)(?:-(\d+))?/);
    if (!classMatch) return tag;
    const pct = classMatch[2] ? `${classMatch[1]}.${classMatch[2]}` : classMatch[1];
    return tag.replace(/width:100%/, `width:${pct}%`);
  });

  // Force min-width on <body> and the email wrapper <div> so that email
  // clients like Apple Mail recognise the fixed-width layout for scaling.
  const bodyWidthMatch = html.match(/margin:0px auto;width:(\d+)px/);
  const bodyWidth = bodyWidthMatch ? bodyWidthMatch[1] : "600";

  // Patch <body> inline style
  html = html.replace(
    /<body([^>]*?)style="([^"]*)"([^>]*)>/i,
    `<body$1style="$2;min-width:${bodyWidth}px;"$3>`
  );

  // Patch the email wrapper div (the one with aria-roledescription="email")
  html = html.replace(
    /(<div\s[^>]*aria-roledescription="email"[^>]*style=")([^"]*)(")/,
    `$1$2min-width:${bodyWidth}px;$3`
  );

  return html;
}

// Compile MJML to HTML
export function compileMjml(
  mjmlString: string,
  options?: { disableResponsive?: boolean }
): {
  html: string;
  errors: string[];
  compileErrors: MjmlCompileError[];
} {
  try {
    // Remove data-locked attributes before compilation to avoid MJML validation errors
    const cleanMjml = removeLockedAttributes(mjmlString);
    const result = mjml2html(cleanMjml, {
      validationLevel: "soft",
      minify: false,
    });

    let html = result.html;

    // Post-process: convert to fixed-width scaling layout
    if (options?.disableResponsive) {
      html = applyScaleModePostProcessing(html);
    }

    return {
      html,
      errors: result.errors?.map((e) => e.formattedMessage) || [],
      compileErrors:
        result.errors?.map((e) => ({
          line: e.line,
          message: e.message,
          tagName: e.tagName,
          formattedMessage: e.formattedMessage,
        })) || [],
    };
  } catch (error) {
    return {
      html: "",
      errors: [(error as Error).message],
      compileErrors: [
        {
          line: 1,
          message: (error as Error).message,
          tagName: "",
          formattedMessage: (error as Error).message,
        },
      ],
    };
  }
}

// Compile EditorNode document to HTML
export function compileDocument(
  document: EditorNode,
  headSettings?: HeadSettings
): { html: string; mjml: string; errors: string[] } {
  const mjml = generateMjml(document, headSettings);
  const { html, errors } = compileMjml(mjml, {
    disableResponsive: headSettings?.disableResponsive,
  });
  return { html, mjml, errors };
}

// Parse MJML string back to EditorNode and HeadSettings
export interface ParseMjmlResult {
  document: EditorNode | null;
  headSettings: HeadSettings;
  errors: string[];
}

export function parseMjmlToNode(mjmlString: string): EditorNode | null {
  const result = parseMjml(mjmlString);
  return result.document;
}

export function parseMjml(mjmlString: string): ParseMjmlResult {
  const errors: string[] = [];
  const headSettings: HeadSettings = {
    title: "",
    preview: "",
    fonts: [],
    styles: "",
    breakpoint: "",
  };

  try {
    // Extract mj-attributes block before DOM parsing to avoid self-closing
    // custom element issues (e.g. <mj-body /> inside mj-attributes breaks querySelector)
    let cleanedMjml = mjmlString;
    const attributesMatch = mjmlString.match(/<mj-attributes>([\s\S]*?)<\/mj-attributes>/);
    if (attributesMatch) {
      headSettings.attributes = attributesMatch[1].trim();
      cleanedMjml = mjmlString.replace(/<mj-attributes>[\s\S]*?<\/mj-attributes>/, "");
    }

    const parser = new DOMParser();
    // Use text/html for better error tolerance
    const doc = parser.parseFromString(cleanedMjml, "text/html");

    // Try to find mjml element (case-insensitive)
    let mjmlElement = doc.querySelector("mjml");
    if (!mjmlElement) {
      // Try parsing as XML if HTML parsing didn't work
      const xmlDoc = parser.parseFromString(mjmlString, "text/xml");
      mjmlElement = xmlDoc.querySelector("mjml");
    }

    if (!mjmlElement) {
      errors.push("No <mjml> element found");
      return { document: null, headSettings, errors };
    }

    // Parse head settings (use :scope > to only match direct children)
    const headElement = mjmlElement.querySelector(":scope > mj-head");
    if (headElement) {
      // Parse title
      const titleElement = headElement.querySelector("mj-title");
      if (titleElement) {
        headSettings.title = titleElement.textContent?.trim() || "";
      }

      // Parse preview
      const previewElement = headElement.querySelector("mj-preview");
      if (previewElement) {
        headSettings.preview = previewElement.textContent?.trim() || "";
      }

      // Parse fonts
      const fontElements = headElement.querySelectorAll("mj-font");
      headSettings.fonts = Array.from(fontElements)
        .map((el) => ({
          name: el.getAttribute("name") || "",
          href: el.getAttribute("href") || "",
        }))
        .filter((f) => f.name && f.href);

      // Parse breakpoint
      const breakpointElement = headElement.querySelector("mj-breakpoint");
      if (breakpointElement) {
        const bpWidth = breakpointElement.getAttribute("width") || "";
        // Detect disableResponsive: breakpoint of 1px is the marker
        if (bpWidth === "1px") {
          headSettings.disableResponsive = true;
          headSettings.breakpoint = "";
        } else {
          headSettings.breakpoint = bpWidth;
        }
      }

      // Parse styles
      const styleElements = headElement.querySelectorAll("mj-style");
      const styles = Array.from(styleElements)
        .map((el) => el.textContent?.trim() || "")
        .filter(Boolean)
        .join("\n");
      // Remove default styles that are auto-generated
      headSettings.styles = styles.replace(/\.link-nostyle\s*\{[^}]*\}/g, "").trim();
    }

    // Parse body (use :scope > to only match direct children, not mj-body inside mj-attributes)
    const bodyElement = mjmlElement.querySelector(":scope > mj-body");
    if (!bodyElement) {
      errors.push("No <mj-body> element found");
      return { document: null, headSettings, errors };
    }

    const document = parseElement(bodyElement);
    return { document, headSettings, errors };
  } catch (e) {
    errors.push(`Parse error: ${(e as Error).message}`);
    return { document: null, headSettings, errors };
  }
}

function parseElement(element: Element): EditorNode {
  const type = element.tagName.toLowerCase() as EditorNode["type"];
  const props: Record<string, string> = {};
  let locked = false;

  // Extract attributes
  for (const attr of Array.from(element.attributes)) {
    // Handle data-locked attribute specially
    if (attr.name === "data-locked" && attr.value === "true") {
      locked = true;
    } else {
      props[attr.name] = attr.value;
    }
  }

  // Get component definition to check if it can have children
  const componentDef = componentDefinitions[type];
  const canHaveChildren = componentDef?.canHaveChildren ?? false;

  // Get text content (for components that have text content)
  let content: string | undefined;

  // Check if this is a component that should have HTML content (like mj-table, mj-raw)
  if (HTML_CONTENT_TAGS.includes(type)) {
    // Get inner HTML for these components
    content = element.innerHTML?.trim();
  } else {
    // For regular components, get direct text nodes only
    const textNodes = Array.from(element.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE);
    if (textNodes.length > 0) {
      const textContent = textNodes
        .map((n) => n.textContent)
        .filter(Boolean)
        .join("")
        .trim();
      if (textContent) {
        content = textContent;
      }
    }

    // For mj-text, also check for HTML content inside
    if (type === "mj-text" && !content) {
      const innerHTML = element.innerHTML?.trim();
      // Only use innerHTML if it contains something other than child mj-* elements
      if (innerHTML && !innerHTML.startsWith("<mj-")) {
        content = innerHTML;
      }
    }
  }

  // Parse children (only for components that can have children)
  let children: EditorNode[] | undefined;
  if (canHaveChildren) {
    const childElements = Array.from(element.children).filter((el) =>
      el.tagName.toLowerCase().startsWith("mj-")
    );
    children = childElements.length > 0 ? childElements.map(parseElement) : undefined;
  }

  return {
    id: generateId(),
    type,
    props,
    content,
    children,
    ...(locked && { locked: true }),
  };
}

// Parse HTML and try to extract content into MJML structure
// Note: This is a best-effort conversion, complex HTML may not convert well
export function parseHtmlToMjml(htmlString: string): ParseMjmlResult {
  const errors: string[] = [];
  const headSettings: HeadSettings = {
    title: "",
    preview: "",
    fonts: [],
    styles: "",
    breakpoint: "",
  };

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Extract title from HTML head
    const titleElement = doc.querySelector("head title");
    if (titleElement) {
      headSettings.title = titleElement.textContent?.trim() || "";
    }

    // Extract body content
    const bodyElement = doc.body;
    if (!bodyElement) {
      errors.push("No body element found in HTML");
      return { document: null, headSettings, errors };
    }

    // Create a basic MJML structure from HTML content
    const sections: EditorNode[] = [];

    // Try to intelligently parse the HTML structure
    const processNode = (node: Element): EditorNode | null => {
      const tagName = node.tagName.toLowerCase();

      // Skip script, style, and meta tags
      if (["script", "style", "meta", "link", "head"].includes(tagName)) {
        return null;
      }

      // Convert common HTML elements to MJML equivalents
      if (tagName === "img") {
        return {
          id: generateId(),
          type: "mj-image",
          props: {
            src: node.getAttribute("src") || "",
            alt: node.getAttribute("alt") || "",
            width: node.getAttribute("width") || "",
          },
        };
      }

      if (tagName === "a" && node.children.length === 0) {
        // Link with just text - convert to button
        return {
          id: generateId(),
          type: "mj-button",
          props: {
            href: node.getAttribute("href") || "#",
          },
          content: node.textContent?.trim() || "Link",
        };
      }

      if (tagName === "hr") {
        return {
          id: generateId(),
          type: "mj-divider",
          props: {},
        };
      }

      // Check if node has text content or children
      const hasTextContent = node.textContent?.trim();
      const hasElementChildren = node.children.length > 0;

      // For nodes with text content but no element children, create mj-text
      if (hasTextContent && !hasElementChildren) {
        return {
          id: generateId(),
          type: "mj-text",
          props: {},
          content: node.innerHTML?.trim() || node.textContent?.trim() || "",
        };
      }

      // For container elements, recursively process children
      if (hasElementChildren) {
        const childNodes: EditorNode[] = [];

        for (const child of Array.from(node.children)) {
          const childNode = processNode(child as Element);
          if (childNode) {
            childNodes.push(childNode);
          }
        }

        // If we have children, wrap them in appropriate MJML structure
        if (childNodes.length > 0) {
          // Group consecutive text nodes into columns
          return {
            id: generateId(),
            type: "mj-section",
            props: {},
            children: [
              {
                id: generateId(),
                type: "mj-column",
                props: {},
                children: childNodes,
              },
            ],
          };
        }
      }

      return null;
    };

    // Process top-level elements
    for (const child of Array.from(bodyElement.children)) {
      const section = processNode(child as Element);
      if (section) {
        // If it's already a section, add it directly
        if (section.type === "mj-section") {
          sections.push(section);
        } else {
          // Wrap in section and column
          sections.push({
            id: generateId(),
            type: "mj-section",
            props: {},
            children: [
              {
                id: generateId(),
                type: "mj-column",
                props: {},
                children: [section],
              },
            ],
          });
        }
      }
    }

    // If no sections were created, create a default one with the body content
    if (sections.length === 0 && bodyElement.textContent?.trim()) {
      sections.push({
        id: generateId(),
        type: "mj-section",
        props: { "background-color": "#ffffff" },
        children: [
          {
            id: generateId(),
            type: "mj-column",
            props: {},
            children: [
              {
                id: generateId(),
                type: "mj-text",
                props: {},
                content: bodyElement.innerHTML?.trim() || "",
              },
            ],
          },
        ],
      });
    }

    const document: EditorNode = {
      id: generateId(),
      type: "mj-body",
      props: {
        "background-color": "#f4f4f4",
        width: "600px",
      },
      children: sections,
    };

    if (sections.length === 0) {
      errors.push("No content could be extracted from HTML");
    } else {
      errors.push("HTML was converted to MJML. Some formatting may have been lost.");
    }

    return { document, headSettings, errors };
  } catch (e) {
    errors.push(`Parse error: ${(e as Error).message}`);
    return { document: null, headSettings, errors };
  }
}
