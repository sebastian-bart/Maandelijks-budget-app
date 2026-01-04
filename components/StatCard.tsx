import React from 'react';

interface StatCardProps {
    label: string;
    value: string;
    description?: string;
    colorClass: string; // Tailwind color class like 'text-teal-600'
    bgClass: string; // Tailwind bg class like 'bg-teal-50'
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, description, colorClass, bgClass }) => {
    return (
        <div className={`p-5 rounded-2xl ${bgClass} flex flex-col justify-between h-full`}>
            <p className="text-slate-600 font-medium text-sm mb-1">{label}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${colorClass} tracking-tight`}>{value}</p>
            {description && <p className="text-xs text-slate-500 mt-2">{description}</p>}
        </div>
    );
};