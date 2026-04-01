/**
 * Markdown → EditorNode converter
 *
 * Uses emailmd's intermediate Segment representation to build
 * mail-studio EditorNode trees, bypassing MJML string round-tripping.
 *
 * Key technique: We pass a custom wrapper function to emailmd's render()
 * to capture the Segment[] intermediate before MJML compilation.
 * This gives us precise control over EditorNode construction.
 */

import {
  render,
  extractFrontmatter,
  frontmatterToThemeOverrides,
  resolveBaseTheme,
  mergeTheme,
  defaultWrapper,
  type Theme,
  type Segment,
  type WrapperMeta,
  type RenderResult,
} from "emailmd";

import type { EditorNode, HeadSettings } from "@/features/editor/types";
import { generateId } from "@/features/editor/lib/mjml";

// ============ Helpers ============

function createSection(
  children: EditorNode[],
  props: Record<string, string | number | undefined> = {}
): EditorNode {
  return {
    id: generateId(),
    type: "mj-section",
    props,
    children,
  };
}

function createColumn(
  children: EditorNode[],
  props: Record<string, string | number | undefined> = {}
): EditorNode {
  return {
    id: generateId(),
    type: "mj-column",
    props,
    children,
  };
}

function wrapInSectionColumn(
  node: EditorNode,
  sectionProps: Record<string, string | number | undefined> = {},
  columnProps: Record<string, string | number | undefined> = {}
): EditorNode {
  return createSection([createColumn([node], columnProps)], sectionProps);
}

function resolvePadding(value: string | undefined): string {
  if (value === "compact") return "12px 16px";
  if (value === "spacious") return "32px 40px";
  return "20px 24px";
}

function resolveButtonColors(
  attrs: Record<string, string>,
  theme: Theme
): { bgColor: string; textColor: string; border?: string } {
  const customColor = attrs.color;
  const variant = attrs.variant;

  if (customColor) {
    return { bgColor: customColor, textColor: "#ffffff" };
  } else if (variant === "success") {
    return { bgColor: theme.successColor, textColor: theme.successTextColor };
  } else if (variant === "danger") {
    return { bgColor: theme.dangerColor, textColor: theme.dangerTextColor };
  } else if (variant === "warning") {
    return { bgColor: theme.warningColor, textColor: theme.warningTextColor };
  } else if (variant === "secondary") {
    return {
      bgColor: "transparent",
      textColor: theme.secondaryTextColor,
      border: `2px solid ${theme.secondaryColor}`,
    };
  }
  return { bgColor: theme.buttonColor, textColor: theme.buttonTextColor };
}

// ============ Segment → EditorNode Converters ============

function convertTextSegment(segment: Segment, theme: Theme): EditorNode {
  return wrapInSectionColumn(
    {
      id: generateId(),
      type: "mj-text",
      props: {
        "font-size": theme.fontSize,
        color: theme.bodyColor,
        "line-height": theme.lineHeight,
      },
      content: segment.content,
    },
    {
      "background-color": theme.contentColor,
      padding: "0 32px",
    }
  );
}

function convertCalloutSegment(segment: Segment, theme: Theme): EditorNode {
  const bgColor = segment.attrs?.bg || theme.cardColor;
  const textColor = segment.attrs?.color || theme.bodyColor;
  const align = segment.attrs?.align || "left";
  const padding = resolvePadding(segment.attrs?.padding);

  return wrapInSectionColumn(
    {
      id: generateId(),
      type: "mj-text",
      props: {
        align,
        "font-size": theme.fontSize,
        color: textColor,
        "line-height": theme.lineHeight,
      },
      content: segment.content,
    },
    {
      "background-color": theme.contentColor,
      padding: "8px 32px",
    },
    {
      "background-color": bgColor,
      "border-radius": "8px",
      padding,
    }
  );
}

function convertCenteredSegment(segment: Segment, theme: Theme): EditorNode {
  const textColor = segment.attrs?.color || theme.bodyColor;

  return wrapInSectionColumn(
    {
      id: generateId(),
      type: "mj-text",
      props: {
        align: "center",
        "font-size": theme.fontSize,
        color: textColor,
      },
      content: segment.content,
    },
    {
      "background-color": theme.contentColor,
      padding: "8px 32px",
    }
  );
}

function convertHighlightSegment(segment: Segment, theme: Theme): EditorNode {
  const bgColor = segment.attrs?.bg || theme.brandColor;
  const textColor = segment.attrs?.color || theme.buttonTextColor;
  const align = segment.attrs?.align || "left";
  const padding = resolvePadding(segment.attrs?.padding);

  return wrapInSectionColumn(
    {
      id: generateId(),
      type: "mj-text",
      props: {
        align,
        "font-size": theme.fontSize,
        color: textColor,
        "font-weight": "600",
      },
      content: segment.content,
    },
    {
      "background-color": theme.contentColor,
      padding: "8px 32px",
    },
    {
      "background-color": bgColor,
      "border-radius": "8px",
      padding,
    }
  );
}

function convertHeaderSegment(segment: Segment, theme: Theme): EditorNode {
  const align = segment.attrs?.align || "center";
  const textColor = segment.attrs?.color || theme.bodyColor;

  return wrapInSectionColumn(
    {
      id: generateId(),
      type: "mj-text",
      props: {
        align,
        "font-size": "13px",
        color: textColor,
        "line-height": "1.5",
      },
      content: segment.content,
    },
    {
      padding: "32px 32px 24px 32px",
    }
  );
}

function convertFooterSegment(segment: Segment, theme: Theme): EditorNode {
  const align = segment.attrs?.align || "center";
  const textColor = segment.attrs?.color || theme.bodyColor;

  return wrapInSectionColumn(
    {
      id: generateId(),
      type: "mj-text",
      props: {
        align,
        "font-size": "13px",
        color: textColor,
        "line-height": "1.5",
      },
      content: segment.content,
    },
    {
      padding: "24px 32px 32px 32px",
    }
  );
}

function convertHrSegment(theme: Theme): EditorNode {
  return wrapInSectionColumn(
    {
      id: generateId(),
      type: "mj-divider",
      props: {
        "border-color": theme.cardColor,
        "border-width": "1px",
      },
    },
    {
      "background-color": theme.contentColor,
      padding: "8px 32px",
    }
  );
}

function convertButtonSegment(segment: Segment, theme: Theme): EditorNode {
  const attrs = segment.attrs!;
  const { bgColor, textColor, border } = resolveButtonColors(attrs, theme);
  const isFullWidth = attrs.width === "full";

  const buttonProps: Record<string, string | number | undefined> = {
    "background-color": bgColor,
    color: textColor,
    "font-size": "16px",
    "font-weight": "600",
    "border-radius": "8px",
    "inner-padding": "14px 32px",
    href: attrs.href,
  };
  if (border) buttonProps.border = border;
  if (isFullWidth) buttonProps.width = "100%";

  return wrapInSectionColumn(
    {
      id: generateId(),
      type: "mj-button",
      props: buttonProps,
      content: attrs.text,
    },
    {
      "background-color": theme.contentColor,
      padding: "8px 32px",
    }
  );
}

function convertButtonGroupSegment(segment: Segment, theme: Theme): EditorNode {
  const columns = segment.buttons!.map((attrs) => {
    const { bgColor, textColor, border } = resolveButtonColors(attrs, theme);
    const isFullWidth = attrs.width === "full";

    const buttonProps: Record<string, string | number | undefined> = {
      "background-color": bgColor,
      color: textColor,
      "font-size": "16px",
      "font-weight": "600",
      "border-radius": "8px",
      "inner-padding": "14px 32px",
      padding: "10px 0",
      href: attrs.href,
    };
    if (border) buttonProps.border = border;
    if (isFullWidth) buttonProps.width = "100%";

    return createColumn([
      {
        id: generateId(),
        type: "mj-button",
        props: buttonProps,
        content: attrs.text,
      },
    ]);
  });

  return createSection(columns, {
    "background-color": theme.contentColor,
    padding: "8px 32px",
  });
}

function convertImageSegment(segment: Segment, theme: Theme): EditorNode {
  const attrs = segment.attrs!;
  const imageProps: Record<string, string | number | undefined> = {
    src: attrs.src,
    "fluid-on-mobile": "true",
    align: attrs.align || "center",
  };
  if (attrs.alt) imageProps.alt = attrs.alt;
  if (attrs.title) imageProps.title = attrs.title;
  if (attrs.width) {
    imageProps.width = /^\d+$/.test(attrs.width) ? `${attrs.width}px` : attrs.width;
  }
  if (attrs.href) imageProps.href = attrs.href;
  if (attrs["border-radius"]) imageProps["border-radius"] = attrs["border-radius"];

  return wrapInSectionColumn(
    {
      id: generateId(),
      type: "mj-image",
      props: imageProps,
    },
    {
      "background-color": theme.contentColor,
      padding: "8px 32px",
    }
  );
}

function convertHeroSegment(segment: Segment, theme: Theme): EditorNode {
  const url = segment.attrs?.url || "";
  return createSection(
    [
      createColumn([
        {
          id: generateId(),
          type: "mj-text",
          props: {
            align: "center",
            color: theme.buttonTextColor,
          },
          content: segment.content,
        },
      ]),
    ],
    {
      "background-url": url,
      "background-size": "cover",
      "background-repeat": "no-repeat",
      padding: "40px 32px",
    }
  );
}

function convertTableSegment(segment: Segment, theme: Theme): EditorNode {
  let tableHtml = segment.content;
  tableHtml = tableHtml
    .replace(/<\/?table>/g, "")
    .replace(/<\/?thead>/g, "")
    .replace(/<\/?tbody>/g, "")
    .trim();

  tableHtml = tableHtml.replace(
    /<th(\s+style="([^"]*)")?>/g,
    (_: string, _styleAttr: string, existingStyle: string) => {
      const base = existingStyle ? `${existingStyle};` : "";
      return `<th style="${base}font-weight:700;border-bottom:2px solid ${theme.cardColor};padding:8px 12px">`;
    }
  );

  tableHtml = tableHtml.replace(
    /<td(\s+style="([^"]*)")?>/g,
    (_: string, _styleAttr: string, existingStyle: string) => {
      const base = existingStyle ? `${existingStyle};` : "";
      return `<td style="${base}border-bottom:1px solid ${theme.cardColor};padding:8px 12px">`;
    }
  );

  return wrapInSectionColumn(
    {
      id: generateId(),
      type: "mj-table",
      props: {
        color: theme.bodyColor,
        "font-family": theme.fontFamily,
        "font-size": theme.fontSize,
        "line-height": theme.lineHeight,
        cellpadding: "0",
        cellspacing: "0",
        width: "100%",
      },
      content: tableHtml,
    },
    {
      "background-color": theme.contentColor,
      padding: "8px 32px",
    }
  );
}

function segmentToEditorNode(segment: Segment, theme: Theme): EditorNode {
  switch (segment.type) {
    case "text":
      return convertTextSegment(segment, theme);
    case "callout":
      return convertCalloutSegment(segment, theme);
    case "centered":
      return convertCenteredSegment(segment, theme);
    case "highlight":
      return convertHighlightSegment(segment, theme);
    case "header":
      return convertHeaderSegment(segment, theme);
    case "footer":
      return convertFooterSegment(segment, theme);
    case "hr":
      return convertHrSegment(theme);
    case "button":
      return convertButtonSegment(segment, theme);
    case "button-group":
      return convertButtonGroupSegment(segment, theme);
    case "image":
      return convertImageSegment(segment, theme);
    case "table":
      return convertTableSegment(segment, theme);
    case "hero":
      return convertHeroSegment(segment, theme);
  }
}

// ============ Segment Capture via Custom Wrapper ============

/**
 * Capture emailmd's intermediate Segment[] by injecting a custom wrapper.
 *
 * emailmd's render() accepts a custom WrapperFn that receives (segments, theme, meta).
 * We use this to intercept the segments while still returning valid MJML
 * so that render() completes normally and also produces the HTML preview.
 */
function renderWithSegments(markdown: string): {
  result: RenderResult;
  segments: Segment[];
  theme: Theme;
} {
  let capturedSegments: Segment[] = [];
  let capturedTheme: Theme | null = null;

  const capturingWrapper = (segments: Segment[], theme: Theme, meta?: WrapperMeta): string => {
    capturedSegments = segments;
    capturedTheme = theme;
    return defaultWrapper(segments, theme, meta);
  };

  const result = render(markdown, { wrapper: capturingWrapper });

  // Fallback: if the wrapper was never called (shouldn't happen), resolve theme manually
  if (!capturedTheme) {
    const { meta } = extractFrontmatter(markdown);
    const baseTheme = resolveBaseTheme(meta.theme as string | undefined);
    const overrides = frontmatterToThemeOverrides(meta);
    capturedTheme = mergeTheme({ ...overrides }, baseTheme);
  }

  return { result, segments: capturedSegments, theme: capturedTheme };
}

// ============ Theme → HeadSettings ============

function themeToHeadSettings(theme: Theme, meta: Record<string, unknown>): Partial<HeadSettings> {
  const headSettings: Partial<HeadSettings> = {};

  if (meta.preheader) {
    headSettings.preview = meta.preheader as string;
  }

  headSettings.attributes = [
    `<mj-all font-family="${theme.fontFamily}" />`,
    `<mj-text font-size="${theme.fontSize}" line-height="${theme.lineHeight}" color="${theme.bodyColor}" />`,
  ].join("\n");

  headSettings.styles = [
    `h1 { font-size: 32px; font-weight: 700; color: ${theme.headingColor}; margin: 0 0 12px 0; }`,
    `h2 { font-size: 24px; font-weight: 700; color: ${theme.headingColor}; margin: 0 0 10px 0; }`,
    `h3 { font-size: 20px; font-weight: 600; color: ${theme.headingColor}; margin: 0 0 8px 0; }`,
    `a { color: ${theme.brandColor}; }`,
    `blockquote { border-left: 3px solid ${theme.brandColor}; padding-left: 16px; margin: 0; }`,
    `code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; background-color: ${theme.cardColor}; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }`,
    `pre { background-color: ${theme.cardColor}; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 0; }`,
    `pre code { background-color: transparent; padding: 0; border-radius: 0; font-size: inherit; }`,
    `ul, ol { margin: 0 0 8px 0; padding-left: 24px; }`,
    `li { margin-bottom: 4px; }`,
    `.task-list-item { list-style-type: none; margin-left: -24px; }`,
    `mark { background-color: ${theme.brandColor}33; padding: 2px 4px; border-radius: 2px; }`,
  ].join("\n");

  return headSettings;
}

// ============ Public API ============

/**
 * Convert a Markdown string into a mail-studio EditorNode document tree.
 *
 * Uses a custom wrapper injected into emailmd's render() to capture the
 * intermediate Segment[], then maps each segment to EditorNode components.
 */
export function markdownToDocument(markdown: string): {
  document: EditorNode;
  headSettings: Partial<HeadSettings>;
  themeVars: Record<string, string>;
} {
  const { segments, theme } = renderWithSegments(markdown);
  const { meta } = extractFrontmatter(markdown);

  const sections = segments.map((seg) => segmentToEditorNode(seg, theme));

  const document: EditorNode = {
    id: generateId(),
    type: "mj-body",
    props: {
      "background-color": theme.backgroundColor,
      width: theme.contentWidth,
    },
    children: sections,
  };

  return {
    document,
    headSettings: themeToHeadSettings(theme, meta),
    themeVars: {
      "--heading-color": theme.headingColor,
      "--brand-color": theme.brandColor,
    },
  };
}

/**
 * Render Markdown to email HTML using emailmd (for live preview).
 */
export function renderMarkdownPreview(markdown: string): RenderResult {
  try {
    return render(markdown);
  } catch {
    return {
      html: "<p>Error rendering markdown</p>",
      text: "Error rendering markdown",
      meta: {},
    };
  }
}

/**
 * Default markdown content for new Markdown editor sessions.
 */
export const defaultMarkdown = `---
preheader: Welcome to Mail Studio
---

# Welcome to Mail Studio

Thanks for trying the **Markdown editor**! You can write emails using familiar Markdown syntax.

## Features

- **Bold**, *italic*, and ~~strikethrough~~ text
- [Links](https://example.com) and images
- Lists, tables, and blockquotes
- Custom directives for email components

> This is a blockquote — great for highlighting important information.

[Get Started](https://example.com){button}

::: footer
Built with ❤️ using Mail Studio
:::
`;
