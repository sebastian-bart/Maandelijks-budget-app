export interface BudgetItem {
  id: string;
  label: string;
  amount: number;
}

export interface BudgetHistoryItem {
  id: string;
  date: string; // ISO date string
  label: string; // Display name e.g. "Mei 2024"
  income: number;
  expenses: number;
  savings: number;
}

export interface BudgetData {
  income: BudgetItem[];
  expenses: BudgetItem[];
  savings: BudgetItem[]; // Reserved items like Vakantiegeld, Kinderbijslag
  history: BudgetHistoryItem[];
}

export const CURRENCY_FORMATTER = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});