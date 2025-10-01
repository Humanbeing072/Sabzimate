import React, { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';

const AdminApp: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleAdminLogin = () => {
    setIsLoggedIn(true);
  }
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  }
  
  const renderContent = () => {
      if (isLoggedIn) {
          return <AdminDashboard onLogout={handleLogout} />;
      }
      return <AdminLogin onAdminLogin={handleAdminLogin} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
        {renderContent()}
    </div>
  );
};

export default AdminApp;
