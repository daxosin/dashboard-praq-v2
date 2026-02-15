"use client";

import React, { useState, useMemo } from "react";

export interface ColumnDef<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T = any> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  className = "",
}: DataTableProps<T>) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filterText, setFilterText] = useState("");

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;

    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(lowerFilter)
        )
      );
    }

    if (sortKey && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal === bVal) return 0;

        const comparison = aVal > bVal ? 1 : -1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, sortKey, sortDirection, filterText]);

  return (
    <div className={className}>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Filtrer..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full max-w-xs bg-card text-text border border-brd rounded px-3 py-1.5 text-[12px] outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="bg-card border border-brd rounded-md overflow-hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`px-3 py-2 text-left font-medium text-[10px] text-mut uppercase tracking-[0.8px] border-b border-brd ${
                    col.sortable ? "cursor-pointer hover:text-text" : ""
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-accent">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-brd last:border-b-0 hover:bg-elev transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-8 text-mut text-[12px]">
            Aucune donnée trouvée
          </div>
        )}
      </div>
    </div>
  );
};
