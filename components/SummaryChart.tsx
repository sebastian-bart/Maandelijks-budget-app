import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BudgetItem } from '../types';

interface SummaryChartProps {
    expenses: BudgetItem[];
}

const COLORS = ['#14b8a6', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export const SummaryChart: React.FC<SummaryChartProps> = ({ expenses }) => {
    // Group small expenses if list is too long? Keeping it simple for now.
    const data = expenses.map(e => ({ name: e.label, value: e.amount })).filter(e => e.value > 0);

    if (data.length === 0) return (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm italic bg-slate-50 rounded-xl">
            Voeg uitgaven toe om de grafiek te zien
        </div>
    );

    return (
        <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => `€ ${value.toFixed(2)}`}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
             </ResponsiveContainer>
        </div>
    );
};