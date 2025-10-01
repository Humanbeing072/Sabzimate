// FIX: Update import paths to use the common directory
import { BillEntry } from '../common/types';

export const BILLS: BillEntry[] = [
    { date: '2024-07-28', items: [{ name: 'Tomato', quantity: 1, price: 40 }, { name: 'Potato', quantity: 2, price: 60 }], total: 100 },
    { date: '2024-07-27', items: [{ name: 'Onion', quantity: 1.5, price: 52.5 }], total: 52.5 },
    { date: '2024-07-25', items: [{ name: 'Carrot', quantity: 0.5, price: 25 }, { name: 'Spinach', quantity: 1, price: 20 }], total: 45 },
    { date: '2024-07-24', items: [{ name: 'Tomato', quantity: 2, price: 80 }, { name: 'Cauliflower', quantity: 1, price: 45 }], total: 125 },
    { date: '2024-07-22', items: [{ name: 'Potato', quantity: 3, price: 90 }], total: 90 },
];