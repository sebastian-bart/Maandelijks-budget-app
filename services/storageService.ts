import { BudgetData } from '../types';
import { INITIAL_DATA } from '../constants';

const STORAGE_KEY = 'gezinsbudget_v1';

export const loadBudgetData = (): BudgetData => {
  try {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData === null) {
      return INITIAL_DATA;
    }
    return JSON.parse(serializedData);
  } catch (err) {
    console.error("Error loading data from localStorage", err);
    return INITIAL_DATA;
  }
};

export const saveBudgetData = (data: BudgetData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Error saving data to localStorage", err);
  }
};

export const resetToDefaults = (): BudgetData => {
    localStorage.removeItem(STORAGE_KEY);
    return INITIAL_DATA;
}