"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Code,
  RowsIcon,
  ColumnsIcon,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditableTableProps {
  node: EditorNode;
}

interface TableCell {
  content: string;
  isHeader: boolean;
  style?: string;
}

interface TableRow {
  cells: TableCell[];
}

interface TableData {
  rows: TableRow[];
}

// Parse HTML table content to structured data
function parseTableHtml(html: string): TableData {
  const rows: TableRow[] = [];

  const temp = document.createElement("div");
  temp.innerHTML = `<table>${html}</table>`;

  const tableRows = temp.querySelectorAll("tr");
  tableRows.forEach((tr) => {
    const cells: TableCell[] = [];
    const cellElements = tr.querySelectorAll("th, td");
    cellElements.forEach((cell) => {
      cells.push({
        content: cell.innerHTML,
        isHeader: cell.tagName.toLowerCase() === "th",
        style: cell.getAttribute("style") || undefined,
      });
    });
    if (cells.length > 0) {
      rows.push({ cells });
    }
  });

  if (rows.length === 0) {
    rows.push({
      cells: [
        { content: "Header 1", isHeader: true },
        { content: "Header 2", isHeader: true },
      ],
    });
    rows.push({
      cells: [
        { content: "Cell 1", isHeader: false },
        { content: "Cell 2", isHeader: false },
      ],
    });
  }

  return { rows };
}

// Convert structured data back to HTML
function tableDataToHtml(data: TableData): string {
  return data.rows
    .map((row) => {
      const cells = row.cells
        .map((cell) => {
          const tag = cell.isHeader ? "th" : "td";
          const defaultStyle = cell.isHeader
            ? "padding: 8px; text-align: left; border-bottom: 1px solid #ddd;"
            : "padding: 8px;";
          const style = cell.style || defaultStyle;
          return `  <${tag} style="${style}">${cell.content}</${tag}>`;
        })
        .join("\n");
      return `<tr>\n${cells}\n</tr>`;
    })
    .join("\n");
}

// Normalize column count across all rows
function normalizeColumns(data: TableData): TableData {
  const maxCols = Math.max(...data.rows.map((r) => r.cells.length), 1);
  return {
    rows: data.rows.map((row, rowIndex) => ({
      cells: Array(maxCols)
        .fill(null)
        .map((_, colIndex) => {
          if (row.cells[colIndex]) {
            return row.cells[colIndex];
          }
          return {
            content: "",
            isHeader: rowIndex === 0 && data.rows[0]?.cells[0]?.isHeader,
          };
        }),
    })),
  };
}

export function EditableTable({ node }: EditableTableProps) {
  const { updateNodeContent, selectedId } = useEditorStore();
  const isSelected = selectedId === node.id;
  const [isHovered, setIsHovered] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(node.content || "");
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    row: number;
    col: number;
    x: number;
    y: number;
  } | null>(null);
  // Row/column selection (click to select entire row/column)
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Show controls when hovered or selected
  const showControls = isSelected || isHovered;

  // Parse table data from HTML content
  const tableData = useMemo(() => {
    const parsed = parseTableHtml(node.content || "");
    return normalizeColumns(parsed);
  }, [node.content]);

  const columnCount = tableData.rows[0]?.cells.length || 2;
  const rowCount = tableData.rows.length;

  // Position tracking for floating selectors
  const [rowPositions, setRowPositions] = useState<number[]>([]);
  const [colPositions, setColPositions] = useState<{ left: number; width: number }[]>([]);

  // Calculate positions when table renders or data changes
  useEffect(() => {
    const calculatePositions = () => {
      if (tableRef.current && showControls) {
        const rows = tableRef.current.querySelectorAll("tbody tr");
        const newRowPositions: number[] = [];
        const tableRect = tableRef.current.getBoundingClientRect();

        rows.forEach((row) => {
          const rect = row.getBoundingClientRect();
          newRowPositions.push(rect.top - tableRect.top + rect.height / 2);
        });
        setRowPositions(newRowPositions);

        // Get column positions from first row
        const firstRow = rows[0];
        if (firstRow) {
          const cells = firstRow.querySelectorAll("th, td");
          const newColPositions: { left: number; width: number }[] = [];
          cells.forEach((cell) => {
            const rect = cell.getBoundingClientRect();
            newColPositions.push({
              left: rect.left - tableRect.left + rect.width / 2,
              width: rect.width,
            });
          });
          setColPositions(newColPositions);
        }
      }
    };

    // Use requestAnimationFrame to ensure DOM is updated
    if (showControls) {
      requestAnimationFrame(calculatePositions);
    }
  }, [showControls, tableData]);

  // Clear selection when clicking outside
  const handleTableClick = useCallback((e: React.MouseEvent) => {
    // Only clear if clicking on table background, not on cells
    if (e.target === e.currentTarget) {
      setSelectedRow(null);
      setSelectedCol(null);
    }
  }, []);

  // Update table content
  const updateTable = useCallback(
    (newData: TableData) => {
      const normalized = normalizeColumns(newData);
      const html = tableDataToHtml(normalized);
      updateNodeContent(node.id, html);
    },
    [node.id, updateNodeContent]
  );

  // Cell content change handler
  const handleCellChange = useCallback(
    (rowIndex: number, colIndex: number, content: string) => {
      const newData: TableData = {
        rows: tableData.rows.map((row, rIdx) => ({
          cells: row.cells.map((cell, cIdx) => {
            if (rIdx === rowIndex && cIdx === colIndex) {
              return { ...cell, content };
            }
            return cell;
          }),
        })),
      };
      updateTable(newData);
    },
    [tableData, updateTable]
  );

  // Add row
  const addRow = useCallback(
    (afterIndex: number) => {
      const isHeaderRow = afterIndex === -1;
      const newRow: TableRow = {
        cells: Array(columnCount)
          .fill(null)
          .map(() => ({
            content: isHeaderRow ? "Header" : "Cell",
            isHeader: isHeaderRow,
          })),
      };
      const newRows = [...tableData.rows];
      newRows.splice(afterIndex + 1, 0, newRow);
      updateTable({ rows: newRows });
    },
    [tableData, columnCount, updateTable]
  );

  // Remove row
  const removeRow = useCallback(
    (index: number) => {
      if (tableData.rows.length <= 1) return;
      const newRows = tableData.rows.filter((_, i) => i !== index);
      updateTable({ rows: newRows });
    },
    [tableData, updateTable]
  );

  // Move row up
  const moveRowUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      const newRows = [...tableData.rows];
      [newRows[index - 1], newRows[index]] = [newRows[index], newRows[index - 1]];
      updateTable({ rows: newRows });
    },
    [tableData, updateTable]
  );

  // Move row down
  const moveRowDown = useCallback(
    (index: number) => {
      if (index >= tableData.rows.length - 1) return;
      const newRows = [...tableData.rows];
      [newRows[index], newRows[index + 1]] = [newRows[index + 1], newRows[index]];
      updateTable({ rows: newRows });
    },
    [tableData, updateTable]
  );

  // Add column
  const addColumn = useCallback(
    (afterIndex: number) => {
      const newData: TableData = {
        rows: tableData.rows.map((row, rowIdx) => ({
          cells: [
            ...row.cells.slice(0, afterIndex + 1),
            {
              content: rowIdx === 0 && row.cells[0]?.isHeader ? "Header" : "Cell",
              isHeader: rowIdx === 0 && row.cells[0]?.isHeader,
            },
            ...row.cells.slice(afterIndex + 1),
          ],
        })),
      };
      updateTable(newData);
    },
    [tableData, updateTable]
  );

  // Remove column
  const removeColumn = useCallback(
    (index: number) => {
      if (columnCount <= 1) return;
      const newData: TableData = {
        rows: tableData.rows.map((row) => ({
          cells: row.cells.filter((_, i) => i !== index),
        })),
      };
      updateTable(newData);
    },
    [tableData, columnCount, updateTable]
  );

  // Move column left
  const moveColumnLeft = useCallback(
    (index: number) => {
      if (index <= 0) return;
      const newData: TableData = {
        rows: tableData.rows.map((row) => {
          const newCells = [...row.cells];
          [newCells[index - 1], newCells[index]] = [newCells[index], newCells[index - 1]];
          return { cells: newCells };
        }),
      };
      updateTable(newData);
    },
    [tableData, updateTable]
  );

  // Move column right
  const moveColumnRight = useCallback(
    (index: number) => {
      if (index >= columnCount - 1) return;
      const newData: TableData = {
        rows: tableData.rows.map((row) => {
          const newCells = [...row.cells];
          [newCells[index], newCells[index + 1]] = [newCells[index + 1], newCells[index]];
          return { cells: newCells };
        }),
      };
      updateTable(newData);
    },
    [tableData, columnCount, updateTable]
  );

  // Toggle header cell
  const toggleHeaderCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      const newData: TableData = {
        rows: tableData.rows.map((row, rIdx) => ({
          cells: row.cells.map((cell, cIdx) => {
            if (rIdx === rowIndex && cIdx === colIndex) {
              return {
                ...cell,
                isHeader: !cell.isHeader,
                style: !cell.isHeader
                  ? "padding: 8px; text-align: left; border-bottom: 1px solid #ddd;"
                  : "padding: 8px;",
              };
            }
            return cell;
          }),
        })),
      };
      updateTable(newData);
    },
    [tableData, updateTable]
  );

  // Handle HTML mode save
  const handleHtmlSave = useCallback(() => {
    updateNodeContent(node.id, htmlContent);
    setIsHtmlMode(false);
  }, [node.id, htmlContent, updateNodeContent]);

  // Enter HTML editing mode
  const handleEnterHtmlMode = useCallback(() => {
    setHtmlContent(node.content || "");
    setIsHtmlMode(true);
  }, [node.content]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [contextMenu]);

  // HTML editing mode
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

  // Visual editing mode
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        // Clear selections when mouse leaves entirely
        setSelectedRow(null);
        setSelectedCol(null);
      }}
    >
      {/* Top toolbar - floating */}
      <div
        className={cn(
          "absolute -top-1 left-0 z-20 flex items-center gap-1 transition-opacity",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            addRow(tableData.rows.length - 1);
          }}
          className="p-1 rounded shadow-sm border bg-white/95 border-gray-200 hover:bg-gray-50"
          title="Add Row"
        >
          <div className="flex items-center gap-0.5">
            <RowsIcon className="w-3 h-3 text-gray-500" />
            <Plus className="w-2.5 h-2.5 text-gray-500" />
          </div>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            addColumn(columnCount - 1);
          }}
          className="p-1 rounded shadow-sm border bg-white/95 border-gray-200 hover:bg-gray-50"
          title="Add Column"
        >
          <div className="flex items-center gap-0.5">
            <ColumnsIcon className="w-3 h-3 text-gray-500" />
            <Plus className="w-2.5 h-2.5 text-gray-500" />
          </div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded shadow-sm border bg-white/95 border-gray-200 hover:bg-gray-50"
            >
              <MoreHorizontal className="w-3 h-3 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem className="text-xs" disabled>
              Table ({rowCount} × {columnCount})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onClick={() => addRow(tableData.rows.length - 1)}>
              <RowsIcon className="w-3 h-3 mr-2" />
              Add Row
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={() => addColumn(columnCount - 1)}>
              <ColumnsIcon className="w-3 h-3 mr-2" />
              Add Column
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onClick={handleEnterHtmlMode}>
              <Code className="w-3 h-3 mr-2" />
              Edit HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table content - stable size */}
      <div className="pt-6 relative" onClick={handleTableClick}>
        {/* Floating column selectors - inside table area, at top */}
        {showControls && colPositions.length > 0 && (
          <div className="absolute top-1 left-0 right-0 z-20 pointer-events-none">
            {colPositions.map((pos, colIndex) => (
              <div
                key={colIndex}
                className="absolute pointer-events-auto"
                style={{ left: pos.left, transform: "translateX(-50%)" }}
              >
                {selectedCol === colIndex ? (
                  <div className="flex items-center gap-0.5 bg-white rounded shadow-lg border border-blue-300 p-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveColumnLeft(colIndex);
                      }}
                      disabled={colIndex === 0}
                      className="p-0.5 rounded hover:bg-blue-100 disabled:opacity-30"
                      title="Move Left"
                    >
                      <ChevronLeft className="w-3 h-3 text-blue-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeColumn(colIndex);
                        setSelectedCol(null);
                      }}
                      disabled={columnCount <= 1}
                      className="p-0.5 rounded hover:bg-red-100 disabled:opacity-30"
                      title="Delete Column"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveColumnRight(colIndex);
                      }}
                      disabled={colIndex === columnCount - 1}
                      className="p-0.5 rounded hover:bg-blue-100 disabled:opacity-30"
                      title="Move Right"
                    >
                      <ChevronRight className="w-3 h-3 text-blue-600" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCol(colIndex);
                      setSelectedRow(null);
                    }}
                    className="w-8 h-1.5 bg-gray-300 hover:bg-blue-400 rounded-full transition-colors cursor-pointer shadow-sm"
                    title="Select column"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Floating row selectors - inside table area, at left */}
        {showControls && rowPositions.length > 0 && (
          <div className="absolute top-6 left-0 z-20 pointer-events-none">
            {rowPositions.map((pos, rowIndex) => (
              <div
                key={rowIndex}
                className="absolute pointer-events-auto"
                style={{ top: pos, transform: "translateY(-50%)" }}
              >
                {selectedRow === rowIndex ? (
                  <div className="flex items-center gap-0.5 bg-white rounded shadow-lg border border-blue-300 p-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveRowUp(rowIndex);
                      }}
                      disabled={rowIndex === 0}
                      className="p-0.5 rounded hover:bg-blue-100 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3 h-3 text-blue-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRow(rowIndex);
                        setSelectedRow(null);
                      }}
                      disabled={rowCount <= 1}
                      className="p-0.5 rounded hover:bg-red-100 disabled:opacity-30"
                      title="Delete Row"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveRowDown(rowIndex);
                      }}
                      disabled={rowIndex === rowCount - 1}
                      className="p-0.5 rounded hover:bg-blue-100 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3 h-3 text-blue-600" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRow(rowIndex);
                      setSelectedCol(null);
                    }}
                    className="w-1.5 h-8 bg-gray-300 hover:bg-blue-400 rounded-full transition-colors cursor-pointer shadow-sm"
                    title="Select row"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <table ref={tableRef} className="w-full border-collapse">
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn("transition-colors", selectedRow === rowIndex && "bg-blue-50")}
              >
                {row.cells.map((cell, colIndex) => (
                  <EditableCell
                    key={`${rowIndex}-${colIndex}`}
                    cell={cell}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                    isColumnHovered={selectedCol === colIndex}
                    onSelect={() => {
                      setSelectedCell({ row: rowIndex, col: colIndex });
                      setSelectedRow(null);
                      setSelectedCol(null);
                    }}
                    onChange={(content) => handleCellChange(rowIndex, colIndex, content)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ row: rowIndex, col: colIndex, x: e.clientX, y: e.clientY });
                    }}
                    onColumnHover={() => {}}
                    onColumnLeave={() => {}}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              toggleHeaderCell(contextMenu.row, contextMenu.col);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            Toggle Header
          </button>
          <div className="h-px bg-gray-200 my-1" />
          <button
            onClick={() => {
              addRow(contextMenu.row - 1);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Insert Row Above
          </button>
          <button
            onClick={() => {
              addRow(contextMenu.row);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Insert Row Below
          </button>
          <button
            onClick={() => {
              addColumn(contextMenu.col - 1);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Insert Column Left
          </button>
          <button
            onClick={() => {
              addColumn(contextMenu.col);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Insert Column Right
          </button>
          <div className="h-px bg-gray-200 my-1" />
          <button
            onClick={() => {
              moveRowUp(contextMenu.row);
              setContextMenu(null);
            }}
            disabled={contextMenu.row === 0}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronUp className="w-4 h-4" /> Move Row Up
          </button>
          <button
            onClick={() => {
              moveRowDown(contextMenu.row);
              setContextMenu(null);
            }}
            disabled={contextMenu.row === rowCount - 1}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronDown className="w-4 h-4" /> Move Row Down
          </button>
          <button
            onClick={() => {
              moveColumnLeft(contextMenu.col);
              setContextMenu(null);
            }}
            disabled={contextMenu.col === 0}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Move Column Left
          </button>
          <button
            onClick={() => {
              moveColumnRight(contextMenu.col);
              setContextMenu(null);
            }}
            disabled={contextMenu.col === columnCount - 1}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" /> Move Column Right
          </button>
          <div className="h-px bg-gray-200 my-1" />
          <button
            onClick={() => {
              removeRow(contextMenu.row);
              setContextMenu(null);
            }}
            disabled={rowCount <= 1}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Delete Row
          </button>
          <button
            onClick={() => {
              removeColumn(contextMenu.col);
              setContextMenu(null);
            }}
            disabled={columnCount <= 1}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Delete Column
          </button>
        </div>
      )}
    </div>
  );
}

// Editable cell component
interface EditableCellProps {
  cell: TableCell;
  rowIndex: number;
  colIndex: number;
  isSelected: boolean;
  isColumnHovered: boolean;
  onSelect: () => void;
  onChange: (content: string) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onColumnHover: () => void;
  onColumnLeave: () => void;
}

function EditableCell({
  cell,
  isSelected,
  isColumnHovered,
  onSelect,
  onChange,
  onContextMenu,
  onColumnHover,
  onColumnLeave,
}: EditableCellProps) {
  const cellRef = useRef<HTMLTableCellElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleBlur = useCallback(() => {
    if (cellRef.current) {
      const newContent = cellRef.current.innerHTML;
      if (newContent !== cell.content) {
        onChange(newContent);
      }
    }
    setIsEditing(false);
  }, [cell.content, onChange]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    onSelect();
  }, [onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        cellRef.current?.blur();
      }
      if (e.key === "Escape") {
        if (cellRef.current) {
          cellRef.current.innerHTML = cell.content;
        }
        cellRef.current?.blur();
      }
    },
    [cell.content]
  );

  const Tag = cell.isHeader ? "th" : "td";

  return (
    <Tag
      ref={cellRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onContextMenu={onContextMenu}
      onMouseEnter={onColumnHover}
      onMouseLeave={onColumnLeave}
      className={cn(
        "px-2 py-1.5 text-sm transition-colors",
        cell.isHeader && "font-semibold border-b border-gray-300",
        isSelected && !isEditing && "bg-blue-50",
        isColumnHovered && !isSelected && "bg-blue-50/30",
        isEditing && "outline-none ring-2 ring-blue-400 ring-inset bg-blue-50"
      )}
      dangerouslySetInnerHTML={!isEditing ? { __html: cell.content || "&nbsp;" } : undefined}
    />
  );
}
