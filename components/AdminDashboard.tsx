import React, { useState } from 'react';
import ManageVegetables from './ManageVegetables';
import TodaysDeliveries from './TodaysDeliveries';

interface AdminDashboardProps {
  onLogout: () => void;
}

type AdminTab = 'vegetables' | 'deliveries';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('vegetables');

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button 
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Logout
        </button>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('vegetables')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${activeTab === 'vegetables' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Manage Vegetables
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${activeTab === 'deliveries' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Today's Deliveries
          </button>
        </div>
      </nav>

      <main className="flex-grow overflow-y-auto p-4">
        {activeTab === 'vegetables' && <ManageVegetables />}
        {activeTab === 'deliveries' && <TodaysDeliveries />}
      </main>
    </div>
  );
};

export default AdminDashboard;
