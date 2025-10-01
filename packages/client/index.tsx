import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { initializeDB } from './src/common/data/localStorageManager';

// Initialize the local storage DB on app start
initializeDB();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);