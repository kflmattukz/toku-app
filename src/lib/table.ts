import {
  createTableHook,
  tableFeatures,
  stockFeatures,
  createSortedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  filterFns,
  sortFns,
} from "@tanstack/react-table";

export const {
  useAppTable,
  createAppColumnHelper,
  useTableContext,
  useCellContext,
  useHeaderContext,
} = createTableHook({
  features: tableFeatures({
    ...stockFeatures,
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    sortFns,
    filterFns,
  }),
});
