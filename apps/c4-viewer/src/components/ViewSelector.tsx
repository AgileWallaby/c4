import type { StructurizrView } from "@c4/c4-parser";

interface ViewSelectorProps {
  views: StructurizrView[];
  selectedKey: string;
  onChange: (key: string) => void;
}

export function ViewSelector({
  views,
  selectedKey,
  onChange,
}: ViewSelectorProps) {
  return (
    <select
      value={selectedKey}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
      aria-label="Select view"
    >
      {views.map((view) => (
        <option key={view.key} value={view.key}>
          {view.description ? `${view.key} — ${view.description}` : view.key}
        </option>
      ))}
    </select>
  );
}
