import type { StructurizrView } from "../parser/types";
import { ViewSelector } from "./ViewSelector";

interface HeaderProps {
  workspaceName: string;
  views: StructurizrView[];
  selectedViewKey: string;
  onViewChange: (key: string) => void;
  onReset: () => void;
}

export function Header({
  workspaceName,
  views,
  selectedViewKey,
  onViewChange,
  onReset,
}: HeaderProps) {
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
