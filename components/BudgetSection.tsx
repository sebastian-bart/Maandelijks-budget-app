import React from 'react';
import { BudgetItem, CURRENCY_FORMATTER } from '../types';
import { EditableRow } from './EditableRow';
import { PlusCircle } from 'lucide-react';
import { Card } from './Card';

interface BudgetSectionProps {
  title: string;
  items: BudgetItem[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
  colorTheme: 'green' | 'red' | 'blue';
  icon: React.ReactNode;
  totalLabel?: string;
}

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  title,
  items,
  onAdd,
  onUpdate,
  onDelete,
  colorTheme,
  icon,
  totalLabel = "Totaal"
}) => {
  const total = items.reduce((acc, item) => acc + item.amount, 0);
  
  const themeClasses = {
    green: {
      header: 'bg-teal-50',
      text: 'text-teal-800',
      accent: 'teal',
      totalBg: 'bg-teal-50/50'
    },
    red: {
      header: 'bg-rose-50',
      text: 'text-rose-800',
      accent: 'rose',
      totalBg: 'bg-rose-50/50'
    },
    blue: {
      header: 'bg-sky-50',
      text: 'text-sky-800',
      accent: 'sky',
      totalBg: 'bg-sky-50/50'
    }
  }[colorTheme];

  return (
    <Card 
        title={title} 
        icon={icon} 
        headerColor={themeClasses.header} 
        className="h-full flex flex-col"
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow space-y-1 mb-4">
            {items.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic text-sm">
                    Nog geen posten toegevoegd.
                </div>
            ) : (
                items.map((item) => (
                    <EditableRow
                        key={item.id}
                        item={item}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        accentColor={themeClasses.accent}
                    />
                ))
            )}
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4">
            <button
                onClick={onAdd}
                className={`flex items-center gap-2 text-sm font-medium ${themeClasses.text} hover:opacity-80 transition-opacity mb-4 w-full justify-center sm:justify-start`}
            >
                <PlusCircle size={18} />
                <span>Nieuwe post toevoegen</span>
            </button>
            
            <div className={`flex justify-between items-center p-4 rounded-xl ${themeClasses.totalBg}`}>
                <span className={`font-bold ${themeClasses.text}`}>{totalLabel}</span>
                <span className={`font-bold text-lg ${themeClasses.text}`}>
                    {CURRENCY_FORMATTER.format(total)}
                </span>
            </div>
        </div>
      </div>
    </Card>
  );
};