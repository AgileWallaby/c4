import type { StructurizrView } from '@c4/c4-parser'
import { ViewSelector } from "./ViewSelector";

interface HeaderProps {
  workspaceName: string;
  views: StructurizrView[];
  selectedViewKey: string;
  onViewChange: (key: string) => void;
  onReset: () => void;
  onExportImage: () => void;
  gridRows: number;
  gridCols: number;
  minCells: number;
  onGridRowsChange: (rows: number) => void;
  onGridColsChange: (cols: number) => void;
}

export function Header({
  workspaceName,
  views,
  selectedViewKey,
  onViewChange,
  onReset,
  onExportImage,
  gridRows,
  gridCols,
  minCells,
  onGridRowsChange,
  onGridColsChange,
}: HeaderProps) {
  function handleRowsChange(newRows: number) {
    if (newRows < 1) return;
    const requiredCols = Math.ceil(minCells / newRows);
    onGridRowsChange(newRows);
    if (requiredCols > gridCols) onGridColsChange(requiredCols);
  }

  function handleColsChange(newCols: number) {
    if (newCols < 1) return;
    const requiredRows = Math.ceil(minCells / newCols);
    onGridColsChange(newCols);
    if (requiredRows > gridRows) onGridRowsChange(requiredRows);
  }

  return (
    <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
      <span className="truncate text-sm font-semibold text-gray-800">
        {workspaceName}
      </span>
      <div className="flex flex-1 justify-center">
        <ViewSelector
          views={views}
          selectedKey={selectedViewKey}
          onChange={onViewChange}
        />
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <label htmlFor="grid-rows">Rows</label>
        <input
          id="grid-rows"
          type="number"
          min={1}
          value={gridRows}
          onChange={(e) => handleRowsChange(Number(e.target.value))}
          className="w-14 rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
        <label htmlFor="grid-cols">Cols</label>
        <input
          id="grid-cols"
          type="number"
          min={1}
          value={gridCols}
          onChange={(e) => handleColsChange(Number(e.target.value))}
          className="w-14 rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={onExportImage}
        className="shrink-0 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
      >
        Export PNG
      </button>
      <button
        type="button"
        onClick={onReset}
        className="shrink-0 rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
      >
        Upload new
      </button>
    </header>
  );
}
