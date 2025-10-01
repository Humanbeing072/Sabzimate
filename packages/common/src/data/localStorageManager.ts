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
    const oldDB = localStorage.getItem(STORAGE_KEY);
    const newDB = JSON.stringify(db);
    localStorage.setItem(STORAGE_KEY, newDB);

    // This is the key part for cross-tab sync.
    // The native 'storage' event only fires for OTHER tabs.
    // It doesn't fire on the tab that made the change.
    // So, if the data actually changed, we dispatch a custom event
    // that the useLocalStorageSync hook can listen to on the *same* tab.
    if (oldDB !== newDB) {
      window.dispatchEvent(new Event('storage'));
    }

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
    // FIX: Added 'id' and other missing properties to user objects to conform to the User type.
    usersDB: [
        // FIX: Changed 'id' from number to string to match the User type.
        { id: '1', name: 'Rohan Sharma', phone: '9876543210', address: '101, Sun Apartments, Mumbai', email: null, googleId: null },
        // FIX: Changed 'id' from number to string to match the User type.
        { id: '2', name: 'Priya Singh', phone: '9123456780', address: '202, Moon Towers, Delhi', email: null, googleId: null },
    ],
    salesDB: [
        {
            userId: '9876543210', // Rohan Sharma
            date: '2024-07-28',
            items: [
                // FIX: Removed 'vegetableId' as it's not in the Sale item type.
                { vegetableName: 'Tomato', quantity: '1kg', price: 40 },
                // FIX: Removed 'vegetableId' as it's not in the Sale item type.
                { vegetableName: 'Potato', quantity: '500g', price: 15 }
            ],
            total: 55
        },
        {
            userId: '9123456780', // Priya Singh
            date: '2024-07-27',
            items: [
                // FIX: Removed 'vegetableId' as it's not in the Sale item type.
                { vegetableName: 'Onion', quantity: '1kg', price: 35 }
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