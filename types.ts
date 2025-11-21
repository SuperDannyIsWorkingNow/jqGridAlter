export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface GridColumn {
  id: string;
  label: string;
  width?: string; // Tailwind class e.g. 'w-1/4'
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  type?: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[]; // For select type
}

export interface GridRow {
  id: string | number;
  [key: string]: any;
}

export interface GridConfig {
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableEditing?: boolean;
  enableGrouping?: boolean;
  enableSubgrid?: boolean;
  pageSize?: number;
}

export interface FilterState {
  [columnId: string]: string;
}

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface GroupState {
  isGrouping: boolean;
  columnId: string | null;
}

export interface EditState {
  rowId: string | number | null;
  originalData: GridRow | null;
  newData: GridRow | null;
}

export enum AppFeature {
  OVERVIEW = 'overview',
  PAGINATION = 'pagination',
  SORTING = 'sorting',
  FILTERING = 'filtering',
  EDITING = 'editing',
  GROUPING = 'grouping',
  SUBGRID = 'subgrid',
  GENERATOR = 'generator'
}
