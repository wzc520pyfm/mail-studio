"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { EditorContent, posToDOMRect } from "@tiptap/react";
import { useEditorStore } from "@/features/editor/stores";
import { TipTapToolbar } from "./TipTapToolbar";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Code,
  Plus,
  MoreHorizontal,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowDownAZ,
  ArrowDownZA,
  Paintbrush,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useTableTipTapEditor } from "./useTipTapEditor";
import { getTableExtensions } from "./extensions";

interface TipTapTableProps {
  node: EditorNode;
  isLocked?: boolean;
}

interface AxisPosition {
  start: number;
  center: number;
  end: number;
}

interface TableFrame {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

const CELL_COLORS = [
  { label: "Default", value: "" },
  { label: "Light Gray", value: "#f3f4f6" },
  { label: "Light Blue", value: "#dbeafe" },
  { label: "Light Green", value: "#dcfce7" },
  { label: "Light Yellow", value: "#fef9c3" },
  { label: "Light Red", value: "#fee2e2" },
  { label: "Light Purple", value: "#f3e8ff" },
];

export function TipTapTable({ node, isLocked = false }: TipTapTableProps) {
  const { updateNodeContent, selectedId } = useEditorStore();
  const isSelected = selectedId === node.id;
  const [isHovered, setIsHovered] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(node.content || "");
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [colPositions, setColPositions] = useState<AxisPosition[]>([]);
  const [rowPositions, setRowPositions] = useState<AxisPosition[]>([]);
  const [tableFrame, setTableFrame] = useState<TableFrame | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const isPopoverOpenRef = useRef(false);

  const isAnyMenuOpen = selectedCol !== null || selectedRow !== null;
  const showControls = (isSelected || isHovered || isAnyMenuOpen) && !isLocked;

  const extensions = useMemo(() => getTableExtensions(), []);

  const handleUpdate = useCallback(
    (rowsHtml: string) => {
      updateNodeContent(node.id, rowsHtml);
    },
    [node.id, updateNodeContent]
  );

  const editor = useTableTipTapEditor({
    content: node.content || "",
    extensions,
    editable: !isLocked,
    onUpdate: handleUpdate,
  });

  // Show formatting toolbar when text is selected inside table cells (same as TipTapText)
  useEffect(() => {
    if (!editor) return;
    const updateSelection = () => {
      const { from, to } = editor.state.selection;
      const selected = from !== to;
      setHasSelection(selected);
      if (selected) {
        const rect = posToDOMRect(editor.view, from, to);
        setToolbarPos({ top: rect.top - 48, left: rect.left + rect.width / 2 });
      }
    };
    editor.on("selectionUpdate", updateSelection);
    editor.on("blur", () => {
      if (!isPopoverOpenRef.current) {
        setTimeout(() => {
          if (!isPopoverOpenRef.current) {
            setHasSelection(false);
          }
        }, 200);
      }
    });
    return () => {
      editor.off("selectionUpdate", updateSelection);
    };
  }, [editor]);

  // Calculate column/row positions for floating selectors
  useEffect(() => {
    if (!showControls || !tableWrapperRef.current) return;

    const calculate = () => {
      const wrapper = tableWrapperRef.current;
      if (!wrapper) return;

      const table = wrapper.querySelector("table");
      if (!table) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();

      setTableFrame({
        top: tableRect.top - wrapperRect.top,
        left: tableRect.left - wrapperRect.left,
        right: tableRect.right - wrapperRect.left,
        bottom: tableRect.bottom - wrapperRect.top,
      });

      const firstRow = table.querySelector("tr");
      if (firstRow) {
        const cells = firstRow.querySelectorAll("th, td");
        const positions: AxisPosition[] = [];
        cells.forEach((cell) => {
          const rect = cell.getBoundingClientRect();
          positions.push({
            start: rect.left - wrapperRect.left,
            center: rect.left - wrapperRect.left + rect.width / 2,
            end: rect.right - wrapperRect.left,
          });
        });
        setColPositions(positions);
      }

      const rows = table.querySelectorAll("tr");
      const rPositions: AxisPosition[] = [];
      rows.forEach((row) => {
        const rect = row.getBoundingClientRect();
        rPositions.push({
          start: rect.top - wrapperRect.top,
          center: rect.top - wrapperRect.top + rect.height / 2,
          end: rect.bottom - wrapperRect.top,
        });
      });
      setRowPositions(rPositions);
    };

    requestAnimationFrame(calculate);
  }, [showControls, node.content]);

  const handlePointerMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!tableWrapperRef.current || !tableFrame) return;

      const wrapperRect = tableWrapperRef.current.getBoundingClientRect();
      const x = event.clientX - wrapperRect.left;
      const y = event.clientY - wrapperRect.top;

      const nextCol = colPositions.findIndex((pos) => x >= pos.start && x <= pos.end);
      const nextRow = rowPositions.findIndex((pos) => y >= pos.start && y <= pos.end);

      setHoveredCol(nextCol >= 0 ? nextCol : null);
      setHoveredRow(nextRow >= 0 ? nextRow : null);
    },
    [colPositions, rowPositions, tableFrame]
  );

  // Table dimension helpers
  const { rowCount, columnCount } = useMemo(() => {
    const temp = document.createElement("div");
    temp.innerHTML = `<table>${node.content || ""}</table>`;
    const rows = temp.querySelectorAll("tr");
    const cols = rows[0]?.querySelectorAll("th, td").length || 0;
    return { rowCount: rows.length || 0, columnCount: cols };
  }, [node.content]);

  // Custom table operations via ProseMirror
  const deleteSelectedRow = useCallback(
    (rowIndex: number) => {
      if (!editor || rowCount <= 1) return;
      selectCellAt(editor, rowIndex, 0);
      editor.chain().focus().deleteRow().run();
      setSelectedRow(null);
    },
    [editor, rowCount]
  );

  const deleteSelectedColumn = useCallback(
    (colIndex: number) => {
      if (!editor || columnCount <= 1) return;
      selectCellAt(editor, 0, colIndex);
      editor.chain().focus().deleteColumn().run();
      setSelectedCol(null);
    },
    [editor, columnCount]
  );

  const insertColumnBefore = useCallback(
    (colIndex: number) => {
      if (!editor) return;
      selectCellAt(editor, 0, colIndex);
      editor.chain().focus().addColumnBefore().run();
    },
    [editor]
  );

  const insertColumnAfter = useCallback(
    (colIndex: number) => {
      if (!editor) return;
      selectCellAt(editor, 0, colIndex);
      editor.chain().focus().addColumnAfter().run();
    },
    [editor]
  );

  const insertRowBefore = useCallback(
    (rowIndex: number) => {
      if (!editor) return;
      selectCellAt(editor, rowIndex, 0);
      editor.chain().focus().addRowBefore().run();
    },
    [editor]
  );

  const insertRowAfter = useCallback(
    (rowIndex: number) => {
      if (!editor) return;
      selectCellAt(editor, rowIndex, 0);
      editor.chain().focus().addRowAfter().run();
    },
    [editor]
  );

  const moveColumnLeft = useCallback(
    (colIndex: number) => {
      if (!editor || colIndex <= 0) return;
      swapColumns(editor, colIndex, colIndex - 1);
      setSelectedCol(colIndex - 1);
    },
    [editor]
  );

  const moveColumnRight = useCallback(
    (colIndex: number) => {
      if (!editor || colIndex >= columnCount - 1) return;
      swapColumns(editor, colIndex, colIndex + 1);
      setSelectedCol(colIndex + 1);
    },
    [editor, columnCount]
  );

  const moveRowUp = useCallback(
    (rowIndex: number) => {
      if (!editor || rowIndex <= 0) return;
      swapRows(editor, rowIndex, rowIndex - 1);
      setSelectedRow(rowIndex - 1);
    },
    [editor]
  );

  const moveRowDown = useCallback(
    (rowIndex: number) => {
      if (!editor || rowIndex >= rowCount - 1) return;
      swapRows(editor, rowIndex, rowIndex + 1);
      setSelectedRow(rowIndex + 1);
    },
    [editor, rowCount]
  );

  const sortColumn = useCallback(
    (colIndex: number, direction: "asc" | "desc") => {
      if (!editor) return;
      sortTableColumn(editor, colIndex, direction);
    },
    [editor]
  );

  const setColumnAlignment = useCallback(
    (colIndex: number, align: string) => {
      if (!editor) return;
      setColumnStyle(editor, colIndex, rowCount, `text-align: ${align};`);
    },
    [editor, rowCount]
  );

  const setColumnColor = useCallback(
    (colIndex: number, color: string) => {
      if (!editor) return;
      setColumnStyle(editor, colIndex, rowCount, color ? `background-color: ${color};` : "");
    },
    [editor, rowCount]
  );

  const handleHtmlSave = useCallback(() => {
    updateNodeContent(node.id, htmlContent);
    setIsHtmlMode(false);
  }, [node.id, htmlContent, updateNodeContent]);

  if (isHtmlMode) {
    return (
      <div className="relative">
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
              <Code className="w-3 h-3" />
              Edit Table HTML
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsHtmlMode(false)}
                className="text-xs px-2 py-1 rounded hover:bg-gray-200 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleHtmlSave}
                className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="w-full h-56 p-3 text-xs font-mono outline-none resize-none bg-gray-900 text-gray-100"
            placeholder="<tr><td>Cell 1</td><td>Cell 2</td></tr>"
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  if (!editor) return null;

  const activeCol = selectedCol ?? hoveredCol;
  const activeRow = selectedRow ?? hoveredRow;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (isAnyMenuOpen) return;
        setIsHovered(false);
        setHoveredCol(null);
        setHoveredRow(null);
        setSelectedRow(null);
        setSelectedCol(null);
      }}
    >
      {/* Floating formatting toolbar when text is selected in a cell */}
      {!isLocked && hasSelection && toolbarPos && (
        <div
          className="fixed z-50"
          style={{ top: toolbarPos.top, left: toolbarPos.left, transform: "translateX(-50%)" }}
        >
          <TipTapToolbar
            editor={editor}
            onPopoverOpenChange={(open) => {
              isPopoverOpenRef.current = open;
            }}
          />
        </div>
      )}

      {/* Table editor */}
      <div
        ref={tableWrapperRef}
        className="relative pt-[10px]"
        onMouseMove={handlePointerMove}
        onClick={() => {
          setSelectedRow(null);
          setSelectedCol(null);
        }}
      >
        {/* Floating column selectors */}
        {showControls && tableFrame && activeCol !== null && colPositions[activeCol] && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div
              className="absolute pointer-events-auto"
              style={{
                left: colPositions[activeCol].center,
                top: tableFrame.top,
                transform: "translate(-50%, -50%)",
              }}
            >
              <ColumnMenu
                colIndex={activeCol}
                columnCount={columnCount}
                handleWidth={Math.max(
                  colPositions[activeCol].end - colPositions[activeCol].start,
                  0
                )}
                onMoveLeft={() => moveColumnLeft(activeCol)}
                onMoveRight={() => moveColumnRight(activeCol)}
                onInsertLeft={() => insertColumnBefore(activeCol)}
                onInsertRight={() => insertColumnAfter(activeCol)}
                onDelete={() => deleteSelectedColumn(activeCol)}
                onSortAsc={() => sortColumn(activeCol, "asc")}
                onSortDesc={() => sortColumn(activeCol, "desc")}
                onSetAlignment={(align) => setColumnAlignment(activeCol, align)}
                onSetColor={(color) => setColumnColor(activeCol, color)}
                onOpenChange={(open) => {
                  if (open) {
                    setSelectedCol(activeCol);
                    setSelectedRow(null);
                    return;
                  }
                  setSelectedCol(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Floating row selectors */}
        {showControls && tableFrame && activeRow !== null && rowPositions[activeRow] && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div
              className="absolute pointer-events-auto"
              style={{
                left: tableFrame.left,
                top: rowPositions[activeRow].center,
                transform: "translate(-50%, -50%)",
              }}
            >
              <RowMenu
                rowIndex={activeRow}
                rowCount={rowCount}
                handleHeight={Math.max(
                  rowPositions[activeRow].end - rowPositions[activeRow].start,
                  0
                )}
                onMoveUp={() => moveRowUp(activeRow)}
                onMoveDown={() => moveRowDown(activeRow)}
                onInsertAbove={() => insertRowBefore(activeRow)}
                onInsertBelow={() => insertRowAfter(activeRow)}
                onDelete={() => deleteSelectedRow(activeRow)}
                onOpenChange={(open) => {
                  if (open) {
                    setSelectedRow(activeRow);
                    setSelectedCol(null);
                    return;
                  }
                  setSelectedRow(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Add column / row buttons following hover position */}
        {showControls && tableFrame && activeRow !== null && rowPositions[activeRow] && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div
              className="absolute pointer-events-auto"
              style={{
                left: tableFrame.right,
                top: tableFrame.top,
                height: Math.max(tableFrame.bottom - tableFrame.top, 0),
                transform: "translateX(-50%)",
              }}
            >
              <div className="relative h-full w-3.5 rounded-full bg-[#efefee]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    insertColumnAfter(Math.max(columnCount - 1, 0));
                  }}
                  className="absolute left-1/2 top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[#8b8f97] transition hover:text-[#5f6368]"
                  title="Add column"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {showControls && tableFrame && activeCol !== null && colPositions[activeCol] && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div
              className="absolute pointer-events-auto"
              style={{
                left: tableFrame.left,
                top: tableFrame.bottom,
                width: Math.max(tableFrame.right - tableFrame.left, 0),
                transform: "translateY(-50%)",
              }}
            >
              <div className="relative h-3.5 w-full rounded-full bg-[#efefee]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    insertRowAfter(Math.max(rowCount - 1, 0));
                  }}
                  className="absolute left-1/2 top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[#8b8f97] transition hover:text-[#5f6368]"
                  title="Add row"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Column Menu                                                         */
/* ------------------------------------------------------------------ */

interface ColumnMenuProps {
  colIndex: number;
  columnCount: number;
  handleWidth: number;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onInsertLeft: () => void;
  onInsertRight: () => void;
  onDelete: () => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  onSetAlignment: (align: string) => void;
  onSetColor: (color: string) => void;
  onOpenChange: (open: boolean) => void;
}

function ColumnMenu({
  colIndex,
  columnCount,
  handleWidth,
  onMoveLeft,
  onMoveRight,
  onInsertLeft,
  onInsertRight,
  onDelete,
  onSortAsc,
  onSortDesc,
  onSetAlignment,
  onSetColor,
  onOpenChange,
}: ColumnMenuProps) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-3.5 items-center justify-center rounded-full bg-[#efefee] text-[#5f6368] transition hover:bg-[#e7e7e6]"
          style={{ width: handleWidth }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-2.5 w-2.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        <DropdownMenuItem className="text-xs" onClick={onMoveLeft} disabled={colIndex === 0}>
          <ChevronLeft className="w-3 h-3 mr-2" />
          Move column left
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-xs"
          onClick={onMoveRight}
          disabled={colIndex === columnCount - 1}
        >
          <ChevronRight className="w-3 h-3 mr-2" />
          Move column right
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs" onClick={onInsertLeft}>
          <Plus className="w-3 h-3 mr-2" />
          Insert column left
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={onInsertRight}>
          <Plus className="w-3 h-3 mr-2" />
          Insert column right
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs" onClick={onSortAsc}>
          <ArrowDownAZ className="w-3 h-3 mr-2" />
          Sort column A-Z
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={onSortDesc}>
          <ArrowDownZA className="w-3 h-3 mr-2" />
          Sort column Z-A
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-xs">
            <Paintbrush className="w-3 h-3 mr-2" />
            Color
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-36">
            {CELL_COLORS.map((c) => (
              <DropdownMenuItem
                key={c.value || "default"}
                className="text-xs"
                onClick={() => onSetColor(c.value)}
              >
                <div
                  className="w-4 h-4 rounded border border-gray-300 mr-2"
                  style={{ backgroundColor: c.value || "#ffffff" }}
                />
                {c.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-xs">
            <AlignLeft className="w-3 h-3 mr-2" />
            Alignment
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-36">
            <DropdownMenuItem className="text-xs" onClick={() => onSetAlignment("left")}>
              <AlignLeft className="w-3 h-3 mr-2" />
              Left
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={() => onSetAlignment("center")}>
              <AlignCenter className="w-3 h-3 mr-2" />
              Center
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={() => onSetAlignment("right")}>
              <AlignRight className="w-3 h-3 mr-2" />
              Right
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-xs text-red-600 focus:text-red-600"
          onClick={onDelete}
          disabled={columnCount <= 1}
        >
          <Trash2 className="w-3 h-3 mr-2" />
          Delete column
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Row Menu                                                            */
/* ------------------------------------------------------------------ */

interface RowMenuProps {
  rowIndex: number;
  rowCount: number;
  handleHeight: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onInsertAbove: () => void;
  onInsertBelow: () => void;
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
}

function RowMenu({
  rowIndex,
  rowCount,
  handleHeight,
  onMoveUp,
  onMoveDown,
  onInsertAbove,
  onInsertBelow,
  onDelete,
  onOpenChange,
}: RowMenuProps) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-3.5 items-center justify-center rounded-full bg-[#efefee] text-[#5f6368] transition hover:bg-[#e7e7e6]"
          style={{ height: handleHeight }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-2.5 w-2.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuItem className="text-xs" onClick={onMoveUp} disabled={rowIndex === 0}>
          <ChevronUp className="w-3 h-3 mr-2" />
          Move row up
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-xs"
          onClick={onMoveDown}
          disabled={rowIndex === rowCount - 1}
        >
          <ChevronDown className="w-3 h-3 mr-2" />
          Move row down
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs" onClick={onInsertAbove}>
          <Plus className="w-3 h-3 mr-2" />
          Insert row above
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={onInsertBelow}>
          <Plus className="w-3 h-3 mr-2" />
          Insert row below
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-xs text-red-600 focus:text-red-600"
          onClick={onDelete}
          disabled={rowCount <= 1}
        >
          <Trash2 className="w-3 h-3 mr-2" />
          Delete row
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* ProseMirror helpers                                                 */
/* ------------------------------------------------------------------ */

import type { Editor } from "@tiptap/react";

function selectCellAt(editor: Editor, row: number, col: number) {
  const { doc } = editor.state;
  let currentRow = 0;

  doc.descendants((node, pos) => {
    if (node.type.name === "tableRow") {
      if (currentRow === row) {
        let currentCol = 0;
        node.forEach((cell, offset) => {
          if (currentCol === col) {
            editor.commands.setTextSelection(pos + offset + 2);
          }
          currentCol++;
        });
      }
      currentRow++;
      return false;
    }
    return true;
  });
}

function swapColumns(editor: Editor, col1: number, col2: number) {
  const html = editor.getHTML();
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const rows = temp.querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll("th, td"));
    if (cells[col1] && cells[col2]) {
      const parent = cells[col1].parentNode!;
      if (col1 < col2) {
        parent.insertBefore(cells[col2], cells[col1]);
      } else {
        parent.insertBefore(cells[col1], cells[col2]);
      }
    }
  });

  editor.commands.setContent(temp.innerHTML);
}

function swapRows(editor: Editor, row1: number, row2: number) {
  const html = editor.getHTML();
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const tbody = temp.querySelector("tbody") || temp;
  const rows = Array.from(tbody.querySelectorAll(":scope > tr"));

  if (rows[row1] && rows[row2]) {
    if (row1 < row2) {
      tbody.insertBefore(rows[row2], rows[row1]);
    } else {
      tbody.insertBefore(rows[row1], rows[row2]);
    }
  }

  editor.commands.setContent(temp.innerHTML);
}

function sortTableColumn(editor: Editor, colIndex: number, direction: "asc" | "desc") {
  const html = editor.getHTML();
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const tbody = temp.querySelector("tbody") || temp;
  const rows = Array.from(tbody.querySelectorAll(":scope > tr"));

  // Separate header rows (rows with <th>) from data rows
  const headerRows = rows.filter((r) => r.querySelector("th"));
  const dataRows = rows.filter((r) => !r.querySelector("th"));

  dataRows.sort((a, b) => {
    const cellsA = a.querySelectorAll("td");
    const cellsB = b.querySelectorAll("td");
    const textA = (cellsA[colIndex]?.textContent || "").toLowerCase();
    const textB = (cellsB[colIndex]?.textContent || "").toLowerCase();
    const cmp = textA.localeCompare(textB);
    return direction === "asc" ? cmp : -cmp;
  });

  // Clear and re-append
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
  headerRows.forEach((r) => tbody.appendChild(r));
  dataRows.forEach((r) => tbody.appendChild(r));

  editor.commands.setContent(temp.innerHTML);
}

function setColumnStyle(editor: Editor, colIndex: number, rowCount: number, styleStr: string) {
  const html = editor.getHTML();
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const rows = temp.querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("th, td");
    const cell = cells[colIndex] as HTMLElement | undefined;
    if (cell) {
      if (styleStr) {
        // Merge styles: parse existing, override matching properties
        const existing = parseInlineStyle(cell.getAttribute("style") || "");
        const incoming = parseInlineStyle(styleStr);
        const merged = { ...existing, ...incoming };
        cell.setAttribute("style", serializeStyle(merged));
      } else {
        cell.removeAttribute("style");
      }
    }
  });

  editor.commands.setContent(temp.innerHTML);
}

function parseInlineStyle(style: string): Record<string, string> {
  const result: Record<string, string> = {};
  style.split(";").forEach((part) => {
    const [key, ...rest] = part.split(":");
    if (key?.trim() && rest.length) {
      result[key.trim()] = rest.join(":").trim();
    }
  });
  return result;
}

function serializeStyle(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ")
    .concat(";");
}
