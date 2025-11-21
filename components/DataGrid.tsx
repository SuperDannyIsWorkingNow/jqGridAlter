import React, { useState, useMemo, useCallback } from 'react';
import { 
  GridColumn, 
  GridRow, 
  GridConfig, 
  SortState, 
  SortDirection, 
  FilterState, 
  EditState 
} from '../types';
import { sortData, filterData, paginateData, groupData } from '../utils/gridUtils';
import { ChevronUp, ChevronDown, Search, Edit2, Save, X, ChevronRight, ChevronDown as ExpandIcon } from 'lucide-react';

interface DataGridProps {
  columns: GridColumn[];
  data: GridRow[];
  config: GridConfig;
  onDataChange?: (newData: GridRow[]) => void;
}

export const DataGrid: React.FC<DataGridProps> = ({ columns, data, config, onDataChange }) => {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [filterState, setFilterState] = useState<FilterState>({});
  const [editState, setEditState] = useState<EditState>({ rowId: null, originalData: null, newData: null });
  const [groupColumn, setGroupColumn] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedSubgrids, setExpandedSubgrids] = useState<Set<string | number>>(new Set());

  // Process Data Pipeline
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Filtering
    if (config.enableFiltering) {
      result = filterData(result, filterState);
    }

    // 2. Sorting
    if (config.enableSorting) {
      result = sortData(result, sortState);
    }

    return result;
  }, [data, filterState, sortState, config.enableFiltering, config.enableSorting]);

  // Grouping Logic
  const groupedData = useMemo(() => {
    if (config.enableGrouping && groupColumn) {
      return groupData(processedData, groupColumn);
    }
    return null;
  }, [processedData, config.enableGrouping, groupColumn]);

  // Pagination Logic (applied to flat list or groups?)
  // For simplicity, we paginate the flat list. If grouped, we show all groups or simple pagination of keys.
  // Let's stick to flat pagination for non-grouped, and no pagination for grouped in this demo for simplicity
  // unless the user specifically requested complex grouped pagination.
  
  const paginatedData = useMemo(() => {
    if (groupedData) return []; // Handled separately in render
    if (!config.enablePagination) return processedData;
    return paginateData(processedData, currentPage, config.pageSize || 10);
  }, [processedData, currentPage, config, groupedData]);

  const totalPages = Math.ceil(processedData.length / (config.pageSize || 10));

  // Handlers
  const handleSort = (columnId: string) => {
    if (!config.enableSorting) return;
    setSortState(prev => {
      if (prev?.columnId === columnId) {
        return prev.direction === SortDirection.ASC
          ? { columnId, direction: SortDirection.DESC }
          : null;
      }
      return { columnId, direction: SortDirection.ASC };
    });
  };

  const handleFilterChange = (columnId: string, value: string) => {
    setFilterState(prev => ({ ...prev, [columnId]: value }));
    setCurrentPage(1); // Reset to page 1 on filter
  };

  const toggleGroup = (groupKey: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(groupKey)) {
      newSet.delete(groupKey);
    } else {
      newSet.add(groupKey);
    }
    setExpandedGroups(newSet);
  };

  const toggleSubgrid = (rowId: string | number) => {
      const newSet = new Set(expandedSubgrids);
      if(newSet.has(rowId)) newSet.delete(rowId);
      else newSet.add(rowId);
      setExpandedSubgrids(newSet);
  }

  // Editing Handlers
  const startEdit = (row: GridRow) => {
    if (!config.enableEditing) return;
    setEditState({
      rowId: row.id,
      originalData: { ...row },
      newData: { ...row }
    });
  };

  const cancelEdit = () => {
    setEditState({ rowId: null, originalData: null, newData: null });
  };

  const saveEdit = () => {
    if (editState.newData && onDataChange) {
      const updatedData = data.map(d => d.id === editState.rowId ? editState.newData! : d);
      onDataChange(updatedData);
    }
    cancelEdit();
  };

  const updateEditField = (key: string, val: any) => {
    setEditState(prev => ({
      ...prev,
      newData: prev.newData ? { ...prev.newData, [key]: val } : null
    }));
  };

  // Render Helper: Cell Content
  const renderCell = (row: GridRow, col: GridColumn) => {
    const isEditing = editState.rowId === row.id;

    if (isEditing && col.editable !== false && col.id !== 'id') {
      if (col.type === 'select' && col.options) {
        return (
          <select
            className="w-full p-1 border rounded bg-white text-gray-900"
            value={editState.newData?.[col.id]}
            onChange={(e) => updateEditField(col.id, e.target.value)}
          >
            {col.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }
      return (
        <input
          type={col.type === 'number' ? 'number' : 'text'}
          className="w-full p-1 border rounded bg-white text-gray-900"
          value={editState.newData?.[col.id]}
          onChange={(e) => updateEditField(col.id, col.type === 'number' ? Number(e.target.value) : e.target.value)}
        />
      );
    }
    return <span className="text-gray-700 dark:text-gray-300">{row[col.id]}</span>;
  };

  return (
    <div className="flex flex-col w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      {/* Toolbar */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {processedData.length} Records
        </div>
        
        {config.enableGrouping && (
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Group By:</span>
            <select 
              className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
              value={groupColumn || ''}
              onChange={(e) => {
                  setGroupColumn(e.target.value || null);
                  setExpandedGroups(new Set()); // Reset expansions
              }}
            >
              <option value="">None</option>
              {columns.map(col => (
                <option key={col.id} value={col.id}>{col.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-900/50">
            <tr>
              {config.enableSubgrid && <th className="w-8 p-2 border-b dark:border-gray-700"></th>}
              {columns.map(col => (
                <th 
                  key={col.id} 
                  className={`p-3 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800' : ''} ${col.width || ''}`}
                  onClick={() => col.sortable && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortState?.columnId === col.id && (
                      sortState.direction === SortDirection.ASC ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
              {config.enableEditing && <th className="w-20 border-b dark:border-gray-700 p-3">Actions</th>}
            </tr>
            {config.enableFiltering && (
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                 {config.enableSubgrid && <th className="border-b dark:border-gray-700"></th>}
                {columns.map(col => (
                  <th key={`filter-${col.id}`} className="p-2 border-b border-gray-200 dark:border-gray-700">
                    {col.filterable !== false && (
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                        <input
                          type="text"
                          placeholder="Filter..."
                          className="w-full pl-6 pr-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          value={filterState[col.id] || ''}
                          onChange={(e) => handleFilterChange(col.id, e.target.value)}
                        />
                      </div>
                    )}
                  </th>
                ))}
                {config.enableEditing && <th className="border-b dark:border-gray-700"></th>}
              </tr>
            )}
          </thead>
          
          <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
            {/* GROUPED RENDER */}
            {groupedData ? (
              Object.keys(groupedData).map(groupKey => (
                <React.Fragment key={groupKey}>
                  <tr className="bg-blue-50 dark:bg-blue-900/20 cursor-pointer" onClick={() => toggleGroup(groupKey)}>
                    <td colSpan={columns.length + (config.enableEditing ? 1 : 0) + (config.enableSubgrid ? 1 : 0)} className="p-3 font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                       {expandedGroups.has(groupKey) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                       {groupColumn}: {groupKey} ({groupedData[groupKey].length})
                    </td>
                  </tr>
                  {expandedGroups.has(groupKey) && groupedData[groupKey].map(row => (
                     <RowRenderer 
                        key={row.id} 
                        row={row} 
                        columns={columns} 
                        config={config}
                        editState={editState}
                        startEdit={startEdit}
                        saveEdit={saveEdit}
                        cancelEdit={cancelEdit}
                        renderCell={renderCell}
                        toggleSubgrid={toggleSubgrid}
                        isSubgridExpanded={expandedSubgrids.has(row.id)}
                     />
                  ))}
                </React.Fragment>
              ))
            ) : (
              /* FLAT RENDER */
              paginatedData.map(row => (
                <RowRenderer 
                    key={row.id} 
                    row={row} 
                    columns={columns} 
                    config={config}
                    editState={editState}
                    startEdit={startEdit}
                    saveEdit={saveEdit}
                    cancelEdit={cancelEdit}
                    renderCell={renderCell}
                    toggleSubgrid={toggleSubgrid}
                    isSubgridExpanded={expandedSubgrids.has(row.id)}
                 />
              ))
            )}
            
            {processedData.length === 0 && (
               <tr>
                  <td colSpan={columns.length + 2} className="p-8 text-center text-gray-400">
                     No records found.
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      {config.enablePagination && !groupedData && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
           <div className="text-xs text-gray-500 dark:text-gray-400">
             Page {currentPage} of {totalPages}
           </div>
           <div className="flex gap-1">
             <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
             >
               Previous
             </button>
             <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
             >
               Next
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

// Helper Component for Single Row
const RowRenderer: React.FC<{
    row: GridRow,
    columns: GridColumn[],
    config: GridConfig,
    editState: EditState,
    startEdit: (r: GridRow) => void,
    saveEdit: () => void,
    cancelEdit: () => void,
    renderCell: (r: GridRow, c: GridColumn) => React.ReactNode,
    toggleSubgrid: (id: string | number) => void,
    isSubgridExpanded: boolean
}> = ({ row, columns, config, editState, startEdit, saveEdit, cancelEdit, renderCell, toggleSubgrid, isSubgridExpanded }) => {
    const isEditing = editState.rowId === row.id;

    return (
        <>
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
             {config.enableSubgrid && (
                 <td className="p-3 border-b border-gray-100 dark:border-gray-800 text-center w-10">
                     <button 
                        onClick={() => toggleSubgrid(row.id)}
                        className="text-gray-400 hover:text-blue-500"
                     >
                         {isSubgridExpanded ? <ChevronDown size={16}/> : <ExpandIcon size={16} className="-rotate-90"/>}
                     </button>
                 </td>
             )}
            {columns.map(col => (
                <td key={col.id} className="p-3 border-b border-gray-100 dark:border-gray-800">
                    {renderCell(row, col)}
                </td>
            ))}
            {config.enableEditing && (
                <td className="p-3 border-b border-gray-100 dark:border-gray-800 text-right">
                    {isEditing ? (
                        <div className="flex gap-2 justify-end">
                            <button onClick={saveEdit} className="text-green-600 hover:bg-green-100 p-1 rounded"><Save size={16} /></button>
                            <button onClick={cancelEdit} className="text-red-600 hover:bg-red-100 p-1 rounded"><X size={16} /></button>
                        </div>
                    ) : (
                        <button onClick={() => startEdit(row)} className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 size={16} />
                        </button>
                    )}
                </td>
            )}
        </tr>
        {config.enableSubgrid && isSubgridExpanded && (
            <tr className="bg-gray-50 dark:bg-gray-900 inset-shadow">
                <td colSpan={columns.length + 2} className="p-4 pl-12 border-b dark:border-gray-700">
                     <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-3 shadow-inner">
                         <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Row Details (JSON)</h4>
                         <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                             {JSON.stringify(row, null, 2)}
                         </pre>
                     </div>
                </td>
            </tr>
        )}
        </>
    );
};
