"use client";

import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Extension } from "@tiptap/react";
import type { Extensions } from "@tiptap/react";

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

const SingleParagraph = Extension.create({
  name: "singleParagraph",
  addKeyboardShortcuts() {
    return {
      Enter: () => true,
    };
  },
});

export function getRichTextExtensions(placeholder?: string): Extensions {
  return [
    StarterKit.configure({
      heading: false,
      codeBlock: false,
      blockquote: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      horizontalRule: false,
      link: false,
      underline: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-blue-600 underline cursor-pointer",
      },
    }),
    TextAlign.configure({
      types: ["paragraph"],
    }),
    TextStyle,
    Color,
    ...(placeholder
      ? [
          Placeholder.configure({
            placeholder,
          }),
        ]
      : []),
  ];
}

export function getTableExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: false,
      codeBlock: false,
      blockquote: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      horizontalRule: false,
      link: false,
      underline: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
    }),
    TextStyle,
    Color,
    Table.configure({
      resizable: false,
      allowTableNodeSelection: true,
    }),
    TableRow,
    CustomTableCell,
    CustomTableHeader,
  ];
}

export function getPlainTextExtensions(placeholder?: string): Extensions {
  return [
    StarterKit.configure({
      bold: false,
      italic: false,
      strike: false,
      code: false,
      heading: false,
      codeBlock: false,
      blockquote: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      horizontalRule: false,
      link: false,
      underline: false,
    }),
    SingleParagraph,
    ...(placeholder
      ? [
          Placeholder.configure({
            placeholder,
          }),
        ]
      : []),
  ];
}
