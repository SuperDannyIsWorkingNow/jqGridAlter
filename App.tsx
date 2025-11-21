import React, { useState, useEffect } from 'react';
import { DataGrid } from './components/DataGrid';
import { GridRow, GridConfig, AppFeature, GridColumn } from './types';
import { generateMockData, explainFeature } from './services/geminiService';
import { 
    Layout, 
    Table, 
    Filter, 
    ArrowUpDown, 
    Layers, 
    Edit, 
    ChevronRight,
    Database,
    Wand2,
    Grid as GridIcon
} from 'lucide-react';

const INITIAL_DATA: GridRow[] = [
  { id: 1, name: 'Alice Johnson', role: 'Developer', status: 'Active', salary: 85000, joinDate: '2023-01-15' },
  { id: 2, name: 'Bob Smith', role: 'Designer', status: 'Active', salary: 72000, joinDate: '2022-11-03' },
  { id: 3, name: 'Charlie Brown', role: 'Manager', status: 'Inactive', salary: 95000, joinDate: '2020-06-20' },
  { id: 4, name: 'Diana Ross', role: 'Developer', status: 'Pending', salary: 80000, joinDate: '2023-03-10' },
  { id: 5, name: 'Edward Norton', role: 'QA', status: 'Active', salary: 65000, joinDate: '2021-08-14' },
  { id: 6, name: 'Frank Ocean', role: 'Designer', status: 'Active', salary: 75000, joinDate: '2019-05-22' },
  { id: 7, name: 'Gina Linetti', role: 'HR', status: 'Active', salary: 68000, joinDate: '2021-02-11' },
  { id: 8, name: 'Harry Potter', role: 'Security', status: 'Inactive', salary: 60000, joinDate: '2018-09-01' },
  { id: 9, name: 'Ian McKellen', role: 'Manager', status: 'Active', salary: 120000, joinDate: '2015-12-12' },
  { id: 10, name: 'Jack Black', role: 'Developer', status: 'Active', salary: 90000, joinDate: '2022-01-30' },
  { id: 11, name: 'Kate Winslet', role: 'QA', status: 'Pending', salary: 66000, joinDate: '2023-04-05' },
  { id: 12, name: 'Leo DiCaprio', role: 'Designer', status: 'Active', salary: 88000, joinDate: '2020-03-15' },
];

const COLUMNS: GridColumn[] = [
  { id: 'id', label: 'ID', type: 'number', width: 'w-16', sortable: true },
  { id: 'name', label: 'Name', type: 'text', sortable: true, filterable: true, editable: true },
  { id: 'role', label: 'Role', type: 'select', options: ['Developer', 'Designer', 'Manager', 'QA', 'HR', 'Security'], sortable: true, filterable: true, editable: true },
  { id: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Pending'], sortable: true, filterable: true, editable: true, width: 'w-32' },
  { id: 'salary', label: 'Salary ($)', type: 'number', sortable: true, filterable: true, editable: true, width: 'w-32' },
  { id: 'joinDate', label: 'Join Date', type: 'date', sortable: true, filterable: true, editable: true, width: 'w-40' },
];

export default function App() {
  const [activeFeature, setActiveFeature] = useState<AppFeature>(AppFeature.OVERVIEW);
  const [gridData, setGridData] = useState<GridRow[]>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>("");
  const [prompt, setPrompt] = useState("");

  // Determine config based on active feature
  const config: GridConfig = {
    enablePagination: activeFeature === AppFeature.OVERVIEW || activeFeature === AppFeature.PAGINATION || activeFeature === AppFeature.GENERATOR,
    enableSorting: activeFeature === AppFeature.OVERVIEW || activeFeature === AppFeature.SORTING || activeFeature === AppFeature.GENERATOR,
    enableFiltering: activeFeature === AppFeature.OVERVIEW || activeFeature === AppFeature.FILTERING || activeFeature === AppFeature.GENERATOR,
    enableEditing: activeFeature === AppFeature.OVERVIEW || activeFeature === AppFeature.EDITING || activeFeature === AppFeature.GENERATOR,
    enableGrouping: activeFeature === AppFeature.OVERVIEW || activeFeature === AppFeature.GROUPING,
    enableSubgrid: activeFeature === AppFeature.OVERVIEW || activeFeature === AppFeature.SUBGRID,
    pageSize: 8
  };

  useEffect(() => {
    if (activeFeature !== AppFeature.GENERATOR && activeFeature !== AppFeature.OVERVIEW) {
        setLoading(true);
        explainFeature(activeFeature).then(text => {
            setExplanation(text);
            setLoading(false);
        });
    } else {
        setExplanation("Interact with the grid below to explore the features.");
    }
  }, [activeFeature]);

  const handleGenerateData = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const newData = await generateMockData(prompt, 15);
      if (newData.length > 0) {
          setGridData(newData);
          // If API key is missing or request fails, we might get empty, but let's assume success or catch block.
      }
    } catch (e) {
        alert("Failed to generate data. Please check API Key configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col z-10 shadow-lg flex-shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                <GridIcon className="text-white" size={20}/>
            </div>
            <div>
                <h1 className="font-bold text-lg leading-none">GridMaster</h1>
                <span className="text-xs text-gray-400 font-medium">jqGrid Modernized</span>
            </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <SidebarItem 
            icon={<Layout size={18}/>} 
            label="All Features Demo" 
            isActive={activeFeature === AppFeature.OVERVIEW}
            onClick={() => setActiveFeature(AppFeature.OVERVIEW)}
          />
          
          <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Core Features</div>
          
          <SidebarItem 
            icon={<ArrowUpDown size={18}/>} 
            label="Sorting" 
            isActive={activeFeature === AppFeature.SORTING}
            onClick={() => setActiveFeature(AppFeature.SORTING)}
          />
          <SidebarItem 
            icon={<Filter size={18}/>} 
            label="Filtering" 
            isActive={activeFeature === AppFeature.FILTERING}
            onClick={() => setActiveFeature(AppFeature.FILTERING)}
          />
           <SidebarItem 
            icon={<Table size={18}/>} 
            label="Pagination" 
            isActive={activeFeature === AppFeature.PAGINATION}
            onClick={() => setActiveFeature(AppFeature.PAGINATION)}
          />
          <SidebarItem 
            icon={<Edit size={18}/>} 
            label="Inline Editing" 
            isActive={activeFeature === AppFeature.EDITING}
            onClick={() => setActiveFeature(AppFeature.EDITING)}
          />
          <SidebarItem 
            icon={<Layers size={18}/>} 
            label="Grouping" 
            isActive={activeFeature === AppFeature.GROUPING}
            onClick={() => setActiveFeature(AppFeature.GROUPING)}
          />
          <SidebarItem 
            icon={<ChevronRight size={18}/>} 
            label="Subgrid / Master-Detail" 
            isActive={activeFeature === AppFeature.SUBGRID}
            onClick={() => setActiveFeature(AppFeature.SUBGRID)}
          />

          <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">AI Tools</div>
           <SidebarItem 
            icon={<Wand2 size={18}/>} 
            label="Data Generator" 
            isActive={activeFeature === AppFeature.GENERATOR}
            onClick={() => setActiveFeature(AppFeature.GENERATOR)}
            highlight
          />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 text-center">
            Uses Gemini 2.5 Flash & React 18
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
          {/* Top Header Area */}
          <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-start">
             <div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     {activeFeature === AppFeature.OVERVIEW ? 'Full Feature Showcase' : 
                      activeFeature === AppFeature.GENERATOR ? 'AI Data Generator' : 
                      `${activeFeature.charAt(0).toUpperCase() + activeFeature.slice(1)} Demo`}
                 </h2>
                 <p className="mt-1 text-gray-500 dark:text-gray-400 max-w-3xl">
                    {loading && activeFeature !== AppFeature.GENERATOR ? "Loading explanation..." : explanation}
                 </p>
             </div>
             {activeFeature === AppFeature.GENERATOR && (
                 <div className="flex gap-2 items-center">
                     <div className="relative">
                        <input 
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. 'Superheroes with powers'"
                            className="border rounded-lg pl-3 pr-10 py-2 w-64 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateData()}
                        />
                     </div>
                     <button 
                        onClick={handleGenerateData}
                        disabled={loading || !prompt}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all"
                     >
                         {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Wand2 size={16}/>}
                         Generate
                     </button>
                 </div>
             )}
          </header>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
             <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Info Cards for Specific Features */}
                {activeFeature === AppFeature.SORTING && (
                    <InfoCard title="How it works" icon={<ArrowUpDown className="text-blue-500"/>}>
                        Click on column headers (like <b>ID</b> or <b>Salary</b>) to toggle ascending/descending order. 
                        This is done client-side for immediate feedback in this demo.
                    </InfoCard>
                )}
                {activeFeature === AppFeature.FILTERING && (
                    <InfoCard title="How it works" icon={<Filter className="text-green-500"/>}>
                        Type into the input fields directly below the column headers to filter the dataset instantly. 
                        Try typing "Dev" in the <b>Role</b> column.
                    </InfoCard>
                )}
                {activeFeature === AppFeature.EDITING && (
                    <InfoCard title="How it works" icon={<Edit className="text-orange-500"/>}>
                        Hover over a row and click the <b>Pencil Icon</b> on the right. 
                        Change values (inputs match column types) and click <b>Save</b>.
                    </InfoCard>
                )}
                 {activeFeature === AppFeature.GROUPING && (
                    <InfoCard title="How it works" icon={<Layers className="text-purple-500"/>}>
                        Select a column from the <b>"Group By"</b> dropdown in the toolbar above the grid. 
                        The grid will restructure into expandable sections based on unique values in that column.
                    </InfoCard>
                )}

                {/* The Grid */}
                <div className="relative z-0"> 
                    {loading && activeFeature === AppFeature.GENERATOR && (
                        <div className="absolute inset-0 z-20 bg-white/80 dark:bg-gray-900/80 flex flex-col items-center justify-center backdrop-blur-sm rounded-lg">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="font-medium text-gray-600 dark:text-gray-300 animate-pulse">Dreaming up data...</p>
                        </div>
                    )}
                    <DataGrid 
                        columns={COLUMNS} 
                        data={gridData} 
                        config={config} 
                        onDataChange={setGridData}
                    />
                </div>

                {/* Reset Button for Fun */}
                <div className="text-center pt-4">
                    <button 
                        onClick={() => setGridData(INITIAL_DATA)}
                        className="text-sm text-gray-400 hover:text-gray-600 underline"
                    >
                        Reset to Default Data
                    </button>
                </div>
             </div>
          </div>
      </main>
    </div>
  );
}

// UI Helpers
const SidebarItem = ({ icon, label, isActive, onClick, highlight }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive 
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 shadow-sm' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
        ${highlight ? 'mt-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-900/50 text-purple-700 dark:text-purple-300' : ''}
    `}
  >
    {icon}
    {label}
  </button>
);

const InfoCard = ({ title, children, icon }: any) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm flex items-start gap-4">
        <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                {children}
            </p>
        </div>
    </div>
);
