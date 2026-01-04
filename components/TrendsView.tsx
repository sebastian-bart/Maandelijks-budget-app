import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { BudgetData, CURRENCY_FORMATTER } from '../types';
import { Card } from './Card';
import { Save, Trash2, TrendingUp, Calendar, Filter, X } from 'lucide-react';

interface TrendsViewProps {
  data: BudgetData;
  onArchive: (label: string) => void;
  onDeleteHistory: (id: string) => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({ data, onArchive, onDeleteHistory }) => {
  const [viewMode, setViewMode] = useState<'history' | 'projection'>('history');
  const [filterStart, setFilterStart] = useState<string>('');
  const [filterEnd, setFilterEnd] = useState<string>('');

  // Calculations for Projection
  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalSavings = data.savings.reduce((sum, item) => sum + item.amount, 0);
  const netMonthly = totalIncome - totalExpenses;

  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      name: `Maand ${month}`,
      cumNet: netMonthly * month,
      cumSavings: totalSavings * month,
      income: totalIncome, // steady line
      expenses: totalExpenses // steady line
    };
  });

  // Filter History Data
  const filteredHistory = useMemo(() => {
    let filtered = [...data.history];
    
    // Ensure chronological order for chart
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (filterStart) {
      filtered = filtered.filter(item => item.date.slice(0, 7) >= filterStart);
    }
    if (filterEnd) {
      filtered = filtered.filter(item => item.date.slice(0, 7) <= filterEnd);
    }
    return filtered;
  }, [data.history, filterStart, filterEnd]);

  const handleArchiveClick = () => {
    const defaultLabel = new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
    const label = window.prompt("Geef een naam aan deze maand (bijv. Mei 2024):", defaultLabel);
    if (label) {
      onArchive(label);
    }
  };

  const clearFilters = () => {
    setFilterStart('');
    setFilterEnd('');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-100 shadow-lg rounded-xl">
          <p className="font-bold text-slate-700 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-500 min-w-[80px]">{entry.name}:</span>
              <span className="font-mono font-medium">{CURRENCY_FORMATTER.format(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Controls & Actions */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setViewMode('history')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'history' 
                        ? 'bg-white text-teal-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Historie
                </button>
                <button
                    onClick={() => setViewMode('projection')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'projection' 
                        ? 'bg-white text-teal-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Jaarprognose
                </button>
            </div>
            
            <button
                onClick={handleArchiveClick}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
            >
                <Save size={18} />
                <span>Archiveer Huidige Maand</span>
            </button>
        </div>
      </Card>

      {/* Main Chart View */}
      {viewMode === 'history' ? (
        <div className="space-y-6">
            {/* Date Filter Controls */}
            {data.history.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex items-center gap-2 text-slate-500 mb-2 sm:mb-0 sm:mr-2">
                        <Filter size={18} />
                        <span className="text-sm font-medium">Filter:</span>
                    </div>
                    <div className="flex-1 w-full sm:w-auto grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Van</label>
                            <input 
                                type="month" 
                                value={filterStart}
                                onChange={(e) => setFilterStart(e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Tot</label>
                            <input 
                                type="month" 
                                value={filterEnd}
                                onChange={(e) => setFilterEnd(e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
                            />
                        </div>
                    </div>
                    {(filterStart || filterEnd) && (
                        <button 
                            onClick={clearFilters}
                            className="w-full sm:w-auto p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Wis filters"
                        >
                            <X size={20} className="mx-auto" />
                        </button>
                    )}
                </div>
            )}

            <Card title="Maandelijkse Trends" icon={<TrendingUp size={20} />}>
                {data.history.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Calendar size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium">Nog geen historie beschikbaar.</p>
                        <p className="text-xs mt-1">Klik op 'Archiveer Huidige Maand' om te starten.</p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
                        <Filter size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">Geen gegevens gevonden binnen deze periode.</p>
                        <button onClick={clearFilters} className="text-teal-600 text-sm mt-2 hover:underline">Wis filters</button>
                    </div>
                ) : (
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `€${value}`} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                                <Legend wrapperStyle={{paddingTop: '20px'}} />
                                <Bar name="Inkomsten" dataKey="income" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar name="Uitgaven" dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar name="Sparen" dataKey="savings" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>

            {data.history.length > 0 && filteredHistory.length > 0 && (
                <Card title="Geschiedenis Logboek">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Periode</th>
                                    <th className="px-4 py-3 font-semibold text-right text-teal-700">Inkomsten</th>
                                    <th className="px-4 py-3 font-semibold text-right text-rose-700">Uitgaven</th>
                                    <th className="px-4 py-3 font-semibold text-right text-sky-700">Sparen</th>
                                    <th className="px-4 py-3 font-semibold text-right">Resultaat</th>
                                    <th className="px-4 py-3 text-center">Actie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[...filteredHistory].reverse().map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800">{item.label}</td>
                                        <td className="px-4 py-3 text-right font-mono">{CURRENCY_FORMATTER.format(item.income)}</td>
                                        <td className="px-4 py-3 text-right font-mono">{CURRENCY_FORMATTER.format(item.expenses)}</td>
                                        <td className="px-4 py-3 text-right font-mono">{CURRENCY_FORMATTER.format(item.savings)}</td>
                                        <td className="px-4 py-3 text-right font-mono font-semibold">
                                            {CURRENCY_FORMATTER.format(item.income - item.expenses)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => onDeleteHistory(item.id)}
                                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                                title="Verwijder item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
      ) : (
        <Card title="Prognose (indien budget gelijk blijft)" icon={<TrendingUp size={20} />}>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSave" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} interval={1} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `€${value}`} />
                        <Tooltip content={<CustomTooltip />} cursor={{stroke: '#cbd5e1', strokeWidth: 1}} />
                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                        <Area type="monotone" name="Cumulatief Sparen" dataKey="cumSavings" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSave)" strokeWidth={2} />
                        <Area type="monotone" name="Cumulatief Netto" dataKey="cumNet" stroke="#10b981" fillOpacity={1} fill="url(#colorNet)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded-xl text-sm text-slate-600">
                <p>Deze grafiek toont hoe je vermogen groeit als je 12 maanden lang dit budget aanhoudt.</p>
                <div className="flex gap-4 mt-2 font-medium">
                    <span className="text-emerald-700">Totaal Netto na 1 jaar: {CURRENCY_FORMATTER.format(netMonthly * 12)}</span>
                    <span className="text-sky-700">Totaal Gereserveerd na 1 jaar: {CURRENCY_FORMATTER.format(totalSavings * 12)}</span>
                </div>
            </div>
        </Card>
      )}
    </div>
  );
};