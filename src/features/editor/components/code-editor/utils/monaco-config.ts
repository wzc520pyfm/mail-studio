/**
 * Monaco Editor Configuration
 * MJML language registration, theme, and styles
 */

import type { Monaco } from "@monaco-editor/react";

/**
 * Register MJML language with Monaco
 */
export function registerMjmlLanguage(monaco: Monaco): void {
  // Register MJML as XML-like language
  monaco.languages.register({ id: "mjml" });

  monaco.languages.setLanguageConfiguration("mjml", {
    brackets: [
      ["<", ">"],
      ["{", "}"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "<", close: ">" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: "<", close: ">" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  });

  // Set token rules for MJML (XML-like)
  monaco.languages.setMonarchTokensProvider("mjml", {
    defaultToken: "",
    tokenPostfix: ".mjml",
    ignoreCase: true,

    brackets: [
      { open: "<!--", close: "-->", token: "comment.content.mjml" },
      { open: "<![CDATA[", close: "]]>", token: "cdata.content.mjml" },
      { open: "<", close: ">", token: "tag.mjml" },
    ],

    tokenizer: {
      root: [
        [/<!--/, "comment.mjml", "@comment"],
        [/<!\[CDATA\[/, "cdata.mjml", "@cdata"],
        [/<\?/, "metatag.mjml", "@processingInstruction"],
        [/<\/?mj-[\w-]+/, { token: "tag.mjml", next: "@tag" }],
        [/<\/?[\w-]+/, { token: "tag.mjml", next: "@tag" }],
        [/[^<]+/, ""],
      ],
      comment: [
        [/-->/, "comment.mjml", "@pop"],
        [/[^-]+/, "comment.content.mjml"],
        [/./, "comment.content.mjml"],
      ],
      cdata: [
        [/\]\]>/, "cdata.mjml", "@pop"],
        [/[^\]]+/, "cdata.content.mjml"],
        [/./, "cdata.content.mjml"],
      ],
      processingInstruction: [
        [/\?>/, "metatag.mjml", "@pop"],
        [/[^?]+/, "metatag.content.mjml"],
        [/./, "metatag.content.mjml"],
      ],
      tag: [
        [/[\w-]+/, "attribute.name.mjml"],
        [/=/, "delimiter.mjml"],
        [/"[^"]*"/, "attribute.value.mjml"],
        [/'[^']*'/, "attribute.value.mjml"],
        [/\/>/, "tag.mjml", "@pop"],
        [/>/, "tag.mjml", "@pop"],
        [/\s+/, ""],
      ],
    },
  });
}

/**
 * Define MJML dark theme for Monaco
 */
export function defineMjmlTheme(monaco: Monaco): void {
  monaco.editor.defineTheme("mjml-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "tag.mjml", foreground: "569CD6" },
      { token: "attribute.name.mjml", foreground: "9CDCFE" },
      { token: "attribute.value.mjml", foreground: "CE9178" },
      { token: "comment.mjml", foreground: "6A9955" },
      { token: "comment.content.mjml", foreground: "6A9955" },
    ],
    colors: {
      "editor.background": "#1e1e1e",
    },
  });
}

/**
 * Inject CSS styles for locked region highlighting
 */
export function injectLockedRegionStyles(): void {
  const styleId = "monaco-locked-region-styles";
  if (!window.document.getElementById(styleId)) {
    const style = window.document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .locked-region-line {
        background-color: rgba(245, 158, 11, 0.08) !important;
      }
      .locked-region-glyph {
        background-color: #f59e0b;
        width: 4px !important;
        margin-left: 3px;
        border-radius: 2px;
      }
      .locked-region-glyph::before {
        content: "🔒";
        font-size: 10px;
        position: absolute;
        left: 4px;
      }
    `;
    window.document.head.appendChild(style);
  }
}

/**
 * Initialize Monaco for MJML editing
 * Call this in beforeMount callback
 */
export function initializeMonacoForMjml(monaco: Monaco): void {
  registerMjmlLanguage(monaco);
  defineMjmlTheme(monaco);
  injectLockedRegionStyles();
}

/**
 * Default Monaco editor options for MJML editing
 */
export const defaultEditorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: "on" as const,
  scrollBeyondLastLine: false,
  wordWrap: "on" as const,
  tabSize: 2,
  insertSpaces: true,
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  folding: true,
  foldingStrategy: "indentation" as const,
  renderWhitespace: "selection" as const,
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    indentation: true,
  },
  glyphMargin: true,
};
