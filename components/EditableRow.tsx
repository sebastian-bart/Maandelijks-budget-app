import React, { useState, useEffect } from 'react';
import { BudgetItem, CURRENCY_FORMATTER } from '../types';
import { Trash2, Edit2, Check, Euro } from 'lucide-react';

interface EditableRowProps {
  item: BudgetItem;
  onUpdate: (id: string, updates: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
  accentColor: string;
}

export const EditableRow: React.FC<EditableRowProps> = ({ item, onUpdate, onDelete, accentColor }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(item.label);
  const [tempAmount, setTempAmount] = useState(item.amount.toString());

  useEffect(() => {
    setTempLabel(item.label);
    setTempAmount(item.amount.toString());
  }, [item]);

  const handleSave = () => {
    const parsedAmount = parseFloat(tempAmount.replace(',', '.'));
    onUpdate(item.id, {
      label: tempLabel,
      amount: isNaN(parsedAmount) ? 0 : parsedAmount,
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex flex-col sm:flex-row gap-2 items-center p-3 rounded-lg bg-white shadow-inner border border-${accentColor}-200 mb-2`}>
        <input
          type="text"
          value={tempLabel}
          onChange={(e) => setTempLabel(e.target.value)}
          className="flex-grow p-2 border border-slate-200 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-400"
          placeholder="Naam post"
          autoFocus
        />
        <div className="relative w-full sm:w-32">
            <Euro size={14} className="absolute left-2 top-3 text-slate-400" />
            <input
            type="number"
            value={tempAmount}
            onChange={(e) => setTempAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 pl-7 border border-slate-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="0.00"
            step="0.01"
            />
        </div>
        <div className="flex gap-1 w-full sm:w-auto justify-end">
            <button
            onClick={handleSave}
            className="p-2 bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors"
            title="Opslaan"
            >
            <Check size={18} />
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
      <div className="flex-grow pr-4">
        <p className="font-medium text-slate-700 text-sm sm:text-base">{item.label}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-700 font-mono text-sm sm:text-base">
          {CURRENCY_FORMATTER.format(item.amount)}
        </span>
        <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded"
            title="Aanpassen"
            >
            <Edit2 size={16} />
            </button>
            <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Verwijderen"
            >
            <Trash2 size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};