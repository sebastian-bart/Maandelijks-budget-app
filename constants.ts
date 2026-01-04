import { BudgetData } from './types';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate IDs for initial data
const generateId = () => Math.random().toString(36).substring(2, 9);

export const INITIAL_DATA: BudgetData = {
  income: [
    { id: generateId(), label: 'Salaris 1 (Netto)', amount: 2500 },
    { id: generateId(), label: 'Salaris 2 (Netto)', amount: 2200 },
    { id: generateId(), label: 'Kinderopvangtoeslag', amount: 800 },
    { id: generateId(), label: 'Kindgebonden budget', amount: 150 },
  ],
  expenses: [
    { id: generateId(), label: 'Kinderopvang / BSO', amount: 1200 },
    { id: generateId(), label: 'Hypotheek / Huur', amount: 1100 },
    { id: generateId(), label: 'Boodschappen', amount: 800 },
    { id: generateId(), label: 'Gas, Water, Licht', amount: 200 },
    { id: generateId(), label: 'Verzekeringen', amount: 150 },
    { id: generateId(), label: 'Internet & TV', amount: 60 },
  ],
  savings: [
    { id: generateId(), label: 'Kinderbijslag (per kwartaal)', amount: 300 },
    { id: generateId(), label: 'Vakantiegeld (reservering)', amount: 350 },
    { id: generateId(), label: 'Eindejaarsuitkering', amount: 100 },
  ],
  history: []
};