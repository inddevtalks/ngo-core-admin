"use client";

type TableSkeletonProps = {
  columns?: number;
  rows?: number;
  className?: string;
  selectable?: boolean;
};

export function TableSkeleton({
  columns = 6,
  rows = 8,
  className = "",
  selectable = false,
}: TableSkeletonProps) {
  const totalColumns = selectable ? columns + 1 : columns;

  return (
    <div
      className={`overflow-x-auto ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading table"
    >
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-y border-[#dfeae7] bg-[#f8faf9] text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            {Array.from({ length: totalColumns }).map((_, index) => (
              <th key={index} className="px-4 py-3">
                <div
                  className={`h-3.5 animate-pulse rounded bg-neutral-200 ${
                    selectable && index === 0 ? "w-4" : "w-16"
                  }`}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: totalColumns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3.5">
                  <div
                    className={`h-3.5 animate-pulse rounded bg-neutral-100 ${
                      selectable && colIndex === 0
                        ? "w-4"
                        : colIndex === (selectable ? 1 : 0)
                          ? "w-28"
                          : "w-20"
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function CardGridSkeleton({
  cards = 4,
  className = "",
}: {
  cards?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className}`}
      role="status"
      aria-busy="true"
    >
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-[#dfeae7] bg-white p-6"
        >
          <div className="mb-3 h-3 w-24 rounded bg-neutral-100" />
          <div className="h-8 w-32 rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 6, className = "" }: { rows?: number; className?: string }) {
  return (
    <ul
      className={`divide-y divide-neutral-100 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="space-y-2 py-3">
          <div className="h-4 w-40 animate-pulse rounded bg-neutral-100" />
          <div className="h-3.5 w-56 animate-pulse rounded bg-neutral-100" />
        </li>
      ))}
    </ul>
  );
}
