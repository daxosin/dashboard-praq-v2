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
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full max-w-sm bg-card text-text border border-brd rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-mut"
        />
      </div>

      <div className="bg-card border border-brd rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="bg-elev/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={`px-4 py-3 text-left font-semibold text-[11px] text-mut uppercase tracking-[1px] border-b border-brd ${
                      col.sortable ? "cursor-pointer hover:text-text" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
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
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12 text-mut text-[14px]">
            Aucune donnée trouvée
          </div>
        )}
      </div>
    </div>
  );
};
