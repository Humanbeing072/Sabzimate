import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
)