import { Vegetable, User, Sale } from '../types';
import { VEGETABLES } from './vegetables';

const STORAGE_KEY = 'sabziMateDB';

// Define the shape of our entire database
interface DBState {
  vegetablesDB: Vegetable[];
  usersDB: User[];
  salesDB: Sale[];
  deliveryConfirmationsDB: User[];
  deliveryRejectionsDB: User[];
}

// Function to save the entire database to localStorage
export const setDB = (db: DBState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    console.error("Error saving to localStorage", error);
  }
};

// This function runs to set up the initial data if it's not already there
export const initializeDB = (): void => {
  if (localStorage.getItem(STORAGE_KEY)) {
    return;
  }
  
  console.log('Initializing database in localStorage for the first time...');

  const initialDB: DBState = {
    vegetablesDB: JSON.parse(JSON.stringify(VEGETABLES)),
    usersDB: [
        { name: 'Rohan Sharma', phone: '9876543210', address: '101, Sun Apartments, Mumbai' },
        { name: 'Priya Singh', phone: '9123456780', address: '202, Moon Towers, Delhi' },
    ],
    salesDB: [
        {
            userId: '9876543210', // Rohan Sharma
            date: '2024-07-28',
            items: [
                { vegetableId: 1, vegetableName: 'Tomato', quantity: '1kg', price: 40 },
                { vegetableId: 2, vegetableName: 'Potato', quantity: '500g', price: 15 }
            ],
            total: 55
        },
        {
            userId: '9123456780', // Priya Singh
            date: '2024-07-27',
            items: [
                { vegetableId: 3, vegetableName: 'Onion', quantity: '1kg', price: 35 }
            ],
            total: 35
        }
    ],
    deliveryConfirmationsDB: [],
    deliveryRejectionsDB: [],
  };

  setDB(initialDB);
};

// Function to get the entire database from localStorage
export const getDB = (): DBState => {
  // This is now self-healing. If the DB doesn't exist, it will be created.
  initializeDB(); 
  
  const dbString = localStorage.getItem(STORAGE_KEY);
  if (!dbString) {
    // This should only happen if localStorage is disabled or fails completely.
    throw new Error("Fatal: Could not read from localStorage after attempting to initialize.");
  }
  return JSON.parse(dbString);
};
