import { initializeDB } from './localStorageManager';

// Initialize the database in localStorage when the app loads.
// This ensures that there's a single source of truth for all browser tabs.
initializeDB();
