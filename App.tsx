import React, { useState, useEffect, useRef } from 'react';
import { BudgetItem, BudgetData, CURRENCY_FORMATTER } from './types';
import { loadBudgetData, saveBudgetData, resetToDefaults } from './services/storageService';
import { BudgetSection } from './components/BudgetSection';
import { StatCard } from './components/StatCard';
import { SummaryChart } from './components/SummaryChart';
import { TrendsView } from './components/TrendsView';
import { Card } from './components/Card';
import { 
    Wallet, 
    TrendingDown, 
    PiggyBank, 
    Calculator, 
    PieChart as PieChartIcon, 
    RefreshCcw,
    Baby,
    LayoutDashboard,
    List,
    Download,
    Upload,
    TrendingUp
} from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<BudgetData>(loadBudgetData());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'details' | 'trends'>('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize history if it doesn't exist (migration for old data)
  useEffect(() => {
    if (!data.history) {
        setData(prev => ({ ...prev, history: [] }));
    }
  }, []);

  useEffect(() => {
    saveBudgetData(data);
  }, [data]);

  const handleUpdate = (section: keyof BudgetData, id: string, updates: Partial<BudgetItem>) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const handleDelete = (section: keyof BudgetData, id: string) => {
    if (window.confirm("Weet je zeker dat je deze post wilt verwijderen?")) {
        setData(prev => ({
            ...prev,
            [section]: prev[section].filter(item => item.id !== id)
        }));
    }
  };

  const handleAdd = (section: keyof BudgetData) => {
    const newItem: BudgetItem = {
      id: Math.random().toString(36).substring(2, 9),
      label: 'Nieuwe post',
      amount: 0
    };
    setData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const handleReset = () => {
      if(window.confirm("Weet je zeker dat je alles wilt resetten naar de standaardwaarden? Je huidige gegevens gaan verloren.")) {
          setData(resetToDefaults());
      }
  }

  // History Actions
  const handleArchiveMonth = (label: string) => {
    const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalSavings = data.savings.reduce((sum, item) => sum + item.amount, 0);

    const newHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString(),
        label: label,
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalSavings
    };

    setData(prev => ({
        ...prev,
        history: [...(prev.history || []), newHistoryItem]
    }));
  };

  const handleDeleteHistory = (id: string) => {
    if (window.confirm("Weet je zeker dat je dit historie-item wilt verwijderen?")) {
        setData(prev => ({
            ...prev,
            history: prev.history.filter(item => item.id !== id)
        }));
    }
  };

  const handleExportCSV = () => {
    // Define headers
    const headers = ['Type', 'Omschrijving', 'Bedrag'];
    
    // Convert numbers to strings with dots (standard CSV)
    // We quote string fields to be safe against commas in labels
    const formatRow = (type: string, item: BudgetItem) => [
        `"${type}"`,
        `"${item.label}"`,
        item.amount.toString() // Keep as number for CSV, let spreadsheet handle locale or use . to , replacement if strict dutch needed
    ];

    const rows = [
        headers,
        ...data.income.map(item => formatRow('Inkomsten', item)),
        ...data.expenses.map(item => formatRow('Uitgaven', item)),
        ...data.savings.map(item => formatRow('Sparen', item))
    ];

    const csvContent = rows
        .map(row => row.join(','))
        .join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gezinsbudget_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) return;

        try {
            const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            
            // Simple CSV parser that handles quoted strings
            const parseLine = (text: string) => {
                const result: string[] = [];
                let cell = '';
                let insideQuote = false;
                
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    if (char === '"') {
                        insideQuote = !insideQuote;
                    } else if (char === ',' && !insideQuote) {
                        result.push(cell);
                        cell = '';
                    } else {
                        cell += char;
                    }
                }
                result.push(cell);
                // Clean up quotes and trim
                return result.map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            };

            const newIncome: BudgetItem[] = [];
            const newExpenses: BudgetItem[] = [];
            const newSavings: BudgetItem[] = [];

            // Skip header if present (check for 'Type' or 'Omschrijving')
            const startIdx = lines[0].toLowerCase().includes('type') ? 1 : 0;

            for (let i = startIdx; i < lines.length; i++) {
                const cols = parseLine(lines[i]);
                if (cols.length < 3) continue;

                const [type, label, amountStr] = cols;
                // Clean up amount string (handle potential currency symbols or commas if modified in excel)
                const amountClean = amountStr.replace(/[^0-9.,-]/g, '').replace(',', '.');
                const amount = parseFloat(amountClean);

                if (isNaN(amount)) continue;

                const item: BudgetItem = {
                    id: Math.random().toString(36).substring(2, 9),
                    label: label,
                    amount: amount
                };

                const typeLower = type.toLowerCase();
                if (typeLower.includes('inkomsten')) {
                    newIncome.push(item);
                } else if (typeLower.includes('uitgaven')) {
                    newExpenses.push(item);
                } else if (typeLower.includes('sparen') || typeLower.includes('saving')) {
                    newSavings.push(item);
                }
            }

            if (newIncome.length === 0 && newExpenses.length === 0 && newSavings.length === 0) {
                alert("Geen geldige data gevonden in het bestand.");
                return;
            }

            if (window.confirm(`Gevonden: \n${newIncome.length} inkomsten\n${newExpenses.length} uitgaven\n${newSavings.length} spaarposten.\n\nWil je de huidige data overschrijven?`)) {
                setData(prev => ({
                    ...prev,
                    income: newIncome,
                    expenses: newExpenses,
                    savings: newSavings
                    // Preserve history if parsing existing export that doesn't include it
                }));
            }

        } catch (err) {
            console.error(err);
            alert("Er is een fout opgetreden bij het lezen van het bestand.");
        }
        
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    reader.readAsText(file);
  };

  // Calculations
  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalSavings = data.savings.reduce((sum, item) => sum + item.amount, 0);
  
  const childcareIncome = data.income
    .filter(i => i.label.toLowerCase().includes('toeslag') || i.label.toLowerCase().includes('kind'))
    .reduce((sum, i) => sum + i.amount, 0);
  
  const childcareExpenses = data.expenses
    .filter(e => e.label.toLowerCase().includes('opvang') || e.label.toLowerCase().includes('bso'))
    .reduce((sum, e) => sum + e.amount, 0);

  const netResult = totalIncome - totalExpenses;

  // View Logic
  const showPlanner = activeTab === 'dashboard' || activeTab === 'details';
  const showTrends = activeTab === 'trends';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 sm:pb-10">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-teal-100 p-2 rounded-lg">
                    <Calculator className="text-teal-700" size={24} />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-slate-800 leading-tight">GezinsBudget</h1>
                    <div className="hidden sm:flex gap-4 mt-1 text-sm font-medium">
                        <button 
                            onClick={() => setActiveTab('dashboard')} 
                            className={`hover:text-teal-600 transition-colors ${showPlanner ? 'text-teal-600' : 'text-slate-400'}`}
                        >
                            Planner
                        </button>
                        <button 
                            onClick={() => setActiveTab('trends')} 
                            className={`hover:text-teal-600 transition-colors ${showTrends ? 'text-teal-600' : 'text-slate-400'}`}
                        >
                            Trends
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept=".csv,.txt" 
                    className="hidden" 
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-slate-400 hover:text-teal-600 text-sm flex items-center gap-1 transition-colors p-2 sm:p-0"
                    title="Importeer CSV"
                >
                    <Upload size={18} />
                    <span className="hidden sm:inline">Import</span>
                </button>
                <button 
                    onClick={handleExportCSV}
                    className="text-slate-400 hover:text-teal-600 text-sm flex items-center gap-1 transition-colors p-2 sm:p-0"
                    title="Exporteer naar CSV"
                >
                    <Download size={18} />
                    <span className="hidden sm:inline">Export</span>
                </button>
                <button 
                    onClick={handleReset}
                    className="text-slate-400 hover:text-rose-600 text-sm flex items-center gap-1 transition-colors p-2 sm:p-0"
                    title="Reset naar standaard"
                >
                    <RefreshCcw size={18} />
                    <span className="hidden sm:inline">Reset</span>
                </button>
            </div>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around z-20">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center p-2 rounded-lg w-full ${activeTab === 'dashboard' ? 'text-teal-600 bg-teal-50' : 'text-slate-400'}`}
          >
              <LayoutDashboard size={24} />
              <span className="text-xs font-medium mt-1">Overzicht</span>
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex flex-col items-center p-2 rounded-lg w-full ${activeTab === 'details' ? 'text-teal-600 bg-teal-50' : 'text-slate-400'}`}
          >
              <List size={24} />
              <span className="text-xs font-medium mt-1">Invoer</span>
          </button>
          <button 
            onClick={() => setActiveTab('trends')}
            className={`flex flex-col items-center p-2 rounded-lg w-full ${activeTab === 'trends' ? 'text-teal-600 bg-teal-50' : 'text-slate-400'}`}
          >
              <TrendingUp size={24} />
              <span className="text-xs font-medium mt-1">Trends</span>
          </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: PLANNER (Dashboard + Details) */}
        {showPlanner && (
            <>
                {/* VIEW: DASHBOARD SUB-SECTION */}
                <div className={`${activeTab === 'dashboard' ? 'block' : 'hidden'} sm:block space-y-8`}>
                    
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard 
                            label="Totaal Inkomsten" 
                            value={CURRENCY_FORMATTER.format(totalIncome)}
                            colorClass="text-teal-700"
                            bgClass="bg-teal-50"
                            description="Maandelijks beschikbaar"
                        />
                        <StatCard 
                            label="Totaal Uitgaven" 
                            value={CURRENCY_FORMATTER.format(totalExpenses)}
                            colorClass="text-rose-700"
                            bgClass="bg-rose-50"
                            description="Vaste lasten & huishouden"
                        />
                        <StatCard 
                            label="Netto Beschikbaar" 
                            value={CURRENCY_FORMATTER.format(netResult)}
                            colorClass={netResult >= 0 ? "text-emerald-700" : "text-red-600"}
                            bgClass={netResult >= 0 ? "bg-emerald-100" : "bg-red-50"}
                            description="Vrij te besteden deze maand"
                        />
                        <StatCard 
                            label="Gereserveerd Sparen" 
                            value={CURRENCY_FORMATTER.format(totalSavings)}
                            colorClass="text-sky-700"
                            bgClass="bg-sky-50"
                            description="KBS, Vakantiegeld, 13e maand"
                        />
                    </div>

                    {/* Analysis Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Visual Chart */}
                        <div className="lg:col-span-2">
                            <Card title="Uitgaven Verdeling" icon={<PieChartIcon size={20} />}>
                                <div className="flex flex-col sm:flex-row gap-8 items-center">
                                    <div className="w-full sm:w-1/2">
                                        <SummaryChart expenses={data.expenses} />
                                    </div>
                                    <div className="w-full sm:w-1/2 space-y-4">
                                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Baby className="text-orange-500" size={20} />
                                                <h4 className="font-semibold text-orange-800">Kinderopvang Check</h4>
                                            </div>
                                            <div className="text-sm space-y-1 text-slate-600">
                                                <div className="flex justify-between">
                                                    <span>Kosten:</span>
                                                    <span className="font-medium">{CURRENCY_FORMATTER.format(childcareExpenses)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Toeslagen:</span>
                                                    <span className="font-medium">{CURRENCY_FORMATTER.format(childcareIncome)}</span>
                                                </div>
                                                <div className="border-t border-orange-200 pt-1 mt-1 flex justify-between font-bold text-orange-900">
                                                    <span>Netto Eigen Bijdrage:</span>
                                                    <span>{CURRENCY_FORMATTER.format(childcareExpenses - childcareIncome)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <h4 className="font-semibold text-blue-800 mb-2">Boekhouder Tip</h4>
                                            <p className="text-sm text-blue-700 leading-relaxed">
                                                Je reserveert <strong>{CURRENCY_FORMATTER.format(totalSavings)}</strong> apart via speciale inkomsten. 
                                                Gebruik dit potje voor grote uitgaven, zodat je maandelijkse budget stabiel blijft.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Savings Summary (Visible on Desktop here) */}
                        <div className="hidden lg:block h-full">
                            <BudgetSection
                                title="Reserveringen (Sparen)"
                                items={data.savings}
                                onAdd={() => handleAdd('savings')}
                                onUpdate={(id, u) => handleUpdate('savings', id, u)}
                                onDelete={(id) => handleDelete('savings', id)}
                                colorTheme="blue"
                                icon={<PiggyBank size={20} />}
                                totalLabel="Totaal Gereserveerd"
                            />
                        </div>
                    </div>
                </div>

                {/* VIEW: INPUT LISTS SUB-SECTION (Split on Desktop, Stacked on Mobile if active) */}
                <div className={`${activeTab === 'details' ? 'block' : 'hidden'} sm:block mt-8`}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Income */}
                        <div className="h-full">
                            <BudgetSection
                                title="Maandelijkse Inkomsten"
                                items={data.income}
                                onAdd={() => handleAdd('income')}
                                onUpdate={(id, u) => handleUpdate('income', id, u)}
                                onDelete={(id) => handleDelete('income', id)}
                                colorTheme="green"
                                icon={<Wallet size={20} />}
                            />
                        </div>

                        {/* Expenses */}
                        <div className="h-full">
                            <BudgetSection
                                title="Maandelijkse Uitgaven"
                                items={data.expenses}
                                onAdd={() => handleAdd('expenses')}
                                onUpdate={(id, u) => handleUpdate('expenses', id, u)}
                                onDelete={(id) => handleDelete('expenses', id)}
                                colorTheme="red"
                                icon={<TrendingDown size={20} />}
                            />
                        </div>

                        {/* Savings (Mobile only here, desktop sees it in dashboard view usually, but good to have editable here too) */}
                        <div className="h-full lg:hidden">
                            <BudgetSection
                                title="Reserveringen (Sparen)"
                                items={data.savings}
                                onAdd={() => handleAdd('savings')}
                                onUpdate={(id, u) => handleUpdate('savings', id, u)}
                                onDelete={(id) => handleDelete('savings', id)}
                                colorTheme="blue"
                                icon={<PiggyBank size={20} />}
                                totalLabel="Totaal Gereserveerd"
                            />
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* VIEW: TRENDS */}
        {showTrends && (
            <div className="animate-fade-in">
                 <TrendsView 
                    data={data} 
                    onArchive={handleArchiveMonth} 
                    onDeleteHistory={handleDeleteHistory} 
                 />
            </div>
        )}

      </main>
    </div>
  );
};

export default App;