import { GridRow, SortState, SortDirection, FilterState } from '../types';

export const sortData = (data: GridRow[], sort: SortState | null): GridRow[] => {
  if (!sort) return data;

  return [...data].sort((a, b) => {
    const valA = a[sort.columnId];
    const valB = b[sort.columnId];

    if (valA < valB) return sort.direction === SortDirection.ASC ? -1 : 1;
    if (valA > valB) return sort.direction === SortDirection.ASC ? 1 : -1;
    return 0;
  });
};

export const filterData = (data: GridRow[], filters: FilterState): GridRow[] => {
  return data.filter(row => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue) return true;
      const rowValue = String(row[key]).toLowerCase();
      return rowValue.includes(filterValue.toLowerCase());
    });
  });
};

export const paginateData = (data: GridRow[], page: number, pageSize: number): GridRow[] => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
};

export const groupData = (data: GridRow[], groupBy: string): Record<string, GridRow[]> => {
  return data.reduce((acc, row) => {
    const key = String(row[groupBy]);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(row);
    return acc;
  }, {} as Record<string, GridRow[]>);
};
