import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  compact?: boolean;
  itemLabel?: string;
};

export function Pagination({
  page,
  pageCount,
  total,
  onPageChange,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  compact = false,
  itemLabel = "organizations",
}: PaginationProps) {
  if (total === 0) return null;

  const singular =
    itemLabel.endsWith("s") && itemLabel.length > 1
      ? itemLabel.slice(0, -1)
      : itemLabel;

  const controls = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {onPageSizeChange && pageSize != null ? (
        <label className="inline-flex h-9 items-center gap-2 text-sm text-neutral-600">
          <span className="hidden sm:inline">Per page</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-9 cursor-pointer rounded-lg border border-neutral-200 bg-white px-2.5 text-sm font-medium text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus:border-primary-600"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-9"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      <span className="whitespace-nowrap text-sm font-medium text-neutral-700">
        Page {page} of {pageCount}
      </span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-9"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  if (compact) return controls;

  return (
    <div className="flex flex-col gap-3 border-t border-[#dfeae7] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-neutral-500">
        {total} {total === 1 ? singular : itemLabel}
      </p>
      {controls}
    </div>
  );
}
